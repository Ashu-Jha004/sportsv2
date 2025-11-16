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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LocationFormValues = OnboardingLocationDTO;

export default function StepLocation() {
  const { location, updateLocation, prevStep } = useOnboardingStore();
  const [geoLoading, setGeoLoading] = useState(false);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(OnboardingLocationSchema),
    defaultValues: {
      country: location.country ?? "",
      state: location.state ?? "",
      city: location.city ?? "",
      latitude: location.latitude ?? 0,
      longitude: location.longitude ?? 0,
    },
    mode: "onChange",
  });

  const handleUseCurrentLocation = useCallback(() => {
    if (geoLoading) return;

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        form.setValue("latitude", latitude, {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("longitude", longitude, {
          shouldDirty: true,
          shouldValidate: true,
        });

        setGeoLoading(false);
      },
      (error) => {
        console.error("Error getting user location:", error);
        setGeoLoading(false);
      },
    );
  }, [form, geoLoading]);

  const onSubmit = (values: LocationFormValues) => {
    updateLocation(values);
    // The wizard container will trigger final submit,
    // so we just persist to store here.
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="India" {...field} />
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
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Uttar Pradesh" {...field} />
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
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Lucknow" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
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
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button type="button" variant="outline" onClick={prevStep}>
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
            >
              {geoLoading ? "Locating..." : "Use current location"}
            </Button>

            <Button type="submit" disabled={!form.formState.isValid}>
              Save location
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
