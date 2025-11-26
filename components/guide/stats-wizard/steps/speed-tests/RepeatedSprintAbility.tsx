"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Zap,
  TrendingDown,
  Activity,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

/* ============================
   ZOD SCHEMA
============================ */

const sprintSchema = z.object({
  sprintNumber: z.number().min(1).max(10),
  time: z.number().min(0.1).max(15),
  recoveryType: z.enum(["passive", "active"]).default("passive"),
});

const repeatedSprintAbilitySchema = z.object({
  protocol: z.enum(["6x30m", "8x20m", "10x20m"]).default("6x30m"),
  distance: z.number().min(20).max(50),
  numberOfSprints: z.number().min(3).max(10),
  recoveryDuration: z.number().min(10).max(60),
  recoveryType: z.enum(["passive", "active"]).default("passive"),
  bodyWeight: z.number().min(20).max(200).optional(),
  sprints: z.array(sprintSchema).min(3),
  environmentConditions: z.string().optional(),
  athleteCondition: z.enum(["fresh", "fatigued", "normal"]).default("normal"),
  notes: z.string().optional(),
});

type RepeatedSprintAbilityData = z.infer<typeof repeatedSprintAbilitySchema>;

type Props = {
  initialData?: Partial<RepeatedSprintAbilityData>;
  onSave: (data: any) => void;
};

/* ============================
   CALCULATED METRICS TYPE
============================ */

type CalculatedMetrics = {
  // Time metrics
  bestTime: number | null;
  worstTime: number | null;
  totalTime: number | null;
  averageTime: number | null;

  // Fatigue indices
  fatigueIndex: number | null; // (AvgFirst3 / AvgLast3) × 100
  sprintDecrement: number | null; // Sdec = 100 - ((best × n) / total) × 100
  fatigueSlopePercentage: number | null;

  // Power and performance
  meanPower: number | null; // watts
  peakPower: number | null; // watts
  powerDecrement: number | null;

  // Performance rating
  rsaRating: string;
  fatigueResistance: string;
};

/* ============================
   HELPER FUNCTIONS
============================ */

function calculateRSAMetrics(
  sprints: any[],
  bodyWeight?: number
): CalculatedMetrics {
  if (sprints.length < 3) {
    return {
      bestTime: null,
      worstTime: null,
      totalTime: null,
      averageTime: null,
      fatigueIndex: null,
      sprintDecrement: null,
      fatigueSlopePercentage: null,
      meanPower: null,
      peakPower: null,
      powerDecrement: null,
      rsaRating: "Insufficient data",
      fatigueResistance: "N/A",
    };
  }

  const times = sprints.map((s) => s.time).sort((a, b) => a - b);
  const bestTime = times[0];
  const worstTime = times[times.length - 1];
  const totalTime = times.reduce((a, b) => a + b, 0);
  const averageTime = totalTime / times.length;

  // Fatigue Index (FI%) = (Average of first 3 / Average of last 3) × 100
  const first3Avg = times.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const last3Avg = times.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const fatigueIndex = (first3Avg / last3Avg) * 100;

  // Sprint Decrement (Sdec%) = 100 - ((best × n) / total) × 100
  const sprintDecrement = 100 - ((bestTime * times.length) / totalTime) * 100;

  // Fatigue Slope (linear regression of fatigue across sprints)
  const n = times.length;
  const xSum = (n * (n + 1)) / 2;
  const ySum = totalTime;
  const xySum = times.reduce((sum, t, i) => sum + t * (i + 1), 0);
  const x2Sum = (n * (n + 1) * (2 * n + 1)) / 6;
  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  const fatigueSlopePercentage = (slope / bestTime) * 100;

  // Power calculations (Distance = 30m assumed for calculations)
  const distance = 30; // meters
  let meanPower = null;
  let peakPower = null;

  if (bodyWeight) {
    // Power (W) = (mass × distance²) / (time³)
    const powers = times.map(
      (t) => (bodyWeight * distance * distance) / (t * t * t)
    );
    meanPower = Math.round(powers.reduce((a, b) => a + b, 0) / powers.length);
    peakPower = Math.round(Math.max(...powers));
  }

  const powerDecrement = peakPower && meanPower ? peakPower - meanPower : null;

  // RSA Rating based on Fatigue Index
  let rsaRating = "Poor";
  if (fatigueIndex >= 95) rsaRating = "Excellent";
  else if (fatigueIndex >= 90) rsaRating = "Very Good";
  else if (fatigueIndex >= 85) rsaRating = "Good";
  else if (fatigueIndex >= 80) rsaRating = "Fair";
  else rsaRating = "Poor";

  // Fatigue Resistance (based on sprint decrement)
  let fatigueResistance = "Poor";
  if (sprintDecrement <= 5) fatigueResistance = "Excellent";
  else if (sprintDecrement <= 10) fatigueResistance = "Very Good";
  else if (sprintDecrement <= 15) fatigueResistance = "Good";
  else if (sprintDecrement <= 20) fatigueResistance = "Fair";
  else fatigueResistance = "Poor";

  return {
    bestTime: Math.round(bestTime * 100) / 100,
    worstTime: Math.round(worstTime * 100) / 100,
    totalTime: Math.round(totalTime * 100) / 100,
    averageTime: Math.round(averageTime * 100) / 100,
    fatigueIndex: Math.round(fatigueIndex * 10) / 10,
    sprintDecrement: Math.round(sprintDecrement * 10) / 10,
    fatigueSlopePercentage: Math.round(fatigueSlopePercentage * 10) / 10,
    meanPower,
    peakPower,
    powerDecrement,
    rsaRating,
    fatigueResistance,
  };
}

