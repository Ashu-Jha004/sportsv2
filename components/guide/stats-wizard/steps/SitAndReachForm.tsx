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
  Maximize2,
  Activity,
  Loader2,
  Info,
  Plus,
  Trash2,
  ThermometerSun,
  Clock,
} from "lucide-react";

/* ============================
   ZOD SCHEMA
============================ */

const trialSchema = z.object({
  trialNumber: z.number().min(1).max(5),
  reachDistance: z.number().min(-30).max(80), // cm (can be negative if can't reach toes)
  discomfortLevel: z.number().min(0).max(10).optional(), // 0=None, 10=Severe
});

const sitAndReachSchema = z.object({
  // Test configuration
  testVariant: z
    .enum(["standard", "modified", "back_saver"])
    .default("standard"),
  boxHeight: z.number().min(20).max(35).default(30), // cm
  zeroPointPosition: z.enum(["toe_level", "box_edge"]).default("toe_level"),

  // Athlete information
  athleteAge: z.number().min(5).max(100),
  athleteGender: z.enum(["male", "female"]),
  legLength: z.number().min(40).max(120).optional(), // cm (knee to floor)
  armLength: z.number().min(30).max(100).optional(), // cm (shoulder to fingertip)

  // Performance trials
  trials: z.array(trialSchema).min(3).max(5),

  // Pre-test conditions
  warmUpDuration: z.number().min(0).max(30).default(5), // minutes
  warmUpType: z
    .enum([
      "none",
      "light_cardio",
      "dynamic_stretching",
      "static_stretching",
      "comprehensive",
    ])
    .default("light_cardio"),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]).default("afternoon"),
  hoursAfterWaking: z.number().min(0).max(24).optional(),

  // Recent activity
  recentExercise: z
    .enum(["none", "light", "moderate", "intense"])
    .default("none"),
  hoursSinceExercise: z.number().min(0).max(72).optional(),

  // Physical factors
  lowerBackTightness: z.number().min(0).max(10).optional(), // 0=None, 10=Very tight
  hamstringTightness: z.number().min(0).max(10).optional(),
  previousInjuries: z.string().optional(),

  // Environmental
  roomTemperature: z.number().min(10).max(35).optional(), // Celsius
  testSurface: z.enum(["mat", "floor", "bench"]).default("mat"),

  notes: z.string().optional(),
});

type SitAndReachData = z.infer<typeof sitAndReachSchema>;

type Props = {
  initialData?: Partial<SitAndReachData>;
  onSave: (data: any) => void;
};

/* ============================
   NORMATIVE DATA (cm beyond toes = 0)
============================ */

const FLEXIBILITY_NORMS = {
  male: {
    "6-15": { excellent: 31, good: 26, average: 21, fair: 16, poor: -100 },
    "16-19": { excellent: 39, good: 34, average: 29, fair: 24, poor: -100 },
    "20-29": { excellent: 40, good: 34, average: 28, fair: 23, poor: -100 },
    "30-39": { excellent: 38, good: 33, average: 28, fair: 23, poor: -100 },
    "40-49": { excellent: 35, good: 29, average: 24, fair: 18, poor: -100 },
    "50-59": { excellent: 35, good: 28, average: 24, fair: 16, poor: -100 },
    "60+": { excellent: 33, good: 25, average: 20, fair: 15, poor: -100 },
  },
  female: {
    "6-15": { excellent: 36, good: 31, average: 26, fair: 21, poor: -100 },
    "16-19": { excellent: 43, good: 38, average: 34, fair: 29, poor: -100 },
    "20-29": { excellent: 41, good: 37, average: 33, fair: 28, poor: -100 },
    "30-39": { excellent: 41, good: 36, average: 32, fair: 27, poor: -100 },
    "40-49": { excellent: 38, good: 34, average: 30, fair: 25, poor: -100 },
    "50-59": { excellent: 39, good: 33, average: 30, fair: 25, poor: -100 },
    "60+": { excellent: 35, good: 31, average: 27, fair: 23, poor: -100 },
  },
};

