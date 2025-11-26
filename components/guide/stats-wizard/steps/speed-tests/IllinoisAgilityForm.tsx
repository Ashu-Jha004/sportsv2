"use client";

import React, { useState, useMemo } from "react";
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
  TrendingUp,
  Activity,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  MapPin,
} from "lucide-react";

/* ============================
   ZOD SCHEMA
============================ */

const attemptSchema = z.object({
  attemptNumber: z.number().min(1).max(5),
  time: z.number().min(10).max(30),
  notes: z.string().optional(),
  valid: z.boolean().default(true),
});

const illinoisAgilitySchema = z.object({
  athleteGender: z.enum(["male", "female"]).default("male"),
  age: z.number().min(5).max(100).optional(),
  bodyWeight: z.number().min(20).max(200).optional(),
  attempts: z.array(attemptSchema).min(1).max(5),
  courseLength: z.number().min(10).max(10).default(10), // meters
  courseWidth: z.number().min(5).max(5).default(5), // meters
  surfaceType: z
    .enum([
      "indoor_wood",
      "indoor_synthetic",
      "outdoor_grass",
      "outdoor_synthetic",
      "outdoor_asphalt",
    ])
    .default("indoor_synthetic"),
  weatherConditions: z.string().optional(),
  equipmentNotes: z.string().optional(),
  testConditions: z.enum(["fresh", "fatigued", "normal"]).default("normal"),
  notes: z.string().optional(),
});

type IllinoisAgilityData = z.infer<typeof illinoisAgilitySchema>;

type Props = {
  initialData?: Partial<IllinoisAgilityData>;
  onSave: (data: any) => void;
};

/* ============================
   NORMATIVE DATA & PERFORMANCE RATING
============================ */

interface PerformanceNorms {
  rating: string;
  maleRange: [number, number | number];
  femaleRange: [number, number | number];
  description: string;
}

const NORMATIVE_DATA: PerformanceNorms[] = [
  {
    rating: "Excellent",
    maleRange: [0, 15.2],
    femaleRange: [0, 17.0],
    description: "Elite level agility and COD ability",
  },
  {
    rating: "Above Average",
    maleRange: [15.2, 16.1],
    femaleRange: [17.0, 17.9],
    description: "Very good change of direction speed",
  },
  {
    rating: "Average",
    maleRange: [16.2, 18.1],
    femaleRange: [18.0, 21.7],
    description: "Normal athletic agility",
  },
  {
    rating: "Below Average",
    maleRange: [18.2, 19.3],
    femaleRange: [21.8, 23.0],
    description: "Below average COD performance",
  },
  {
    rating: "Poor",
    maleRange: [19.3, 100],
    femaleRange: [23.0, 100],
    description: "Significant room for agility improvement",
  },
];

/* ============================
   CALCULATED METRICS TYPE
============================ */

type CalculatedMetrics = {
  // Best performance
  bestTime: number | null;
  worstTime: number | null;

  // Average metrics
  meanTime: number | null;
  medianTime: number | null;
  standardDeviation: number | null;

  // Performance consistency
  variance: number | null;
  coefficientOfVariation: number | null;

  // Reliability indicators
  intraIndividualVariability: number | null;
  reliabilityScore: number | null; // ICC estimation

  // Performance rating
  performanceRating: string;
  percentile: number | null;
  ageGroupComparison: string;

  // Movement analysis
  speedConsistency: "Excellent" | "Good" | "Fair" | "Poor";
  fatigueIndex: number | null; // (first attempt / last attempt)

  // Comparison to norms
  normsDifference: number | null;
  normsPercentageDifference: number | null;
};

/* ============================
   HELPER FUNCTIONS
============================ */

function getPerformanceRating(time: number, gender: "male" | "female"): string {
  for (const norm of NORMATIVE_DATA) {
    const range = gender === "male" ? norm.maleRange : norm.femaleRange;
    if (
      time >= range[0] &&
      time <= (Array.isArray(range[1]) ? range[1] : range[1])
    ) {
      return norm.rating;
    }
  }
  return "Unknown";
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case "Excellent":
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "Above Average":
      return "bg-green-100 text-green-900 border-green-300";
    case "Average":
      return "bg-blue-100 text-blue-900 border-blue-300";
    case "Below Average":
      return "bg-amber-100 text-amber-900 border-amber-300";
    case "Poor":
      return "bg-red-100 text-red-900 border-red-300";
    default:
      return "bg-gray-100 text-gray-900 border-gray-300";
  }
}

