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
import {
  Loader2,
  Calculator,
  Info,
  User,
  Armchair,
  Activity,
} from "lucide-react";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";
import {
  calculateBMI,
  getBMIClassification,
} from "@/lib/calculations/stats-calculations";
import type { BasicPhysicalMeasurements } from "@/types/stats/athlete-stats.types";

/**
 * Zod schema for basic measurements.
 * - bodyMassIndex is optional because we auto-calculate it.
 * - Using `error` for clearer messages.
 */
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
    .int()
    .min(5, "Age must be at least 5 years")
    .max(100, "Age must be less than 100 years"),

  bodyFat: z
    .number({ error: "Body fat percentage is required" })
    .min(3, "Body fat must be at least 3%")
    .max(50, "Body fat must be less than 50%"),

  neckCircumference: z
    .number({ error: "Neck circumference is required" })
    .min(20, "Neck circumference must be at least 20 cm")
    .max(70, "Neck circumference must be less than 70 cm"),

  waistCircumference: z
    .number({ error: "Waist circumference is required" })
    .min(50, "Waist circumference must be at least 50 cm")
    .max(200, "Waist circumference must be less than 200 cm"),

  calfCircumference: z
    .number({ error: "Calf circumference is required" })
    .min(25, "Calf circumference must be at least 25 cm")
    .max(60, "Calf circumference must be less than 60 cm"),

  bicepsCircumference: z
    .number({ error: "Biceps circumference is required" })
    .min(22, "Biceps circumference must be at least 22 cm")
    .max(60, "Biceps circumference must be less than 60 cm"),

  thighCircumference: z
    .number({ error: "Thigh circumference is required" })
    .min(40, "Thigh circumference must be at least 40 cm")
    .max(100, "Thigh circumference must be less than 100 cm"),

  armSpan: z
    .number({ error: "Arm span is required" })
    .min(130, "Arm span must be at least 130 cm")
    .max(250, "Arm span must be less than 250 cm"),

  legLength: z
    .number({ error: "Leg length is required" })
    .min(65, "Leg length must be at least 65 cm")
    .max(130, "Leg length must be less than 130 cm"),

  // Auto-calculated; optional in schema (we set it ourselves)
  bodyMassIndex: z
    .number()
    .min(3, "BMI seems too low")
    .max(204, "BMI too large")
    .optional(),
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
      height: basicMeasurements?.height ?? undefined,
      weight: basicMeasurements?.weight ?? undefined,
      age: basicMeasurements?.age ?? undefined,
      bodyFat: basicMeasurements?.bodyFat ?? undefined,
      neckCircumference: basicMeasurements?.neckCircumference ?? undefined,
      waistCircumference: basicMeasurements?.waistCircumference ?? undefined,
      calfCircumference: basicMeasurements?.calfCircumference ?? undefined,
      bicepsCircumference: basicMeasurements?.bicepsCircumference ?? undefined,
      thighCircumference: basicMeasurements?.thighCircumference ?? undefined,
      armSpan: basicMeasurements?.armSpan ?? undefined,
      legLength: basicMeasurements?.legLength ?? undefined,
      bodyMassIndex: basicMeasurements?.bodyMassIndex ?? undefined,
    },
  });

  // Read height & weight live
  const watchHeight = form.watch("height");
  const watchWeight = form.watch("weight");

  // Recompute BMI whenever height or weight change
  useEffect(() => {
    if (!watchHeight || !watchWeight) {
      // If either value is missing, clear BMI in form
      form.setValue("bodyMassIndex", undefined, {
        shouldValidate: false,
        shouldDirty: true,
      });
      return;
    }

    const bmi = calculateBMI(watchWeight, watchHeight);
    // Round to 1 decimal for display
    const rounded = Math.round(bmi * 10) / 10;
    form.setValue("bodyMassIndex", rounded, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (process.env.NODE_ENV === "development") {
      console.debug("[BasicMeasurementsForm] BMI updated:", rounded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchHeight, watchWeight]);

  const bmiClassification = form.watch("bodyMassIndex")
    ? getBMIClassification(form.watch("bodyMassIndex") as number)
    : null;

  const onSubmit = (data: BasicMeasurementsFormData) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.debug("[BasicMeasurementsForm] Submitting data:", data);
      }

      if (!guide) throw new Error("Guide information is missing");

      // Ensure BMI is present (should be because of effect)
      const bmi = data.bodyMassIndex ?? calculateBMI(data.weight, data.height);

      const measurements: BasicPhysicalMeasurements | any = {
        height: data.height,
        weight: data.weight,
        age: data.age,
        bodyFat: data.bodyFat,
        bodyMassIndex: bmi,
        neckCircumference: data.neckCircumference,
        waistCircumference: data.waistCircumference,
        calfCircumference: data.calfCircumference,
        bicepsCircumference: data.bicepsCircumference,
        thighCircumference: data.thighCircumference,
        armSpan: data.armSpan,
        legLength: data.legLength,
        measuredAt: new Date().toISOString(),
        measuredBy: guide.id,
      };

      updateBasicMeasurements(measurements);
      markStepComplete(2);
      onComplete();

      if (process.env.NODE_ENV === "development") {
        console.info(
          "[BasicMeasurementsForm] Measurements saved",
          measurements
        );
      }
    } catch (err) {
      console.error("[BasicMeasurementsForm] Error saving measurements:", err);
      form.setError("root", {
        type: "manual",
        message:
          err instanceof Error
            ? `Failed to save measurements: ${err.message}`
            : "Failed to save measurements. Please try again.",
      });
    }
  };

  // helper to parse numeric input onChange
  const handleNumberChange =
    (fieldOnChange: (v: number | undefined) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      fieldOnChange(v !== "" ? parseFloat(v) : undefined);
    };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Basic Physical Measurements
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the athlete's measurements. BMI is calculated automatically.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Card: Body Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Body Stats
                <Badge className="ml-auto" variant="secondary">
                  Required
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Height */}
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 175"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measured without shoes, in centimeters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weight */}
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 70"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
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

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Age */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 25"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined
                            )
                          }
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Athlete's current age in years
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Body Fat */}
                <FormField
                  control={form.control}
                  name="bodyFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Fat (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 15"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
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

              {/* BMI display */}
              <div>
                <Alert className="border-primary/20 bg-primary/5">
                  <Calculator className="h-4 w-4 text-primary" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        Calculated BMI: {form.watch("bodyMassIndex") ?? "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Classification: {bmiClassification ?? "—"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      Auto-calculated
                    </Badge>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Card: Upper Body */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Armchair className="h-5 w-5" /> Upper Body
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Neck */}
                <FormField
                  control={form.control}
                  name="neckCircumference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neck Circumference (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 38"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measured at the base of the neck
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Biceps */}
                <FormField
                  control={form.control}
                  name="bicepsCircumference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biceps (flexed) (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 32"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measure around the largest part of the upper arm
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card: Core & Lower Body */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" /> Core & Lower Body
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Waist */}
                <FormField
                  control={form.control}
                  name="waistCircumference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist Circumference (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 82"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measure at the narrowest point or navel depending on
                        protocol
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Thigh */}
                <FormField
                  control={form.control}
                  name="thighCircumference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thigh Circumference (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 55"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measured around the largest part of the thigh
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Calf */}
                <FormField
                  control={form.control}
                  name="calfCircumference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calf Circumference (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 37"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Measure around the widest part of the calf
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Leg length */}
                <FormField
                  control={form.control}
                  name="legLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leg Length (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 90"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Hip (ASIS) to floor measurement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card: Reach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Reach & Span
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="armSpan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arm Span (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 180"
                          step="0.1"
                          {...field}
                          onChange={handleNumberChange(field.onChange)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Fingertip to fingertip, arms outstretched
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* BMI read-only field (also shown in alert above) */}
                <FormField
                  control={form.control}
                  name="bodyMassIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BMI (auto)</FormLabel>
                      <FormControl>
                        <Input type="text" readOnly value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        Auto-calculated from weight and height
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Take each measurement 2-3 times and use the average. BMI = weight
              (kg) / (height (m))²
            </AlertDescription>
          </Alert>

          {/* Form-level errors */}
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit */}
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