/* ============================
   CALCULATED METRICS TYPE
============================ */

type CalculatedMetrics = {
  // Performance metrics
  bestReach: number;
  averageReach: number;
  consistencyScore: number; // How consistent across trials

  // Flexibility analysis
  flexibilityRating: string;
  flexibilityPercentile: number;
  relativeFlexibility: number | null; // Adjusted for leg/arm length

  // Joint-specific assessment
  hamstringFlexibilityIndex: number;
  lowerBackFlexibilityIndex: number;
  overallFlexibilityScore: number;

  // Range of motion
  rangeOfMotion: number; // Best - Worst trial
  improvementPotential: number; // Based on warm-up and conditions

  // Risk indicators
  injuryRiskLevel: "Low" | "Moderate" | "High";
  asymmetryIndex: number | null; // For back-saver variant
  tightnessScore: number | null;

  // Functional metrics
  functionalMobilityScore: number;
  dailyActivityCapability: string;
  sportsPerformanceImpact: string;

  // Comparative
  ageGroupComparison: string;
  improvementFromBaseline: number | null; // If previous test available
};

/* ============================
   HELPER FUNCTIONS
============================ */

function getAgeCategory(age: number): string {
  if (age <= 15) return "6-15";
  if (age <= 19) return "16-19";
  if (age <= 29) return "20-29";
  if (age <= 39) return "30-39";
  if (age <= 49) return "40-49";
  if (age <= 59) return "50-59";
  return "60+";
}

function getFlexibilityRating(
  reach: number,
  age: number,
  gender: "male" | "female"
): string {
  const category = getAgeCategory(age);
  const norms =
    FLEXIBILITY_NORMS[gender][category as keyof typeof FLEXIBILITY_NORMS.male];

  if (reach >= norms.excellent) return "Excellent";
  if (reach >= norms.good) return "Good";
  if (reach >= norms.average) return "Average";
  if (reach >= norms.fair) return "Fair";
  return "Poor";
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case "Excellent":
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "Good":
      return "bg-green-100 text-green-900 border-green-300";
    case "Average":
      return "bg-blue-100 text-blue-900 border-blue-300";
    case "Fair":
      return "bg-amber-100 text-amber-900 border-amber-300";
    case "Poor":
      return "bg-red-100 text-red-900 border-red-300";
    default:
      return "bg-gray-100 text-gray-900 border-gray-300";
  }
}

