"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calculator, Info } from "lucide-react";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";
import {
  calculateBMI,
  getBMIClassification,
} from "@/lib/calculations/stats-calculations";
import type { BasicPhysicalMeasurements } from "@/types/stats/athlete-stats.types";

// Validation schema
const basicMeasurementsSchema = z.object({
  height: z
    .number({ error: "Height is required" })
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be less than 250 cm"),
  weight: z
    .number({ error: "Weight is required" })
    .min(30, "Weight must be at least 30 kg")
    .max(300, "Weight must be less than 300 kg"),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(5, "Age must be at least 5 years")
    .max(100, "Age must be less than 100 years"),
  bodyFat: z
    .number({ error: "Body fat percentage is required" })
    .min(3, "Body fat must be at least 3%")
    .max(50, "Body fat must be less than 50%"),
});

type BasicMeasurementsFormData = z.infer<typeof basicMeasurementsSchema>;

type BasicMeasurementsFormProps = {
  onComplete: () => void;
};

export function BasicMeasurementsForm({
  onComplete,
}: BasicMeasurementsFormProps) {
  const guide = useStatsWizardStore((s) => s.guide);
  const basicMeasurements = useStatsWizardStore((s) => s.basicMeasurements);
  const updateBasicMeasurements = useStatsWizardStore(
    (s) => s.updateBasicMeasurements
  );
  const markStepComplete = useStatsWizardStore((s) => s.markStepComplete);

  // Initialize form with existing data or defaults
  const form = useForm<BasicMeasurementsFormData>({
    resolver: zodResolver(basicMeasurementsSchema),
    defaultValues: {
      height: basicMeasurements?.height || undefined,
      weight: basicMeasurements?.weight || undefined,
      age: basicMeasurements?.age || undefined,
      bodyFat: basicMeasurements?.bodyFat || undefined,
    },
  });

  const watchHeight = form.watch("height");
  const watchWeight = form.watch("weight");

  // Calculate BMI in real-time
  const calculatedBMI =
    watchHeight && watchWeight ? calculateBMI(watchWeight, watchHeight) : null;

  const bmiClassification = calculatedBMI
    ? getBMIClassification(calculatedBMI)
    : null;

  // Update BMI display when height or weight changes
  useEffect(() => {
    if (calculatedBMI !== null && process.env.NODE_ENV === "development") {
      console.debug("[BasicMeasurementsForm] BMI calculated:", calculatedBMI);
    }
  }, [calculatedBMI]);

  const onSubmit = (data: BasicMeasurementsFormData) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.debug("[BasicMeasurementsForm] Submitting data:", data);
      }

      if (!guide) {
        throw new Error("Guide information is missing");
      }

      // Calculate BMI
      const bmi = calculateBMI(data.weight, data.height);

      // Prepare complete measurements
      const measurements: BasicPhysicalMeasurements = {
        height: data.height,
        weight: data.weight,
        age: data.age,
        bodyFat: data.bodyFat,
        bodyMassIndex: bmi,
        measuredAt: new Date().toISOString(),
        measuredBy: guide.id,
      };

      // Update store
      updateBasicMeasurements(measurements);

      // Mark step as complete
      markStepComplete(2);

      if (process.env.NODE_ENV === "development") {
        console.info(
          "[BasicMeasurementsForm] Measurements saved successfully",
          measurements
        );
      }

      // Proceed to next step
      onComplete();
    } catch (error) {
      console.error(
        "[BasicMeasurementsForm] Error saving measurements:",
        error
      );

      // Show error to user
      form.setError("root", {
        type: "manual",
        message:
          process.env.NODE_ENV === "development"
            ? `Failed to save measurements: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            : "Failed to save measurements. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Basic Physical Measurements
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the athlete's measurements. BMI will be calculated
          automatically.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Measurements Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Body Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Height and Weight */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 175"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measured without shoes, in centimeters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 70"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measured in minimal clothing, in kilograms
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Age and Body Fat */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 25"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Athlete's current age in years
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bodyFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Fat (%) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 15"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measured using calipers or impedance scale
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* BMI Display */}
              {calculatedBMI !== null && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Calculator className="h-4 w-4 text-primary" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        Calculated BMI: {calculatedBMI}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Classification: {bmiClassification}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      Auto-calculated
                    </Badge>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              All measurements should be taken 2-3 times and averaged for
              accuracy. BMI is automatically calculated using the formula:
              weight (kg) / (height (m))²
            </AlertDescription>
          </Alert>

          {/* Form Error */}
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="gap-2"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save & Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