function getRatingColor(metric: string, value: number | string | null): string {
  if (value === null) return "bg-gray-100";

  if (typeof value === "string") {
    if (value === "Excellent") return "bg-emerald-100 text-emerald-900";
    if (value === "Very Good") return "bg-green-100 text-green-900";
    if (value === "Good") return "bg-blue-100 text-blue-900";
    if (value === "Fair") return "bg-amber-100 text-amber-900";
    return "bg-red-100 text-red-900";
  }

  return "bg-gray-100";
}

/* ============================
   MAIN COMPONENT
============================ */

export function RepeatedSprintAbilityForm({ initialData, onSave }: Props) {
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(repeatedSprintAbilitySchema),
    defaultValues: {
      protocol: initialData?.protocol ?? "6x30m",
      distance: initialData?.distance ?? 30,
      numberOfSprints: initialData?.numberOfSprints ?? 6,
      recoveryDuration: initialData?.recoveryDuration ?? 20,
      recoveryType: initialData?.recoveryType ?? "passive",
      bodyWeight: initialData?.bodyWeight,
      athleteCondition: initialData?.athleteCondition ?? "normal",
      environmentConditions: initialData?.environmentConditions ?? "",
      notes: initialData?.notes ?? "",
      sprints: initialData?.sprints ?? [
        { sprintNumber: 1, time: 0, recoveryType: "passive" },
        { sprintNumber: 2, time: 0, recoveryType: "passive" },
        { sprintNumber: 3, time: 0, recoveryType: "passive" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sprints",
  });

  const sprintsData = form.watch("sprints");
  const numberOfSprints = form.watch("numberOfSprints");
  const bodyWeight = form.watch("bodyWeight");

  // Calculate metrics whenever sprints change
  const metrics = useMemo(() => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 300);
    return calculateRSAMetrics(sprintsData, bodyWeight);
  }, [sprintsData, bodyWeight]);

  // Auto-add/remove sprint fields based on numberOfSprints
  useEffect(() => {
    const currentCount = fields.length;
    if (currentCount < numberOfSprints) {
      for (let i = currentCount; i < numberOfSprints; i++) {
        append({
          sprintNumber: i + 1,
          time: 0,
          recoveryType: "passive",
        });
      }
    } else if (currentCount > numberOfSprints) {
      for (let i = numberOfSprints; i < currentCount; i++) {
        remove(i);
      }
    }
  }, [numberOfSprints, fields.length, append, remove]);

  const onSubmit = (data: RepeatedSprintAbilityData) => {
    try {
      const payload = {
        ...data,
        calculated: metrics,
        recordedAt: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.debug("[RepeatedSprintAbilityForm] Submitting data:", payload);
      }

      onSave(payload);
    } catch (err) {
      console.error("[RepeatedSprintAbilityForm] Error saving:", err);
      form.setError("root", {
        type: "manual",
        message: "Failed to save RSA test data",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Repeated Sprint Ability Test
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Comprehensive assessment of sprint repeatability and fatigue
          resistance. Measure your ability to maintain high-intensity efforts
          with minimal recovery.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Protocol Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" /> Test Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="protocol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protocol</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6x30m">
                            6×30m (20s recovery)
                          </SelectItem>
                          <SelectItem value="8x20m">
                            8×20m (20s recovery)
                          </SelectItem>
                          <SelectItem value="10x20m">
                            10×20m (15s recovery)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Recommended: 6×30m for general athletes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance per Sprint (m)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          min="20"
                          max="50"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
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
                  name="recoveryDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Duration (s)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="5"
                          min="10"
                          max="60"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>Time between sprints</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="numberOfSprints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Sprints</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="3"
                          max="10"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined
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
                  name="recoveryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="passive">
                            Passive (Standing/Walking)
                          </SelectItem>
                          <SelectItem value="active">
                            Active (Light Jogging)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Recovery method between sprints
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Athlete Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Athlete Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bodyWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min="20"
                          max="200"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Required for power calculations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="athleteCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Athlete Condition</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fresh">
                            Fresh (Well Rested)
                          </SelectItem>
                          <SelectItem value="normal">
                            Normal (Regular Training)
                          </SelectItem>
                          <SelectItem value="fatigued">
                            Fatigued (Post-Training)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="environmentConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Indoor court, 22°C, humid, good lighting"
                        rows={2}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Temperature, humidity, surface, lighting, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sprint Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Sprint Times (seconds)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-2">
                Enter the time for each sprint. Each sprint starts at recovery
                intervals.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-end gap-3 p-3 rounded-lg bg-muted/30 border"
                >
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`sprints.${index}.time`}
                      render={({ field: timeField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Sprint {index + 1}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.1"
                              max="15"
                              placeholder="0.00"
                              {...timeField}
                              value={timeField.value ?? ""}
                              onChange={(e) =>
                                timeField.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    @ {(index + 1) * form.watch("recoveryDuration")}s
                  </div>

                  {fields.length > 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {fields.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      sprintNumber: fields.length + 1,
                      time: 0,
                      recoveryType: form.watch("recoveryType"),
                    })
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sprint
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Calculated Metrics */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isCalculating ? "Calculating..." : "Performance Metrics"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Metrics */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Sprint Performance Times
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Best Time</p>
                    <p className="text-xl font-bold">
                      {metrics.bestTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Worst Time</p>
                    <p className="text-xl font-bold">
                      {metrics.worstTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Total Time</p>
                    <p className="text-xl font-bold">
                      {metrics.totalTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Average Time
                    </p>
                    <p className="text-xl font-bold">
                      {metrics.averageTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                </div>
              </div>

              {/* Fatigue Indices */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" /> Fatigue Analysis
                </h4>
                <div className="grid gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        Fatigue Index (%)
                      </p>
                      <Badge
                        className={getRatingColor("fatigue", metrics.rsaRating)}
                      >
                        {metrics.rsaRating}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {metrics.fatigueIndex?.toFixed(1) ?? "—"}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher is better (90-100% excellent)
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-background border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        Sprint Decrement (%)
                      </p>
                      <Badge
                        className={getRatingColor(
                          "fatigue",
                          metrics.fatigueResistance
                        )}
                      >
                        {metrics.fatigueResistance}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {metrics.sprintDecrement?.toFixed(1) ?? "—"}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower is better ({"<"}5% excellent)
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Fatigue Slope
                    </p>
                    <p className="text-xl font-bold">
                      {metrics.fatigueSlopePercentage?.toFixed(2) ?? "—"}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per-sprint decline rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Power Metrics */}
              {bodyWeight && (
                <div>
                  <h4 className="font-semibold text-sm mb-3">Power Output</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Peak Power
                      </p>
                      <p className="text-xl font-bold">
                        {metrics.peakPower ?? "—"}W
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Mean Power
                      </p>
                      <p className="text-xl font-bold">
                        {metrics.meanPower ?? "—"}W
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Insights */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold mb-1">Performance Summary:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>
                      RSA Rating:{" "}
                      <span className="font-semibold">{metrics.rsaRating}</span>{" "}
                      - Your ability to repeat sprints
                    </li>
                    <li>
                      Fatigue Resistance:{" "}
                      <span className="font-semibold">
                        {metrics.fatigueResistance}
                      </span>{" "}
                      - How well you maintain performance
                    </li>
                    <li>
                      Best Sprint:{" "}
                      <span className="font-semibold">
                        {metrics.bestTime?.toFixed(2)}s
                      </span>{" "}
                      - Your maximum speed capability
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Observations, technique notes, any limitations during test..."
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Errors */}
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="gap-2"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {form.formState.isSubmitting ? "Saving..." : "Save RSA Test"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