function calculateMetrics(
  attempts: any[],
  gender: "male" | "female"
): CalculatedMetrics {
  if (attempts.length === 0) {
    return {
      bestTime: null,
      worstTime: null,
      meanTime: null,
      medianTime: null,
      standardDeviation: null,
      variance: null,
      coefficientOfVariation: null,
      intraIndividualVariability: null,
      reliabilityScore: null,
      performanceRating: "No data",
      percentile: null,
      ageGroupComparison: "N/A",
      speedConsistency: "Poor",
      fatigueIndex: null,
      normsDifference: null,
      normsPercentageDifference: null,
    };
  }

  const times = attempts
    .filter((a) => a.valid !== false)
    .map((a) => a.time)
    .sort((a, b) => a - b);

  if (times.length === 0) {
    return {
      bestTime: null,
      worstTime: null,
      meanTime: null,
      medianTime: null,
      standardDeviation: null,
      variance: null,
      coefficientOfVariation: null,
      intraIndividualVariability: null,
      reliabilityScore: null,
      performanceRating: "No valid attempts",
      percentile: null,
      ageGroupComparison: "N/A",
      speedConsistency: "Poor",
      fatigueIndex: null,
      normsDifference: null,
      normsPercentageDifference: null,
    };
  }

  // Basic stats
  const bestTime = times[0];
  const worstTime = times[times.length - 1];
  const sum = times.reduce((a, b) => a + b, 0);
  const meanTime = sum / times.length;

  // Median
  const medianTime =
    times.length % 2 === 0
      ? (times[times.length / 2 - 1] + times[times.length / 2]) / 2
      : times[Math.floor(times.length / 2)];

  // Variance & Standard Deviation
  const variance =
    times.reduce((sum, t) => sum + Math.pow(t - meanTime, 2), 0) / times.length;
  const standardDeviation = Math.sqrt(variance);

  // Coefficient of Variation (CV) - consistency measure
  const coefficientOfVariation = (standardDeviation / meanTime) * 100;

  // Intra-individual variability (difference between best and worst)
  const intraIndividualVariability = ((worstTime - bestTime) / bestTime) * 100;

  // Fatigue Index (First vs Last attempt)
  const firstValidAttempt = attempts.find((a) => a.valid !== false);
  const lastValidAttempt = [
    ...attempts.filter((a) => a.valid !== false),
  ].reverse()[0];
  const fatigueIndex =
    firstValidAttempt && lastValidAttempt
      ? (firstValidAttempt.time / lastValidAttempt.time) * 100
      : null;

  // Performance rating based on best time
  const performanceRating = getPerformanceRating(bestTime, gender);

  // Speed consistency analysis
  let speedConsistency: "Excellent" | "Good" | "Fair" | "Poor" = "Poor";
  if (coefficientOfVariation <= 3) speedConsistency = "Excellent";
  else if (coefficientOfVariation <= 6) speedConsistency = "Good";
  else if (coefficientOfVariation <= 10) speedConsistency = "Fair";

  // Reliability score (ICC estimation based on CV)
  const reliabilityScore = Math.max(0, 100 - coefficientOfVariation * 10);

  // Percentile estimation (simplified)
  let percentile = null;
  const maleRanges = [15.2, 16.1, 18.1, 19.3];
  const femaleRanges = [17.0, 17.9, 21.7, 23.0];
  const ranges = gender === "male" ? maleRanges : femaleRanges;

  if (bestTime < ranges[0]) percentile = 90;
  else if (bestTime < ranges[1]) percentile = 70;
  else if (bestTime < ranges[2]) percentile = 50;
  else if (bestTime < ranges[3]) percentile = 25;
  else percentile = 10;

  // Comparison to norms
  const normMean = gender === "male" ? 16.65 : 19.85;
  const normsDifference = bestTime - normMean;
  const normsPercentageDifference = (normsDifference / normMean) * 100;

  return {
    bestTime: Math.round(bestTime * 100) / 100,
    worstTime: Math.round(worstTime * 100) / 100,
    meanTime: Math.round(meanTime * 100) / 100,
    medianTime: Math.round(medianTime * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    coefficientOfVariation: Math.round(coefficientOfVariation * 10) / 10,
    intraIndividualVariability:
      Math.round(intraIndividualVariability * 10) / 10,
    reliabilityScore: Math.round(reliabilityScore),
    performanceRating,
    percentile,
    ageGroupComparison: `Better than ${percentile}% of athletes`,
    speedConsistency,
    fatigueIndex: fatigueIndex ? Math.round(fatigueIndex * 10) / 10 : null,
    normsDifference: Math.round(normsDifference * 100) / 100,
    normsPercentageDifference: Math.round(normsPercentageDifference * 10) / 10,
  };
}

/* ============================
   MAIN COMPONENT
============================ */

export function IllinoisAgilityForm({ initialData, onSave }: Props) {
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(illinoisAgilitySchema),
    defaultValues: {
      athleteGender: initialData?.athleteGender ?? "male",
      age: initialData?.age,
      bodyWeight: initialData?.bodyWeight,
      surfaceType: initialData?.surfaceType ?? "indoor_synthetic",
      testConditions: initialData?.testConditions ?? "normal",
      courseLength: 10,
      courseWidth: 5,
      attempts: initialData?.attempts ?? [
        { attemptNumber: 1, time: 0, valid: true },
        { attemptNumber: 2, time: 0, valid: true },
        { attemptNumber: 3, time: 0, valid: true },
      ],
      weatherConditions: initialData?.weatherConditions ?? "",
      equipmentNotes: initialData?.equipmentNotes ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attempts",
  });

  const attemptsData = form.watch("attempts");
  const athleteGender = form.watch("athleteGender");

  // Calculate metrics whenever attempts or gender change
  const metrics = useMemo(() => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 300);
    return calculateMetrics(attemptsData, athleteGender);
  }, [attemptsData, athleteGender]);

  const onSubmit = (data: IllinoisAgilityData) => {
    try {
      const payload = {
        ...data,
        calculated: metrics,
        recordedAt: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.debug("[IllinoisAgilityForm] Submitting data:", payload);
      }

      onSave(payload);
    } catch (err) {
      console.error("[IllinoisAgilityForm] Error saving:", err);
      form.setError("root", {
        type: "manual",
        message: "Failed to save Illinois Agility test data",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Illinois Agility Test
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Comprehensive assessment of change-of-direction (COD) speed and
          agility. Measures the ability to rapidly change direction while
          maintaining speed and body control.
        </p>
      </div>

      {/* Test Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-blue-600" /> Test Protocol Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-blue-900">Course Layout</p>
              <p className="text-blue-800 text-xs">
                10m length × 5m width with 4 center cones spaced 3.3m apart
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">Starting Position</p>
              <p className="text-blue-800 text-xs">
                Prone (lying face down) with chin on start line
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">Movement Pattern</p>
              <p className="text-blue-800 text-xs">
                Sprint 10m → Touch line → Sprint back → Weave through cones →
                Sprint finish
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">Scoring</p>
              <p className="text-blue-800 text-xs">
                Time (seconds) from start until chest crosses finish line
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Athlete Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" /> Athlete Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="athleteGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
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
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        For normative data comparison
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          max="100"
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
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5" /> Test Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="surfaceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surface Type</FormLabel>
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
                          <SelectItem value="indoor_wood">
                            Indoor (Wood)
                          </SelectItem>
                          <SelectItem value="indoor_synthetic">
                            Indoor (Synthetic)
                          </SelectItem>
                          <SelectItem value="outdoor_grass">
                            Outdoor (Grass)
                          </SelectItem>
                          <SelectItem value="outdoor_synthetic">
                            Outdoor (Synthetic)
                          </SelectItem>
                          <SelectItem value="outdoor_asphalt">
                            Outdoor (Asphalt)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="testConditions"
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
                name="weatherConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weather Conditions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 22°C, dry, good lighting"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Temperature, humidity, rain, wind conditions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipmentNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Notes</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Cone type, marking system, timing device"
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

          {/* Attempts Recording */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Attempt Times (seconds)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-2">
                Record completion time for each valid attempt. Minimum 3,
                maximum 5 attempts.
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
                      name={`attempts.${index}.time`}
                      render={({ field: timeField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Attempt {index + 1}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="10"
                              max="30"
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

                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`attempts.${index}.valid`}
                      render={({ field: validField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Status</FormLabel>
                          <Select
                            value={validField.value ? "valid" : "invalid"}
                            onValueChange={(value) =>
                              validField.onChange(value === "valid")
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="valid">Valid</SelectItem>
                              <SelectItem value="invalid">Invalid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

              {fields.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      attemptNumber: fields.length + 1,
                      time: 0,
                      valid: true,
                    })
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attempt
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isCalculating ? "Calculating..." : "Performance Analysis"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Performance Rating */}
              <div className="p-4 rounded-lg bg-background border-2 border-primary">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Performance Rating
                  </p>
                  <Badge className={getRatingColor(metrics.performanceRating)}>
                    {metrics.performanceRating}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {metrics.bestTime?.toFixed(2) ?? "—"}s
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Best time (lower is better)
                </p>
              </div>

              {/* Time Statistics */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Time Statistics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Best Time</p>
                    <p className="text-lg font-bold">
                      {metrics.bestTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Worst Time</p>
                    <p className="text-lg font-bold">
                      {metrics.worstTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Mean Time</p>
                    <p className="text-lg font-bold">
                      {metrics.meanTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Median Time</p>
                    <p className="text-lg font-bold">
                      {metrics.medianTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Std Deviation
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.standardDeviation?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Range</p>
                    <p className="text-lg font-bold">
                      {metrics.bestTime && metrics.worstTime
                        ? (metrics.worstTime - metrics.bestTime).toFixed(2)
                        : "—"}
                      s
                    </p>
                  </div>
                </div>
              </div>

              {/* Consistency & Reliability */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Consistency & Reliability
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Consistency Level
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.speedConsistency}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CV: {metrics.coefficientOfVariation?.toFixed(1) ?? "—"}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Reliability Score
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.reliabilityScore ?? "—"}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ICC estimate
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Variability</p>
                    <p className="text-lg font-bold">
                      {metrics.intraIndividualVariability?.toFixed(1) ?? "—"}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Best to worst
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Fatigue Index
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.fatigueIndex?.toFixed(1) ?? "—"}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      First to last
                    </p>
                  </div>
                </div>
              </div>

              {/* Normative Comparison */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Normative Comparison
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Percentile Rank
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.percentile ?? "—"}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Age Group Comparison
                    </p>
                    <p className="text-sm font-bold">
                      {metrics.ageGroupComparison}
                    </p>
                  </div>
                </div>
              </div>

              {/* Norms Difference */}
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-xs text-muted-foreground mb-2">
                  vs. Population Norms
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {metrics.normsDifference !== null
                        ? metrics.normsDifference > 0
                          ? "Slower than average"
                          : "Faster than average"
                        : "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.normsPercentageDifference !== null
                        ? `${Math.abs(
                            metrics.normsPercentageDifference
                          ).toFixed(1)}% ${
                            metrics.normsDifference! > 0 ? "slower" : "faster"
                          }`
                        : "—"}
                    </p>
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.normsDifference?.toFixed(2) ?? "—"}s
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold mb-2">Performance Summary:</p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>
                      <span className="font-semibold">Rating:</span>{" "}
                      {metrics.performanceRating} -{" "}
                      {
                        NORMATIVE_DATA.find(
                          (n) => n.rating === metrics.performanceRating
                        )?.description
                      }
                    </li>
                    <li>
                      <span className="font-semibold">Speed Consistency:</span>{" "}
                      {metrics.speedConsistency} (CV{" "}
                      {metrics.coefficientOfVariation?.toFixed(1)}%)
                    </li>
                    <li>
                      <span className="font-semibold">Fatigue Resistance:</span>{" "}
                      {metrics.fatigueIndex && metrics.fatigueIndex < 95
                        ? "Moderate fatigue observed"
                        : "Good fatigue resistance"}
                    </li>
                    <li>
                      <span className="font-semibold">Test Quality:</span>{" "}
                      Excellent reliability (ICC {metrics.reliabilityScore}%)
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes & Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Technique observations, movement quality, recovery patterns, any issues during test..."
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
              {form.formState.isSubmitting
                ? "Saving..."
                : "Save Illinois Agility Test"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