function calculateMetrics(data: Partial<SitAndReachData>): CalculatedMetrics {
  const {
    trials = [],
    athleteAge = 25,
    athleteGender = "male",
    legLength,
    armLength,
    lowerBackTightness,
    hamstringTightness,
    warmUpDuration = 5,
    recentExercise = "none",
  } = data;

  if (trials.length === 0) {
    return {
      bestReach: 0,
      averageReach: 0,
      consistencyScore: 0,
      flexibilityRating: "No data",
      flexibilityPercentile: 0,
      relativeFlexibility: null,
      hamstringFlexibilityIndex: 0,
      lowerBackFlexibilityIndex: 0,
      overallFlexibilityScore: 0,
      rangeOfMotion: 0,
      improvementPotential: 0,
      injuryRiskLevel: "Moderate",
      asymmetryIndex: null,
      tightnessScore: null,
      functionalMobilityScore: 0,
      dailyActivityCapability: "Unknown",
      sportsPerformanceImpact: "Unknown",
      ageGroupComparison: "N/A",
      improvementFromBaseline: null,
    };
  }

  const reaches = trials.map((t) => t.reachDistance).sort((a, b) => b - a);

  // Performance metrics
  const bestReach = reaches[0];
  const worstReach = reaches[reaches.length - 1];
  const averageReach = reaches.reduce((sum, r) => sum + r, 0) / reaches.length;
  const rangeOfMotion = bestReach - worstReach;

  // Consistency score (lower range = more consistent)
  const consistencyScore = Math.max(0, 100 - rangeOfMotion * 10);

  // Flexibility rating
  const flexibilityRating = getFlexibilityRating(
    bestReach,
    athleteAge,
    athleteGender
  );

  // Percentile
  const category = getAgeCategory(athleteAge);
  const norms =
    FLEXIBILITY_NORMS[athleteGender][
      category as keyof typeof FLEXIBILITY_NORMS.male
    ];
  let flexibilityPercentile = 50;
  if (bestReach >= norms.excellent) flexibilityPercentile = 95;
  else if (bestReach >= norms.good) flexibilityPercentile = 75;
  else if (bestReach >= norms.average) flexibilityPercentile = 50;
  else if (bestReach >= norms.fair) flexibilityPercentile = 25;
  else flexibilityPercentile = 10;

  // Relative flexibility (adjusted for body proportions)
  let relativeFlexibility = null;
  if (legLength && armLength) {
    // Longer legs make test harder, longer arms make it easier
    const bodyProportionFactor = (armLength - legLength) / 10;
    relativeFlexibility = bestReach + bodyProportionFactor;
  }

  // Joint-specific indices
  // Hamstring flexibility: Primary contributor (70%)
  const hamstringFlexibilityIndex = Math.round(
    Math.max(0, Math.min(100, (bestReach + 10) * 2.5))
  );

  // Lower back flexibility: Secondary contributor (30%)
  const lowerBackFlexibilityIndex = Math.round(
    Math.max(0, Math.min(100, (bestReach + 15) * 2))
  );

  // Overall flexibility score
  const overallFlexibilityScore = Math.round(
    hamstringFlexibilityIndex * 0.7 + lowerBackFlexibilityIndex * 0.3
  );

  // Improvement potential (based on warm-up, fatigue, etc.)
  let improvementPotential = 0;
  if (warmUpDuration < 5) improvementPotential += 15;
  if (recentExercise === "intense") improvementPotential += 10;
  if (lowerBackTightness && lowerBackTightness > 5) improvementPotential += 10;
  improvementPotential = Math.min(30, improvementPotential);

  // Injury risk level
  let injuryRiskLevel: "Low" | "Moderate" | "High" = "Low";
  const tightnessScore =
    ((lowerBackTightness || 0) + (hamstringTightness || 0)) / 2;

  if (bestReach < 0 || tightnessScore > 7) {
    injuryRiskLevel = "High";
  } else if (bestReach < 15 || tightnessScore > 4) {
    injuryRiskLevel = "Moderate";
  }

  // Functional mobility score
  const functionalMobilityScore = Math.round(
    overallFlexibilityScore * 0.6 +
      consistencyScore * 0.2 +
      (10 - (tightnessScore || 5)) * 4
  );

  // Daily activity capability
  let dailyActivityCapability = "Limited";
  if (functionalMobilityScore >= 80) dailyActivityCapability = "Excellent";
  else if (functionalMobilityScore >= 65) dailyActivityCapability = "Good";
  else if (functionalMobilityScore >= 50) dailyActivityCapability = "Adequate";
  else if (functionalMobilityScore >= 35)
    dailyActivityCapability = "Below Average";

  // Sports performance impact
  let sportsPerformanceImpact = "Limiting";
  if (bestReach >= norms.excellent)
    sportsPerformanceImpact = "Performance Enhancing";
  else if (bestReach >= norms.good)
    sportsPerformanceImpact = "Adequate for Performance";
  else if (bestReach >= norms.average)
    sportsPerformanceImpact = "Minimal Impact";
  else if (bestReach >= norms.fair)
    sportsPerformanceImpact = "May Limit Performance";

  // Age group comparison
  const avgNorm = norms.average;
  const difference = bestReach - avgNorm;
  let ageGroupComparison = `${Math.abs(difference)}cm `;
  ageGroupComparison += difference >= 0 ? "above" : "below";
  ageGroupComparison += " age group average";

  return {
    bestReach: Math.round(bestReach * 10) / 10,
    averageReach: Math.round(averageReach * 10) / 10,
    consistencyScore,
    flexibilityRating,
    flexibilityPercentile,
    relativeFlexibility: relativeFlexibility
      ? Math.round(relativeFlexibility * 10) / 10
      : null,
    hamstringFlexibilityIndex,
    lowerBackFlexibilityIndex,
    overallFlexibilityScore,
    rangeOfMotion: Math.round(rangeOfMotion * 10) / 10,
    improvementPotential,
    injuryRiskLevel,
    asymmetryIndex: null,
    tightnessScore: tightnessScore
      ? Math.round(tightnessScore * 10) / 10
      : null,
    functionalMobilityScore,
    dailyActivityCapability,
    sportsPerformanceImpact,
    ageGroupComparison,
    improvementFromBaseline: null,
  };
}

