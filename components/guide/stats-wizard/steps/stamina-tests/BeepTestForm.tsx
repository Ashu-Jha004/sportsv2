"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
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
  Heart,
  Activity,
  Loader2,
  Info,
  TrendingUp,
  Wind,
  Timer,
} from "lucide-react";

/* ============================
   ZOD SCHEMA
============================ */

const beepTestSchema = z.object({
  // Core test data
  levelReached: z.number().min(1).max(21),
  shuttlesInFinalLevel: z.number().min(0).max(15),

  // Athlete information
  athleteAge: z.number().min(5).max(100),
  athleteGender: z.enum(["male", "female"]),
  bodyWeight: z.number().min(20).max(200),

  // Heart rate data
  restingHeartRate: z.number().min(30).max(100).optional(),
  maxHeartRate: z.number().min(100).max(220).optional(),
  heartRateAt1Min: z.number().min(60).max(200).optional(), // Recovery HR at 1 min
  heartRateAt2Min: z.number().min(60).max(180).optional(), // Recovery HR at 2 min

  // Test conditions
  temperature: z.number().min(-10).max(50).optional(),
  humidity: z.number().min(0).max(100).optional(),
  altitude: z.number().min(0).max(5000).optional(),
  surfaceType: z
    .enum([
      "indoor_wood",
      "indoor_synthetic",
      "outdoor_grass",
      "outdoor_track",
      "outdoor_court",
    ])
    .default("indoor_synthetic"),

  // Additional data
  testTerminationReason: z
    .enum([
      "volitional_exhaustion",
      "failed_to_complete_shuttle",
      "injury",
      "other",
    ])
    .default("volitional_exhaustion"),
  rpeScore: z.number().min(6).max(20).optional(), // Rate of Perceived Exertion (Borg Scale)

  notes: z.string().optional(),
});

type BeepTestData = z.infer<typeof beepTestSchema>;

type Props = {
  initialData?: Partial<BeepTestData>;
  onSave: (data: any) => void;
};

/* ============================
   BEEP TEST LEVEL DATA
   Each level has specific shuttle counts and speeds
============================ */

const BEEP_TEST_LEVELS = [
  { level: 1, shuttles: 7, speed: 8.5, duration: 420 },
  { level: 2, shuttles: 8, speed: 9.0, duration: 356 },
  { level: 3, shuttles: 8, speed: 9.5, duration: 337 },
  { level: 4, shuttles: 9, speed: 10.0, duration: 320 },
  { level: 5, shuttles: 9, speed: 10.5, duration: 305 },
  { level: 6, shuttles: 10, speed: 11.0, duration: 291 },
  { level: 7, shuttles: 10, speed: 11.5, duration: 278 },
  { level: 8, shuttles: 11, speed: 12.0, duration: 267 },
  { level: 9, shuttles: 11, speed: 12.5, duration: 256 },
  { level: 10, shuttles: 11, speed: 13.0, duration: 246 },
  { level: 11, shuttles: 12, speed: 13.5, duration: 237 },
  { level: 12, shuttles: 12, speed: 14.0, duration: 229 },
  { level: 13, shuttles: 13, speed: 14.5, duration: 221 },
  { level: 14, shuttles: 13, speed: 15.0, duration: 213 },
  { level: 15, shuttles: 13, speed: 15.5, duration: 206 },
  { level: 16, shuttles: 14, speed: 16.0, duration: 200 },
  { level: 17, shuttles: 14, speed: 16.5, duration: 194 },
  { level: 18, shuttles: 15, speed: 17.0, duration: 188 },
  { level: 19, shuttles: 15, speed: 17.5, duration: 183 },
  { level: 20, shuttles: 16, speed: 18.0, duration: 178 },
  { level: 21, shuttles: 16, speed: 18.5, duration: 173 },
];

/* ============================
   VO2MAX CALCULATION FORMULAS
============================ */

