// src/features/onboarding/components/steps/StepLocation.tsx
"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OnboardingLocationSchema,
  type OnboardingLocationDTO,
} from "@/lib/validations/onboarding/onboarding.dto";
import { useOnboardingStore } from "@/stores/onboarding/store";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Loader2,
  Navigation,
  Globe,
  CheckCircle2,
  AlertCircle,
  ArrowRight, // Added for Next button
} from "lucide-react";

type LocationFormValues = OnboardingLocationDTO;

export default function StepLocation() {
  const { location, updateLocation, nextStep } = useOnboardingStore(); // Assuming nextStep exists
  const [geoLoading, setGeoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for form submission
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoSuccess, setGeoSuccess] = useState(false);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(OnboardingLocationSchema),
    defaultValues: {
      // Use empty string for text fields, and 0 for number fields (or null if the schema allows)
      country: location.country ?? "",
      state: location.state ?? "",
      city: location.city ?? "",
      latitude: location.latitude ?? 0,
      longitude: location.longitude ?? 0,
    },
    mode: "onBlur", // Changed to onBlur for better performance/less re-render, or keep onChange if preferred
  });

  // Type-safe handling of field updates to the Zustand store
  const handleFieldUpdate = useCallback(
    (
      field: keyof LocationFormValues,
      value: LocationFormValues[typeof field]
    ) => {
      // Coerce value types if necessary before updating the store
      const updatedValue =
        field === "latitude" || field === "longitude"
          ? value === ""
            ? 0
            : Number(value) // Ensure 0 is saved for empty coordinate
          : value;

      updateLocation({ [field]: updatedValue });
    },
    [updateLocation]
  );

  const onSubmit = useCallback(
    async (data: LocationFormValues) => {
      setIsSubmitting(true);
      try {
        // Optional: Perform any final validation or API call here
        console.log("Form submitted, saving final location data:", data);

        // Ensure the latest form data is in the store, though it should be
        updateLocation(data);

        // Move to the next step
        // await nextStep(); // Uncomment if nextStep is an async action
        nextStep();
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateLocation, nextStep] // Added nextStep to dependency array
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (geoLoading) return;

    setGeoError(null);
    setGeoSuccess(false);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Call reverse geocoding API
          const response = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );

          if (!response.ok) {
            throw new Error("Failed to get location details (Status not OK)");
          }

          const data = await response.json();

          if (data.success && data.location) {
            // Update react-hook-form state
            form.setValue("latitude", data.location.latitude, {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue("longitude", data.location.longitude, {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue("country", data.location.country, {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue("state", data.location.state, {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue("city", data.location.city, {
              shouldDirty: true,
              shouldValidate: true,
            });

            // Update store immediately with all received data
            updateLocation({
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              country: data.location.country,
              state: data.location.state,
              city: data.location.city,
            });

            setGeoSuccess(true);
            setGeoError(null);
          } else {
            // Handle case where API succeeds but returns an error/no location
            throw new Error(
              data.error || "Failed to get location details from server."
            );
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred during reverse geocoding. Please enter manually.";
          setGeoError(message);

          // Still set coordinates in form and store even if reverse geocoding fails
          form.setValue("latitude", latitude, {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.setValue("longitude", longitude, {
            shouldDirty: true,
            shouldValidate: true,
          });

          // Update store with coordinates only
          updateLocation({ latitude, longitude });
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);

        let errorMessage = "Failed to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        setGeoError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [form, geoLoading, updateLocation]); // Removed handleFieldUpdate as it is replaced by direct updateLocation

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Location</h2>
          <p className="mt-1 text-sm text-slate-600">
            Help us connect you with local training facilities and competitions.
          </p>
        </div>

        {/* Auto-detect Location Button */}
        <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-linear-to-br from-emerald-50 to-teal-50 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Navigation className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-slate-900">
                Auto-Detect Location
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                We'll automatically fill in your location details using your
                device's GPS.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geoLoading || isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {geoLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Use Current Location
                </>
              )}
            </Button>

            {/* Success Message */}
            {geoSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Location detected successfully!
              </div>
            )}

            {/* Error Message */}
            {geoError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{geoError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Manual Entry Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-slate-500">
              Or enter manually
            </span>
          </div>
        </div>

        {/* Location Fields */}
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">
                    Country
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="India"
                      className="rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        handleFieldUpdate("country", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">
                    State / Region
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Uttar Pradesh"
                      className="rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        handleFieldUpdate("state", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">
                    City
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lucknow"
                      className="rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        handleFieldUpdate("city", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Coordinates (Hidden by default, shown when filled) */}
          {(form.watch("latitude") !== 0 || form.watch("longitude") !== 0) && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-600" />
                <p className="text-sm font-semibold text-slate-700">
                  GPS Coordinates
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-600">
                        Latitude
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          className="rounded-lg border-slate-300 bg-white text-sm focus:border-emerald-500 focus:ring-emerald-500"
                          {...field}
                          value={field.value === 0 ? "" : field.value} // Display empty string for 0
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          onBlur={(e) => {
                            field.onBlur();
                            handleFieldUpdate(
                              "latitude",
                              e.target.value === "" ? 0 : Number(e.target.value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-600">
                        Longitude
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          className="rounded-lg border-slate-300 bg-white text-sm focus:border-emerald-500 focus:ring-emerald-500"
                          {...field}
                          value={field.value === 0 ? "" : field.value} // Display empty string for 0
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          onBlur={(e) => {
                            field.onBlur();
                            handleFieldUpdate(
                              "longitude",
                              e.target.value === "" ? 0 : Number(e.target.value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription className="mt-2 text-xs text-slate-500">
                These coordinates are automatically detected or can be manually
                adjusted.
              </FormDescription>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 p-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                Privacy & Location
              </h3>
              <p className="mt-1 text-sm text-slate-700">
                Your location helps us recommend nearby training facilities,
                competitions, and connect you with local athletes. We respect
                your privacy and never share your exact coordinates publicly.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
