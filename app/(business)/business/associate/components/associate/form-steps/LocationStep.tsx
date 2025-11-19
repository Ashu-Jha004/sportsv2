"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssociateStore } from "@/stores/associate/associate-store";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { getCompleteLocation, reverseGeocode } from "@/lib/utils/geolocation";
import { toast } from "sonner";

const locationSchema = z.object({
  workCountry: z
    .string()
    .min(2, "Country is required")
    .max(100, "Country name too long"),
  workState: z
    .string()
    .min(2, "State is required")
    .max(100, "State name too long"),
  workCity: z
    .string()
    .min(2, "City is required")
    .max(100, "City name too long"),
  workLatitude: z
    .number({
      error: "Location is required",
    })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  workLongitude: z
    .number({
      error: "Location is required",
    })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function LocationStep({ onValidationChange }: LocationStepProps) {
  const {
    formData,
    updateField,
    isDetectingLocation,
    setIsDetectingLocation,
    locationError,
    setLocationError,
  } = useAssociateStore();
  const [hasDetected, setHasDetected] = useState(false);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      workCountry: formData.workCountry || "",
      workState: formData.workState || "",
      workCity: formData.workCity || "",
      workLatitude: formData.workLatitude || undefined,
      workLongitude: formData.workLongitude || undefined,
    },
    mode: "onChange",
  });

  const { watch, formState, setValue } = form;

  // Watch individual fields instead of all at once
  const workCountry = watch("workCountry");
  const workState = watch("workState");
  const workCity = watch("workCity");
  const workLatitude = watch("workLatitude");
  const workLongitude = watch("workLongitude");

  useEffect(() => {
    onValidationChange(formState.isValid);
  }, [formState.isValid, onValidationChange]);

  // Separate useEffect for each field to prevent infinite loop
  useEffect(() => {
    if (workCountry !== undefined) {
      updateField("workCountry", workCountry);
    }
  }, [workCountry]); // Remove updateField from dependencies

  useEffect(() => {
    if (workState !== undefined) {
      updateField("workState", workState);
    }
  }, [workState]);

  useEffect(() => {
    if (workCity !== undefined) {
      updateField("workCity", workCity);
    }
  }, [workCity]);

  useEffect(() => {
    if (workLatitude !== undefined) {
      updateField("workLatitude", workLatitude);
    }
  }, [workLatitude]);

  useEffect(() => {
    if (workLongitude !== undefined) {
      updateField("workLongitude", workLongitude);
    }
  }, [workLongitude]);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    setHasDetected(false);

    try {
      const location = await getCompleteLocation();

      // Update all fields
      setValue("workLatitude", location.latitude);
      setValue("workLongitude", location.longitude);
      setValue("workCountry", location.country);
      setValue("workState", location.state);
      setValue("workCity", location.city);

      setHasDetected(true);
      toast.success("Location detected successfully!");
    } catch (error: any) {
      console.error("Location detection error:", error);
      setLocationError(error.message);
      toast.error(error.message || "Failed to detect location");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleManualCoordinates = async () => {
    const lat = form.getValues("workLatitude");
    const lng = form.getValues("workLongitude");

    if (!lat || !lng) {
      toast.error("Please enter both latitude and longitude");
      return;
    }

    setIsDetectingLocation(true);
    try {
      const address = await reverseGeocode(lat, lng);
      setValue("workCountry", address.country);
      setValue("workState", address.state);
      setValue("workCity", address.city);
      toast.success("Address filled from coordinates!");
    } catch (error: any) {
      toast.error("Failed to get address from coordinates");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Work Location
        </h2>
        <p className="text-gray-600">
          Where are you primarily based for your coaching/mentoring activities?
        </p>
      </div>

      {/* Location Detection Button */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">
              Detect Location Automatically
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              We'll use your browser's location to automatically fill in your
              address
            </p>
            <Button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDetectingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Detect My Location
                </>
              )}
            </Button>
          </div>
        </div>

        {locationError && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or enter manually</span>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="workLatitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="19.0760"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? undefined : value);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workLongitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="72.8777"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? undefined : value);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleManualCoordinates}
            disabled={
              !form.getValues("workLatitude") ||
              !form.getValues("workLongitude") ||
              isDetectingLocation
            }
            className="w-full"
          >
            Fill Address from Coordinates
          </Button>

          {/* Address Fields */}
          <FormField
            control={form.control}
            name="workCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Region *</FormLabel>
                <FormControl>
                  <Input placeholder="Maharashtra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <FormControl>
                  <Input placeholder="India" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Visual Feedback */}
      {formState.isValid && hasDetected && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Location saved!</span>
        </div>
      )}
    </div>
  );
}