// Léger & Lambert (1982) formula - Most widely used
function calculateVO2Max(level: number, shuttles: number): number {
  const totalShuttles =
    BEEP_TEST_LEVELS.slice(0, level - 1).reduce(
      (sum, l) => sum + l.shuttles,
      0
    ) + shuttles;

  const speed = BEEP_TEST_LEVELS[level - 1]?.speed || 8.5;

  // Formula: VO2max = 31.025 + 3.238 × Speed - 3.248 × Age + 0.1536 × Speed × Age
  // Simplified version using speed only (more accurate with age adjustment done separately)
  const vo2max = speed * 6.592 - 24.4;

  return Math.max(20, Math.min(85, vo2max)); // Clamp between reasonable values
}

// Age-adjusted VO2max
function adjustVO2MaxForAge(vo2max: number, age: number): number {
  if (age <= 25) return vo2max;

  // VO2max declines ~10% per decade after 25
  const declineRate = 0.01; // 1% per year after 25
  const yearsOverTwentyFive = age - 25;
  const adjustmentFactor = 1 - yearsOverTwentyFive * declineRate;

  return vo2max * adjustmentFactor;
}

/* ============================
   VO2MAX FITNESS RATINGS
============================ */

const VO2MAX_RATINGS = {
  male: {
    "18-25": { excellent: 55, good: 50, average: 45, fair: 40, poor: 0 },
    "26-35": { excellent: 52, good: 47, average: 42, fair: 37, poor: 0 },
    "36-45": { excellent: 49, good: 44, average: 39, fair: 35, poor: 0 },
    "46-55": { excellent: 45, good: 41, average: 36, fair: 32, poor: 0 },
    "56+": { excellent: 41, good: 37, average: 33, fair: 29, poor: 0 },
  },
  female: {
    "18-25": { excellent: 48, good: 43, average: 38, fair: 33, poor: 0 },
    "26-35": { excellent: 45, good: 40, average: 35, fair: 31, poor: 0 },
    "36-45": { excellent: 42, good: 37, average: 33, fair: 29, poor: 0 },
    "46-55": { excellent: 38, good: 34, average: 30, fair: 26, poor: 0 },
    "56+": { excellent: 35, good: 31, average: 27, fair: 23, poor: 0 },
  },
};

function getAgeCategory(age: number): string {
  if (age <= 25) return "18-25";
  if (age <= 35) return "26-35";
  if (age <= 45) return "36-45";
  if (age <= 55) return "46-55";
  return "56+";
}

function getVO2MaxRating(
  vo2max: number,
  age: number,
  gender: "male" | "female"
): string {
  const category = getAgeCategory(age);
  const ratings =
    VO2MAX_RATINGS[gender][category as keyof typeof VO2MAX_RATINGS.male];

  if (vo2max >= ratings.excellent) return "Excellent";
  if (vo2max >= ratings.good) return "Good";
  if (vo2max >= ratings.average) return "Average";
  if (vo2max >= ratings.fair) return "Fair";
  return "Poor";
}

/* ============================
   CALCULATED METRICS TYPE
============================ */

type CalculatedMetrics = {
  // Core calculations
  totalShuttles: number;
  totalDistance: number; // meters
  totalTime: number; // seconds
  averageSpeed: number; // km/h
  finalSpeed: number; // km/h

  // VO2max calculations
  estimatedVO2Max: number; // ml/kg/min
  vo2MaxRating: string;
  fitnessAge: number | null; // Predicted fitness age

  // Heart rate analysis
  maxHeartRateEstimated: number; // 220 - age
  heartRateReserve: number | null;
  exerciseIntensityPercent: number | null;
  heartRateRecovery: number | null; // Drop in first minute
  recoveryScore: string;

  // Performance metrics
  caloriesBurned: number;
  metabolicEquivalent: number; // METs
  anaerobicThreshold: number | null; // Estimated from VO2max

  // Comparative analysis
  percentileRank: number; // Compared to age/gender norms
  predictedLevel: number; // What level they should reach based on age/gender
  performanceIndex: number; // Actual vs predicted (100 = exactly predicted)
};