/* ============================
   MAIN COMPONENT
============================ */

export function SitAndReachTestForm({ initialData, onSave }: Props) {
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(sitAndReachSchema),
    defaultValues: {
      testVariant: initialData?.testVariant ?? "standard",
      boxHeight: initialData?.boxHeight ?? 30,
      zeroPointPosition: initialData?.zeroPointPosition ?? "toe_level",
      athleteAge: initialData?.athleteAge,
      athleteGender: initialData?.athleteGender ?? "male",
      legLength: initialData?.legLength,
      armLength: initialData?.armLength,
      trials: initialData?.trials ?? [
        { trialNumber: 1, reachDistance: 0, discomfortLevel: 0 },
        { trialNumber: 2, reachDistance: 0, discomfortLevel: 0 },
        { trialNumber: 3, reachDistance: 0, discomfortLevel: 0 },
      ],
      warmUpDuration: initialData?.warmUpDuration ?? 5,
      warmUpType: initialData?.warmUpType ?? "light_cardio",
      timeOfDay: initialData?.timeOfDay ?? "afternoon",
      hoursAfterWaking: initialData?.hoursAfterWaking,
      recentExercise: initialData?.recentExercise ?? "none",
      hoursSinceExercise: initialData?.hoursSinceExercise,
      lowerBackTightness: initialData?.lowerBackTightness,
      hamstringTightness: initialData?.hamstringTightness,
      previousInjuries: initialData?.previousInjuries ?? "",
      roomTemperature: initialData?.roomTemperature,
      testSurface: initialData?.testSurface ?? "mat",
      notes: initialData?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "trials",
  });

  const watchedData = form.watch();

  // Real-time calculations
  const metrics = useMemo(() => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 300);
    return calculateMetrics(watchedData);
  }, [
    watchedData.trials,
    watchedData.athleteAge,
    watchedData.athleteGender,
    watchedData.legLength,
    watchedData.armLength,
    watchedData.lowerBackTightness,
    watchedData.hamstringTightness,
    watchedData.warmUpDuration,
    watchedData.recentExercise,
  ]);

  const onSubmit = (data: SitAndReachData) => {
    try {
      const payload = {
        ...data,
        calculated: metrics,
        recordedAt: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.debug("[SitAndReachTestForm] Submitting:", payload);
      }

      onSave(payload);
    } catch (err) {
      console.error("[SitAndReachTestForm] Error:", err);
      form.setError("root", {
        type: "manual",
        message: "Failed to save sit and reach test data",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Sit and Reach Flexibility Test
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Standard flexibility assessment measuring lower back and hamstring
          flexibility. Athlete sits with legs extended and reaches forward along
          a measuring scale to assess range of motion.
        </p>
      </div>

      {/* Test Overview */}
      <Card className="border-teal-200 bg-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-teal-600" /> Test Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-teal-900">Starting Position</p>
              <p className="text-teal-800 text-xs">
                Seated, legs straight, feet flat against box (shoes off)
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-900">Movement</p>
              <p className="text-teal-800 text-xs">
                Reach forward slowly, hold for 2 seconds at maximum reach
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-900">Measurement</p>
              <p className="text-teal-800 text-xs">
                Distance reached beyond toes (0cm = toe level)
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-900">Trials</p>
              <p className="text-teal-800 text-xs">
                Minimum 3 trials, best score used for rating
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" /> Test Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="testVariant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Variant</FormLabel>
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
                          <SelectItem value="standard">
                            Standard (Both legs)
                          </SelectItem>
                          <SelectItem value="modified">
                            Modified (Adjustable)
                          </SelectItem>
                          <SelectItem value="back_saver">
                            Back-Saver (One leg)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="boxHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Box Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="20"
                          max="35"
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
                      <FormDescription>Standard: 30cm</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zeroPointPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zero Point</FormLabel>
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
                          <SelectItem value="toe_level">
                            Toe Level (0cm)
                          </SelectItem>
                          <SelectItem value="box_edge">
                            Box Edge (23cm)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Athlete Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Maximize2 className="h-5 w-5" /> Athlete Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="athleteAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age *</FormLabel>
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
                  name="athleteGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
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
                        For normative comparison
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="legLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leg Length (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="40"
                          max="120"
                          placeholder="Knee to floor"
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
                      <FormDescription>
                        For body proportion adjustment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="armLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arm Length (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="30"
                          max="100"
                          placeholder="Shoulder to fingertip"
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
                      <FormDescription>
                        For relative flexibility calculation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Trials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Maximize2 className="h-5 w-5" /> Performance Trials
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-2">
                Record reach distance in cm. Positive = beyond toes, Negative =
                short of toes
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 rounded-lg border bg-muted/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">Trial {index + 1}</p>
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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`trials.${index}.reachDistance`}
                      render={({ field: reachField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Reach Distance (cm)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.5"
                              min="-30"
                              max="80"
                              placeholder="e.g., 25.5"
                              {...reachField}
                              value={reachField.value ?? ""}
                              onChange={(e) =>
                                reachField.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Measured from toe level (0cm = toes)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`trials.${index}.discomfortLevel`}
                      render={({ field: discomfortField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Discomfort Level (0-10)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              placeholder="0=None, 10=Severe"
                              {...discomfortField}
                              value={discomfortField.value ?? ""}
                              onChange={(e) =>
                                discomfortField.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Pain/discomfort during reach
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              {fields.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      trialNumber: fields.length + 1,
                      reachDistance: 0,
                      discomfortLevel: 0,
                    })
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trial
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pre-Test Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" /> Pre-Test Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="warmUpDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warm-Up Duration (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="30"
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
                      <FormDescription>
                        5-10 minutes recommended
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warmUpType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warm-Up Type</FormLabel>
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
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="light_cardio">
                            Light Cardio Only
                          </SelectItem>
                          <SelectItem value="dynamic_stretching">
                            Dynamic Stretching
                          </SelectItem>
                          <SelectItem value="static_stretching">
                            Static Stretching
                          </SelectItem>
                          <SelectItem value="comprehensive">
                            Comprehensive (Cardio + Stretch)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="timeOfDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Day</FormLabel>
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
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Flexibility varies by time
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hoursAfterWaking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours After Waking</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="24"
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
                      <FormDescription>
                        Body needs 1-2hr to loosen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recentExercise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recent Exercise</FormLabel>
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
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="intense">Intense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>In past 24-48 hours</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Physical Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" /> Physical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="lowerBackTightness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lower Back Tightness (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="0=None, 10=Very tight"
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
                      <FormDescription>
                        Perceived tightness before test
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hamstringTightness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hamstring Tightness (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="0=None, 10=Very tight"
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
                      <FormDescription>
                        Perceived hamstring tightness
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="previousInjuries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Injuries</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Lower back strain 6 months ago, hamstring pull"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Past injuries affecting flexibility
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Environmental Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ThermometerSun className="h-5 w-5" /> Test Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="roomTemperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min="10"
                          max="35"
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
                        Warmer = better flexibility (20-24°C ideal)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="testSurface"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Surface</FormLabel>
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
                          <SelectItem value="mat">Exercise Mat</SelectItem>
                          <SelectItem value="floor">Hard Floor</SelectItem>
                          <SelectItem value="bench">Bench/Platform</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis Dashboard */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isCalculating ? "Calculating..." : "Flexibility Analysis"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Flexibility Rating */}
              <div className="p-4 rounded-lg bg-background border-2 border-primary">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Flexibility Rating
                  </p>
                  <Badge className={getRatingColor(metrics.flexibilityRating)}>
                    {metrics.flexibilityRating}
                  </Badge>
                </div>
                <div className="text-4xl font-bold text-primary">
                  {metrics.bestReach > 0 ? "+" : ""}
                  {metrics.bestReach.toFixed(1)}cm
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Best reach distance | {metrics.ageGroupComparison}
                </p>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Average Reach
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.averageReach > 0 ? "+" : ""}
                      {metrics.averageReach.toFixed(1)}cm
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Consistency Score
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.consistencyScore}/100
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: {metrics.rangeOfMotion.toFixed(1)}cm
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Percentile Rank
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.flexibilityPercentile}th
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      For age/gender group
                    </p>
                  </div>
                  {metrics.relativeFlexibility && (
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Relative Flexibility
                      </p>
                      <p className="text-lg font-bold">
                        {metrics.relativeFlexibility > 0 ? "+" : ""}
                        {metrics.relativeFlexibility.toFixed(1)}cm
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Body proportion adjusted
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Joint-Specific Analysis */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Joint-Specific Flexibility
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Hamstring Flexibility
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.hamstringFlexibilityIndex}/100
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Primary contributor (70%)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Lower Back Flexibility
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.lowerBackFlexibilityIndex}/100
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Secondary contributor (30%)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Overall Flexibility
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.overallFlexibilityScore}/100
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Improvement Potential
                    </p>
                    <p className="text-lg font-bold">
                      +{metrics.improvementPotential}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      With optimal conditions
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk & Functional Metrics */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Risk & Functional Assessment
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Injury Risk</p>
                    <p className="text-lg font-bold">
                      {metrics.injuryRiskLevel}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Functional Mobility
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.functionalMobilityScore}/100
                    </p>
                  </div>
                  {metrics.tightnessScore && (
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Tightness Score
                      </p>
                      <p className="text-lg font-bold">
                        {metrics.tightnessScore}/10
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lower is better
                      </p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Daily Activity Capability
                    </p>
                    <p className="text-sm font-bold">
                      {metrics.dailyActivityCapability}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sports Performance Impact */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Sports Performance Impact
                </h4>
                <div className="p-3 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Performance Impact Level
                  </p>
                  <p className="text-lg font-bold">
                    {metrics.sportsPerformanceImpact}
                  </p>
                </div>
              </div>

              {/* Key Insights */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold mb-2">Flexibility Summary:</p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>
                      <span className="font-semibold">Flexibility Level:</span>{" "}
                      {metrics.flexibilityRating} -{" "}
                      {metrics.bestReach.toFixed(1)}cm reach (
                      {metrics.flexibilityPercentile}th percentile)
                    </li>
                    <li>
                      <span className="font-semibold">Limiting Factor:</span>{" "}
                      {metrics.hamstringFlexibilityIndex < 50
                        ? "Hamstrings (primary)"
                        : metrics.lowerBackFlexibilityIndex < 50
                        ? "Lower back (secondary)"
                        : "No significant limitations"}
                    </li>
                    <li>
                      <span className="font-semibold">Injury Risk:</span>{" "}
                      {metrics.injuryRiskLevel} risk level
                      {metrics.injuryRiskLevel === "High" &&
                        " - Recommend flexibility training program"}
                    </li>
                    <li>
                      <span className="font-semibold">
                        Improvement Potential:
                      </span>{" "}
                      Up to {metrics.improvementPotential}% improvement possible
                      with proper warm-up and training
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Notes */}
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
                        placeholder="Pain points, technique observations, limiting factors, athlete feedback..."
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
              {form.formState.isSubmitting
                ? "Saving..."
                : "Save Sit and Reach Test"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
