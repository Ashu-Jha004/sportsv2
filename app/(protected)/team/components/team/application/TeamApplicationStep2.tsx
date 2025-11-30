// components/team/application/TeamApplicationStep2.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { teamApplicationStep2Schema } from "../../../lib/validations/team";
import { useTeamApplicationStore } from "@/stores/team/creation/use-team-application-store";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { toast } from "sonner";

export function TeamApplicationStep2() {
  const { formData, setFormData, nextStep, prevStep } =
    useTeamApplicationStore();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const form = useForm({
    resolver: zodResolver(teamApplicationStep2Schema),
    defaultValues: {
      country: formData.country || "",
      state: formData.state || "",
      city: formData.city || "",
      latitude: formData.latitude || undefined,
      longitude: formData.longitude || undefined,
    },
  });

  const useCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude);
          form.setValue("longitude", position.coords.longitude);
          toast.success("Location captured successfully");
          console.log("[LOCATION] Captured:", position.coords);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("[LOCATION_ERROR]", error);
          toast.error("Unable to get location. Please enter manually.");
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation not supported by your browser");
      setIsLoadingLocation(false);
    }
  }, [form]);

  const onSubmit = useCallback(
    (data: any) => {
      console.log("[STEP_2] Form data:", data);
      setFormData(data);
      nextStep();
    },
    [setFormData, nextStep]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., India" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Maharashtra" {...field} />
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
                  <Input placeholder="e.g., Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-900">
            <MapPin className="h-4 w-4" />
            Precise Location (Optional)
          </div>
          <p className="mb-3 text-xs text-blue-700">
            Help guides find you faster by sharing your coordinates
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useCurrentLocation}
            disabled={isLoadingLocation}
            className="gap-2"
          >
            {isLoadingLocation ? "Getting location..." : "Use Current Location"}
          </Button>
          {form.watch("latitude") && form.watch("longitude") && (
            <p className="mt-2 text-xs text-green-700">
              ✓ Location captured: {form.watch("latitude")?.toFixed(4)},{" "}
              {form.watch("longitude")?.toFixed(4)}
            </p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={prevStep}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button type="submit" size="lg" className="gap-2">
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