/* ============================
   HELPER FUNCTIONS
============================ */

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

function calculateMetrics(data: Partial<BeepTestData>): CalculatedMetrics {
  const {
    levelReached = 1,
    shuttlesInFinalLevel = 0,
    athleteAge = 25,
    athleteGender = "male",
    bodyWeight = 70,
    restingHeartRate,
    maxHeartRate: measuredMaxHR,
    heartRateAt1Min,
  } = data;

  // Total shuttles completed
  const completedLevels = BEEP_TEST_LEVELS.slice(0, levelReached - 1);
  const totalShuttles =
    completedLevels.reduce((sum, l) => sum + l.shuttles, 0) +
    shuttlesInFinalLevel;

  // Total distance (each shuttle = 20m)
  const totalDistance = totalShuttles * 20;

  // Total time
  const completedTime = completedLevels.reduce(
    (sum, l) => sum + l.shuttles * (l.duration / 10),
    0
  );
  const finalLevelData = BEEP_TEST_LEVELS[levelReached - 1];
  const finalLevelTime =
    shuttlesInFinalLevel * ((finalLevelData?.duration || 400) / 10);
  const totalTime = completedTime + finalLevelTime;

  // Average speed
  const averageSpeed = (totalDistance / totalTime) * 3.6; // Convert m/s to km/h

  // Final speed
  const finalSpeed = finalLevelData?.speed || 8.5;

  // VO2max calculation
  const rawVO2Max = calculateVO2Max(levelReached, shuttlesInFinalLevel);
  const estimatedVO2Max =
    Math.round(adjustVO2MaxForAge(rawVO2Max, athleteAge) * 10) / 10;

  // VO2max rating
  const vo2MaxRating = getVO2MaxRating(
    estimatedVO2Max,
    athleteAge,
    athleteGender
  );

  // Fitness age (reverse calculation)
  let fitnessAge = null;
  if (rawVO2Max > estimatedVO2Max) {
    // They're fitter than their age suggests
    const difference = rawVO2Max - estimatedVO2Max;
    fitnessAge = Math.max(18, athleteAge - Math.round(difference * 10));
  } else {
    fitnessAge = athleteAge;
  }

  // Heart rate analysis
  const maxHeartRateEstimated = 220 - athleteAge;
  const maxHR = measuredMaxHR || maxHeartRateEstimated;

  let heartRateReserve = null;
  let exerciseIntensityPercent = null;
  if (restingHeartRate) {
    heartRateReserve = maxHR - restingHeartRate;
    exerciseIntensityPercent = Math.round(
      ((maxHR - restingHeartRate) / heartRateReserve) * 100
    );
  }

  // Heart rate recovery
  let heartRateRecovery = null;
  let recoveryScore = "N/A";
  if (maxHR && heartRateAt1Min) {
    heartRateRecovery = maxHR - heartRateAt1Min;

    if (heartRateRecovery >= 25) recoveryScore = "Excellent";
    else if (heartRateRecovery >= 20) recoveryScore = "Good";
    else if (heartRateRecovery >= 15) recoveryScore = "Average";
    else if (heartRateRecovery >= 12) recoveryScore = "Fair";
    else recoveryScore = "Poor";
  }

  // Calories burned (rough estimate)
  const durationMinutes = totalTime / 60;
  const caloriesPerMinute = (estimatedVO2Max / 3.5) * bodyWeight * 0.0175;
  const caloriesBurned = Math.round(caloriesPerMinute * durationMinutes);

  // METs (Metabolic Equivalent)
  const metabolicEquivalent = Math.round((estimatedVO2Max / 3.5) * 10) / 10;

  // Anaerobic threshold (typically 85-90% of VO2max)
  const anaerobicThreshold = Math.round(estimatedVO2Max * 0.875 * 10) / 10;

  // Percentile ranking (simplified)
  const category = getAgeCategory(athleteAge);
  const ratings =
    VO2MAX_RATINGS[athleteGender][category as keyof typeof VO2MAX_RATINGS.male];
  let percentileRank = 50;
  if (estimatedVO2Max >= ratings.excellent) percentileRank = 95;
  else if (estimatedVO2Max >= ratings.good) percentileRank = 75;
  else if (estimatedVO2Max >= ratings.average) percentileRank = 50;
  else if (estimatedVO2Max >= ratings.fair) percentileRank = 25;
  else percentileRank = 10;

  // Predicted level (what they should reach based on average for their age/gender)
  const avgVO2Max = ratings.average;
  const predictedLevel = Math.max(1, Math.round((avgVO2Max + 24.4) / 6.592));

  // Performance index
  const performanceIndex = Math.round((levelReached / predictedLevel) * 100);

  return {
    totalShuttles,
    totalDistance,
    totalTime: Math.round(totalTime),
    averageSpeed: Math.round(averageSpeed * 10) / 10,
    finalSpeed: Math.round(finalSpeed * 10) / 10,
    estimatedVO2Max,
    vo2MaxRating,
    fitnessAge,
    maxHeartRateEstimated,
    heartRateReserve,
    exerciseIntensityPercent,
    heartRateRecovery,
    recoveryScore,
    caloriesBurned,
    metabolicEquivalent,
    anaerobicThreshold,
    percentileRank,
    predictedLevel,
    performanceIndex,
  };
}

/* ============================
   MAIN COMPONENT
============================ */

export function BeepTestForm({ initialData, onSave }: Props) {
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(beepTestSchema),
    defaultValues: {
      levelReached: initialData?.levelReached ?? 1,
      shuttlesInFinalLevel: initialData?.shuttlesInFinalLevel ?? 0,
      athleteAge: initialData?.athleteAge,
      athleteGender: initialData?.athleteGender ?? "male",
      bodyWeight: initialData?.bodyWeight,
      restingHeartRate: initialData?.restingHeartRate,
      maxHeartRate: initialData?.maxHeartRate,
      heartRateAt1Min: initialData?.heartRateAt1Min,
      heartRateAt2Min: initialData?.heartRateAt2Min,
      temperature: initialData?.temperature,
      humidity: initialData?.humidity,
      altitude: initialData?.altitude ?? 0,
      surfaceType: initialData?.surfaceType ?? "indoor_synthetic",
      testTerminationReason:
        initialData?.testTerminationReason ?? "volitional_exhaustion",
      rpeScore: initialData?.rpeScore,
      notes: initialData?.notes ?? "",
    },
  });

  const watchedData = form.watch();

  // Real-time calculations
  const metrics = useMemo(() => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 300);
    return calculateMetrics(watchedData);
  }, [
    watchedData.levelReached,
    watchedData.shuttlesInFinalLevel,
    watchedData.athleteAge,
    watchedData.athleteGender,
    watchedData.bodyWeight,
    watchedData.restingHeartRate,
    watchedData.maxHeartRate,
    watchedData.heartRateAt1Min,
  ]);

  const onSubmit = (data: BeepTestData) => {
    try {
      const payload = {
        ...data,
        calculated: metrics,
        recordedAt: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.debug("[BeepTestForm] Submitting:", payload);
      }

      onSave(payload);
    } catch (err) {
      console.error("[BeepTestForm] Error:", err);
      form.setError("root", {
        type: "manual",
        message: "Failed to save beep test data",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Beep Test (Multi-Stage Fitness Test)
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Progressive 20-meter shuttle run test to measure cardiovascular
          fitness and estimate VO₂max. Athletes run between two lines 20m apart,
          keeping pace with audio beeps that get progressively faster.
        </p>
      </div>

      {/* Test Overview */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-red-600" /> Test Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-red-900">Distance</p>
              <p className="text-red-800 text-xs">20 meters (shuttle run)</p>
            </div>
            <div>
              <p className="font-semibold text-red-900">Starting Speed</p>
              <p className="text-red-800 text-xs">8.5 km/h (Level 1)</p>
            </div>
            <div>
              <p className="font-semibold text-red-900">Progression</p>
              <p className="text-red-800 text-xs">
                Speed increases by 0.5 km/h each level (21 levels total)
              </p>
            </div>
            <div>
              <p className="font-semibold text-red-900">Test End</p>
              <p className="text-red-800 text-xs">
                Athlete cannot maintain pace for 2 consecutive shuttles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Core Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" /> Test Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="levelReached"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level Reached *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="21"
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
                        Final level completed (1-21)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shuttlesInFinalLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shuttles in Final Level *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="15"
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
                        Completed shuttles in final level (0-15)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="testTerminationReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Termination Reason</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="volitional_exhaustion">
                          Volitional Exhaustion (Max Effort)
                        </SelectItem>
                        <SelectItem value="failed_to_complete_shuttle">
                          Failed to Complete Shuttle (×2)
                        </SelectItem>
                        <SelectItem value="injury">
                          Injury/Discomfort
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rpeScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      RPE Score (Rate of Perceived Exertion)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="6"
                        max="20"
                        placeholder="6-20 (Borg Scale)"
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
                      6=No exertion, 9=Very light, 13=Somewhat hard, 15=Hard,
                      17=Very hard, 20=Maximal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
                      <FormDescription>For VO₂max norms</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bodyWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Weight (kg) *</FormLabel>
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
                      <FormDescription>For calorie calculation</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-5 w-5" /> Heart Rate Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="restingHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting Heart Rate (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="30"
                          max="100"
                          placeholder="Measured before test"
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
                        Measured after 5-min rest
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Heart Rate (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="100"
                          max="220"
                          placeholder="Peak HR during test"
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
                        Highest HR recorded (use heart rate monitor)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="heartRateAt1Min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HR at 1 Min Recovery (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="60"
                          max="200"
                          placeholder="HR 1 minute after test"
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
                        For heart rate recovery calculation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="heartRateAt2Min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HR at 2 Min Recovery (bpm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="60"
                          max="180"
                          placeholder="HR 2 minutes after test"
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
              </div>
            </CardContent>
          </Card>

          {/* Environmental Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wind className="h-5 w-5" /> Environmental Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min="-10"
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
                  name="humidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Humidity (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
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
                  name="altitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altitude (meters)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="5000"
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
                      <FormDescription>Above sea level</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="surfaceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="indoor_wood">
                          Indoor (Wood Floor)
                        </SelectItem>
                        <SelectItem value="indoor_synthetic">
                          Indoor (Synthetic)
                        </SelectItem>
                        <SelectItem value="outdoor_grass">
                          Outdoor (Grass)
                        </SelectItem>
                        <SelectItem value="outdoor_track">
                          Outdoor (Running Track)
                        </SelectItem>
                        <SelectItem value="outdoor_court">
                          Outdoor (Court)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Performance Metrics Dashboard */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isCalculating ? "Calculating..." : "Performance Analysis"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* VO2max Rating */}
              <div className="p-4 rounded-lg bg-background border-2 border-primary">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Cardiovascular Fitness
                  </p>
                  <Badge className={getRatingColor(metrics.vo2MaxRating)}>
                    {metrics.vo2MaxRating}
                  </Badge>
                </div>
                <div className="text-4xl font-bold text-primary">
                  {metrics.estimatedVO2Max.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  VO₂max (ml/kg/min) - Oxygen utilization capacity
                </p>
              </div>

              {/* Test Performance */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Test Performance
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Total Distance
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.totalDistance}m
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics.totalShuttles} shuttles
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-lg font-bold">
                      {Math.floor(metrics.totalTime / 60)}:
                      {(metrics.totalTime % 60).toString().padStart(2, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics.totalTime}s total
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Average Speed
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.averageSpeed} km/h
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Final Speed</p>
                    <p className="text-lg font-bold">
                      {metrics.finalSpeed} km/h
                    </p>
                  </div>
                </div>
              </div>

              {/* Heart Rate Analysis */}
              {(metrics.heartRateReserve || metrics.heartRateRecovery) && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Heart Rate Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">Max HR</p>
                      <p className="text-lg font-bold">
                        {form.watch("maxHeartRate") ||
                          metrics.maxHeartRateEstimated}{" "}
                        bpm
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {form.watch("maxHeartRate") ? "Measured" : "Estimated"}
                      </p>
                    </div>
                    {metrics.heartRateReserve && (
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="text-xs text-muted-foreground">
                          HR Reserve
                        </p>
                        <p className="text-lg font-bold">
                          {metrics.heartRateReserve} bpm
                        </p>
                      </div>
                    )}
                    {metrics.heartRateRecovery && (
                      <>
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground">
                            HR Recovery (1 min)
                          </p>
                          <p className="text-lg font-bold">
                            -{metrics.heartRateRecovery} bpm
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground">
                            Recovery Score
                          </p>
                          <p className="text-lg font-bold">
                            {metrics.recoveryScore}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Fitness Metrics */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Fitness Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">METs</p>
                    <p className="text-lg font-bold">
                      {metrics.metabolicEquivalent}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Metabolic equivalent
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Anaerobic Threshold
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.anaerobicThreshold?.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ml/kg/min (~85% VO₂max)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Calories Burned
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.caloriesBurned} kcal
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Fitness Age</p>
                    <p className="text-lg font-bold">
                      {metrics.fitnessAge || form.watch("athleteAge")} years
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics.fitnessAge &&
                      metrics.fitnessAge < form.watch("athleteAge")!
                        ? `${
                            form.watch("athleteAge")! - metrics.fitnessAge
                          } years younger!`
                        : "At chronological age"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparative Analysis */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Comparative Analysis
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Percentile Rank
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.percentileRank}th
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      For age/gender group
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Performance Index
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.performanceIndex}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      vs. predicted (Level {metrics.predictedLevel})
                    </p>
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
                      <span className="font-semibold">
                        Cardiovascular Fitness:
                      </span>{" "}
                      {metrics.vo2MaxRating} - VO₂max of{" "}
                      {metrics.estimatedVO2Max.toFixed(1)} ml/kg/min
                    </li>
                    <li>
                      <span className="font-semibold">Test Performance:</span>{" "}
                      Level {form.watch("levelReached")}, Shuttle{" "}
                      {form.watch("shuttlesInFinalLevel")} - Covered{" "}
                      {metrics.totalDistance}m in{" "}
                      {Math.floor(metrics.totalTime / 60)}:
                      {(metrics.totalTime % 60).toString().padStart(2, "0")}
                    </li>
                    <li>
                      <span className="font-semibold">Ranking:</span> Top{" "}
                      {100 - metrics.percentileRank}% of{" "}
                      {form.watch("athleteGender")}s aged{" "}
                      {getAgeCategory(form.watch("athleteAge") || 25)}
                    </li>
                    {metrics.heartRateRecovery && (
                      <li>
                        <span className="font-semibold">Recovery:</span>{" "}
                        {metrics.recoveryScore} - HR dropped{" "}
                        {metrics.heartRateRecovery} bpm in first minute
                      </li>
                    )}
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
                        placeholder="Athlete pacing strategy, signs of fatigue, breathing patterns, any irregularities..."
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
              {form.formState.isSubmitting ? "Saving..." : "Save Beep Test"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
