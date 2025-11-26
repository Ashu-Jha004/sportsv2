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
  RotateCcw,
  Activity,
  Loader2,
  Info,
  Trophy,
  Gauge,
  TrendingUp,
} from "lucide-react";

/* ============================
   ZOD SCHEMA
============================ */

const yoYoTestSchema = z.object({
  // Test variant
  testType: z.enum(["YYIR1", "YYIR2"]).default("YYIR1"),

  // Core performance data
  speedLevelReached: z.number().min(1).max(23),
  distanceInFinalSpeed: z.number().min(0).max(160), // meters in final speed level
  totalRecoveryPeriods: z.number().min(0).max(100), // Number of 10s recovery periods completed

  // Athlete profile
  athleteAge: z.number().min(10).max(60),
  athleteGender: z.enum(["male", "female"]),
  primarySport: z
    .enum([
      "soccer",
      "basketball",
      "handball",
      "hockey",
      "rugby",
      "tennis",
      "other",
    ])
    .default("soccer"),
  playingPosition: z.string().optional(),

  // Performance quality indicators
  recoveryQuality: z
    .enum(["excellent", "good", "moderate", "poor"])
    .default("good"),
  technicalBreakdown: z
    .enum(["none", "slight", "moderate", "severe"])
    .default("none"),
  mentalFatigue: z.number().min(1).max(10).optional(), // 1=Fresh, 10=Mentally exhausted

  // Blood lactate (if measured)
  bloodLactatePostTest: z.number().min(0).max(25).optional(), // mmol/L
  bloodLactateAt3Min: z.number().min(0).max(20).optional(), // mmol/L at 3min recovery

  // Perceived recovery
  legHeavinessScore: z.number().min(1).max(10).optional(), // 1=No heaviness, 10=Very heavy
  breathingDifficulty: z.number().min(1).max(10).optional(), // 1=Easy, 10=Very difficult

  // Environmental
  temperature: z.number().min(-10).max(50).optional(),
  surfaceType: z
    .enum(["indoor", "outdoor_grass", "outdoor_turf", "outdoor_court"])
    .default("indoor"),

  notes: z.string().optional(),
});

type YoYoTestData = z.infer<typeof yoYoTestSchema>;

type Props = {
  initialData?: Partial<YoYoTestData>;
  onSave: (data: any) => void;
};

/* ============================
   YO-YO TEST LEVEL DATA
   YYIR1: Starts at 10 km/h, increases 0.5 km/h
   YYIR2: Starts at 13 km/h, increases 0.5 km/h
============================ */

const YYIR1_LEVELS = [
  { level: 1, speed: 10.0, shuttles: 4, distance: 160 },
  { level: 2, speed: 11.0, shuttles: 6, distance: 240 },
  { level: 3, speed: 12.0, shuttles: 8, distance: 320 },
  { level: 4, speed: 13.0, shuttles: 8, distance: 320 },
  { level: 5, speed: 13.5, shuttles: 8, distance: 320 },
  { level: 6, speed: 14.0, shuttles: 8, distance: 320 },
  { level: 7, speed: 14.5, shuttles: 8, distance: 320 },
  { level: 8, speed: 15.0, shuttles: 8, distance: 320 },
  { level: 9, speed: 15.5, shuttles: 8, distance: 320 },
  { level: 10, speed: 16.0, shuttles: 8, distance: 320 },
  { level: 11, speed: 16.5, shuttles: 8, distance: 320 },
  { level: 12, speed: 17.0, shuttles: 8, distance: 320 },
  { level: 13, speed: 17.5, shuttles: 8, distance: 320 },
  { level: 14, speed: 18.0, shuttles: 8, distance: 320 },
  { level: 15, speed: 18.5, shuttles: 8, distance: 320 },
  { level: 16, speed: 19.0, shuttles: 8, distance: 320 },
  { level: 17, speed: 19.5, shuttles: 8, distance: 320 },
  { level: 18, speed: 20.0, shuttles: 8, distance: 320 },
];

const YYIR2_LEVELS = [
  { level: 1, speed: 13.0, shuttles: 3, distance: 120 },
  { level: 2, speed: 14.0, shuttles: 4, distance: 160 },
  { level: 3, speed: 15.0, shuttles: 4, distance: 160 },
  { level: 4, speed: 15.5, shuttles: 4, distance: 160 },
  { level: 5, speed: 16.0, shuttles: 4, distance: 160 },
  { level: 6, speed: 16.5, shuttles: 4, distance: 160 },
  { level: 7, speed: 17.0, shuttles: 4, distance: 160 },
  { level: 8, speed: 17.5, shuttles: 4, distance: 160 },
  { level: 9, speed: 18.0, shuttles: 4, distance: 160 },
  { level: 10, speed: 18.5, shuttles: 4, distance: 160 },
  { level: 11, speed: 19.0, shuttles: 4, distance: 160 },
  { level: 12, speed: 19.5, shuttles: 4, distance: 160 },
  { level: 13, speed: 20.0, shuttles: 4, distance: 160 },
  { level: 14, speed: 20.5, shuttles: 4, distance: 160 },
  { level: 15, speed: 21.0, shuttles: 4, distance: 160 },
  { level: 16, speed: 21.5, shuttles: 4, distance: 160 },
  { level: 17, speed: 22.0, shuttles: 4, distance: 160 },
  { level: 18, speed: 22.5, shuttles: 4, distance: 160 },
];

/* ============================
   PERFORMANCE RATINGS BY SPORT
============================ */

const SPORT_NORMS_YYIR1 = {
  soccer: {
    elite: 2520,
    good: 2160,
    average: 1800,
    belowAverage: 1440,
    poor: 0,
  },
  basketball: {
    elite: 2200,
    good: 1920,
    average: 1640,
    belowAverage: 1360,
    poor: 0,
  },
  handball: {
    elite: 2400,
    good: 2080,
    average: 1760,
    belowAverage: 1440,
    poor: 0,
  },
  hockey: {
    elite: 2320,
    good: 2000,
    average: 1680,
    belowAverage: 1360,
    poor: 0,
  },
  rugby: {
    elite: 2160,
    good: 1880,
    average: 1600,
    belowAverage: 1320,
    poor: 0,
  },
  tennis: {
    elite: 2000,
    good: 1760,
    average: 1520,
    belowAverage: 1280,
    poor: 0,
  },
  other: {
    elite: 2200,
    good: 1920,
    average: 1640,
    belowAverage: 1360,
    poor: 0,
  },
};

/* ============================
   CALCULATED METRICS TYPE
============================ */

type CalculatedMetrics = {
  // Distance & performance
  totalDistance: number;
  totalActiveTime: number; // seconds (excluding recovery)
  totalTestDuration: number; // seconds (including recovery)
  activeToRecoveryRatio: number;

  // Intermittent endurance
  intermittentEnduranceScore: number; // Yo-Yo specific score
  estimatedVO2MaxIntermittent: number; // Different from continuous VO2max
  sportSpecificRating: string;

  // Recovery capacity
  recoveryEfficiencyIndex: number; // How well they used recovery periods
  lactateClearanceRate: number | null; // If lactate measured
  recoveryPowerScore: number; // Ability to recover between efforts

  // Performance quality
  paceConsistency: number; // Based on technical breakdown
  mentalResilienceScore: number | null;
  fatigueResistanceIndex: number;

  // Sport-specific metrics
  repeatedHighIntensityRunningAbility: number; // RHIRA score
  matchFitnessEquivalent: number; // Minutes of match play
  speedReservePercentage: number; // % of max speed maintained

  // Comparative
  performanceLevel:
    | "Elite"
    | "Professional"
    | "Semi-Professional"
    | "Amateur"
    | "Recreational";
  percentileInSport: number;
  trainingZoneSpeed: number; // km/h for interval training
};

/* ============================
   HELPER FUNCTIONS
============================ */

function getSportRating(distance: number, sport: string): string {
  const norms =
    SPORT_NORMS_YYIR1[sport as keyof typeof SPORT_NORMS_YYIR1] ||
    SPORT_NORMS_YYIR1.other;

  if (distance >= norms.elite) return "Elite";
  if (distance >= norms.good) return "Good";
  if (distance >= norms.average) return "Average";
  if (distance >= norms.belowAverage) return "Below Average";
  return "Poor";
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case "Elite":
      return "bg-purple-100 text-purple-900 border-purple-300";
    case "Professional":
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "Good":
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

function calculateMetrics(data: Partial<YoYoTestData>): CalculatedMetrics {
  const {
    testType = "YYIR1",
    speedLevelReached = 1,
    distanceInFinalSpeed = 0,
    totalRecoveryPeriods = 0,
    primarySport = "soccer",
    technicalBreakdown = "none",
    mentalFatigue,
    bloodLactatePostTest,
    bloodLactateAt3Min,
    recoveryQuality = "good",
    legHeavinessScore,
    breathingDifficulty,
  } = data;

  const levels = testType === "YYIR1" ? YYIR1_LEVELS : YYIR2_LEVELS;

  // Total distance calculation
  const completedLevels = levels.slice(0, speedLevelReached - 1);
  const totalCompletedDistance = completedLevels.reduce(
    (sum, l) => sum + l.distance,
    0
  );
  const totalDistance = totalCompletedDistance + distanceInFinalSpeed;

  // Time calculations
  const shuttleTime = 40 / levels[speedLevelReached - 1]?.speed || 4; // Time per 40m
  const activeShuttles = totalDistance / 40;
  const totalActiveTime = Math.round(activeShuttles * shuttleTime);
  const totalRecoveryTime = totalRecoveryPeriods * 10; // 10 seconds per recovery
  const totalTestDuration = totalActiveTime + totalRecoveryTime;

  // Active to recovery ratio
  const activeToRecoveryRatio = totalActiveTime / (totalRecoveryTime || 1);

  // Intermittent Endurance Score (Yo-Yo specific)
  const intermittentEnduranceScore = Math.round(totalDistance / 40);

  // Estimated VO2max for intermittent exercise (Bangsbo formula)
  // VO2max(int) = IR1 distance × 0.0084 + 36.4 (for YYIR1)
  // VO2max(int) = IR2 distance × 0.0136 + 45.3 (for YYIR2)
  let estimatedVO2MaxIntermittent;
  if (testType === "YYIR1") {
    estimatedVO2MaxIntermittent = totalDistance * 0.0084 + 36.4;
  } else {
    estimatedVO2MaxIntermittent = totalDistance * 0.0136 + 45.3;
  }
  estimatedVO2MaxIntermittent =
    Math.round(estimatedVO2MaxIntermittent * 10) / 10;

  // Sport-specific rating
  const sportSpecificRating = getSportRating(totalDistance, primarySport);

  // Recovery Efficiency Index
  const recoveryMultipliers = {
    excellent: 1.2,
    good: 1.0,
    moderate: 0.8,
    poor: 0.6,
  };
  const recoveryEfficiencyIndex = Math.round(
    (totalRecoveryPeriods / (speedLevelReached || 1)) *
      recoveryMultipliers[recoveryQuality] *
      100
  );

  // Lactate Clearance Rate (if available)
  let lactateClearanceRate = null;
  if (bloodLactatePostTest && bloodLactateAt3Min) {
    // mmol/L per minute
    lactateClearanceRate = (bloodLactatePostTest - bloodLactateAt3Min) / 3;
    lactateClearanceRate = Math.round(lactateClearanceRate * 100) / 100;
  }

  // Recovery Power Score
  const legHeaviness = legHeavinessScore || 5;
  const breathing = breathingDifficulty || 5;
  const recoveryPowerScore = Math.max(0, 100 - (legHeaviness + breathing) * 5);

  // Pace Consistency
  const technicalMultipliers = {
    none: 1.0,
    slight: 0.9,
    moderate: 0.75,
    severe: 0.5,
  };
  const paceConsistency = Math.round(
    technicalMultipliers[technicalBreakdown] * 100
  );

  // Mental Resilience Score
  const mentalResilienceScore = mentalFatigue
    ? Math.round((11 - mentalFatigue) * 10)
    : null;

  // Fatigue Resistance Index
  const fatigueResistanceIndex = Math.round(
    (paceConsistency +
      recoveryEfficiencyIndex +
      (mentalResilienceScore || 50)) /
      3
  );

  // Repeated High-Intensity Running Ability (RHIRA)
  const rhiraScore = Math.round(
    (totalDistance / 10) *
      (activeToRecoveryRatio / 5) *
      (recoveryEfficiencyIndex / 100)
  );

  // Match Fitness Equivalent (minutes of match play)
  // Elite player covers ~1200m high-intensity in 90min
  const matchFitnessEquivalent = Math.round((totalDistance / 1200) * 90);

  // Speed Reserve Percentage
  const finalSpeed = levels[speedLevelReached - 1]?.speed || 10;
  const maxPossibleSpeed = levels[levels.length - 1]?.speed || 20;
  const speedReservePercentage = Math.round(
    (finalSpeed / maxPossibleSpeed) * 100
  );

  // Performance Level
  let performanceLevel:
    | "Elite"
    | "Professional"
    | "Semi-Professional"
    | "Amateur"
    | "Recreational";
  if (totalDistance >= 2400) performanceLevel = "Elite";
  else if (totalDistance >= 2000) performanceLevel = "Professional";
  else if (totalDistance >= 1600) performanceLevel = "Semi-Professional";
  else if (totalDistance >= 1200) performanceLevel = "Amateur";
  else performanceLevel = "Recreational";

  // Percentile in sport
  const norms =
    SPORT_NORMS_YYIR1[primarySport as keyof typeof SPORT_NORMS_YYIR1] ||
    SPORT_NORMS_YYIR1.other;
  let percentileInSport = 50;
  if (totalDistance >= norms.elite) percentileInSport = 95;
  else if (totalDistance >= norms.good) percentileInSport = 75;
  else if (totalDistance >= norms.average) percentileInSport = 50;
  else if (totalDistance >= norms.belowAverage) percentileInSport = 25;
  else percentileInSport = 10;

  // Training Zone Speed (85% of final speed)
  const trainingZoneSpeed = Math.round(finalSpeed * 0.85 * 10) / 10;

  return {
    totalDistance,
    totalActiveTime,
    totalTestDuration,
    activeToRecoveryRatio: Math.round(activeToRecoveryRatio * 10) / 10,
    intermittentEnduranceScore,
    estimatedVO2MaxIntermittent,
    sportSpecificRating,
    recoveryEfficiencyIndex,
    lactateClearanceRate,
    recoveryPowerScore,
    paceConsistency,
    mentalResilienceScore,
    fatigueResistanceIndex,
    repeatedHighIntensityRunningAbility: rhiraScore,
    matchFitnessEquivalent,
    speedReservePercentage,
    performanceLevel,
    percentileInSport,
    trainingZoneSpeed,
  };
}

/* ============================
   MAIN COMPONENT
============================ */

export function YoYoTestForm({ initialData, onSave }: Props) {
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(yoYoTestSchema),
    defaultValues: {
      testType: initialData?.testType ?? "YYIR1",
      speedLevelReached: initialData?.speedLevelReached ?? 1,
      distanceInFinalSpeed: initialData?.distanceInFinalSpeed ?? 0,
      totalRecoveryPeriods: initialData?.totalRecoveryPeriods ?? 0,
      athleteAge: initialData?.athleteAge,
      athleteGender: initialData?.athleteGender ?? "male",
      primarySport: initialData?.primarySport ?? "soccer",
      playingPosition: initialData?.playingPosition ?? "",
      recoveryQuality: initialData?.recoveryQuality ?? "good",
      technicalBreakdown: initialData?.technicalBreakdown ?? "none",
      mentalFatigue: initialData?.mentalFatigue,
      bloodLactatePostTest: initialData?.bloodLactatePostTest,
      bloodLactateAt3Min: initialData?.bloodLactateAt3Min,
      legHeavinessScore: initialData?.legHeavinessScore,
      breathingDifficulty: initialData?.breathingDifficulty,
      temperature: initialData?.temperature,
      surfaceType: initialData?.surfaceType ?? "indoor",
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
    watchedData.testType,
    watchedData.speedLevelReached,
    watchedData.distanceInFinalSpeed,
    watchedData.totalRecoveryPeriods,
    watchedData.primarySport,
    watchedData.recoveryQuality,
    watchedData.technicalBreakdown,
    watchedData.mentalFatigue,
    watchedData.bloodLactatePostTest,
    watchedData.bloodLactateAt3Min,
    watchedData.legHeavinessScore,
    watchedData.breathingDifficulty,
  ]);

  const onSubmit = (data: YoYoTestData) => {
    try {
      const payload = {
        ...data,
        calculated: metrics,
        recordedAt: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.debug("[YoYoTestForm] Submitting:", payload);
      }

      onSave(payload);
    } catch (err) {
      console.error("[YoYoTestForm] Error:", err);
      form.setError("root", {
        type: "manual",
        message: "Failed to save Yo-Yo test data",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Yo-Yo Intermittent Recovery Test
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Progressive shuttle run with active recovery periods. Assesses ability
          to repeatedly perform high-intensity exercise with short
          recovery—crucial for team sports performance.
        </p>
      </div>

      {/* Test Overview */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-indigo-600" /> Test Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-indigo-900">Format</p>
              <p className="text-indigo-800 text-xs">
                2 × 20m shuttles + 10s active recovery (5m jog out & back)
              </p>
            </div>
            <div>
              <p className="font-semibold text-indigo-900">Test Variants</p>
              <p className="text-indigo-800 text-xs">
                YYIR1 (10-18 km/h) | YYIR2 (13-22.5 km/h) - Higher intensity
              </p>
            </div>
            <div>
              <p className="font-semibold text-indigo-900">Key Difference</p>
              <p className="text-indigo-800 text-xs">
                Recovery periods simulate match conditions (repeated sprints)
              </p>
            </div>
            <div>
              <p className="font-semibold text-indigo-900">Applications</p>
              <p className="text-indigo-800 text-xs">
                Team sports fitness, training prescription, player monitoring
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
                <Activity className="h-5 w-5" /> Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="testType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="YYIR1">
                          YYIR1 (Standard - 10-18 km/h)
                        </SelectItem>
                        <SelectItem value="YYIR2">
                          YYIR2 (High Intensity - 13-22.5 km/h)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      YYIR1 for general fitness, YYIR2 for elite athletes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Performance Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-5 w-5" /> Performance Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="speedLevelReached"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speed Level Reached *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="23"
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
                        Final speed level completed (1-18 typical)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="distanceInFinalSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance in Final Level (m) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="320"
                          step="40"
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
                        Distance covered in incomplete level (40m increments)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="totalRecoveryPeriods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Recovery Periods Completed *</FormLabel>
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
                    <FormDescription>
                      Number of 10-second recovery jogs completed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Athlete Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-5 w-5" /> Athlete Profile
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
                          min="10"
                          max="60"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primarySport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Sport *</FormLabel>
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
                          <SelectItem value="soccer">
                            Soccer/Football
                          </SelectItem>
                          <SelectItem value="basketball">Basketball</SelectItem>
                          <SelectItem value="handball">Handball</SelectItem>
                          <SelectItem value="hockey">Hockey</SelectItem>
                          <SelectItem value="rugby">Rugby</SelectItem>
                          <SelectItem value="tennis">Tennis</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        For sport-specific norms
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="playingPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Playing Position</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Midfielder, Forward, Defender"
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

          {/* Performance Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="h-5 w-5" /> Recovery & Performance Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="recoveryQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Quality</FormLabel>
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
                          <SelectItem value="excellent">
                            Excellent - Full recovery each time
                          </SelectItem>
                          <SelectItem value="good">
                            Good - Adequate recovery
                          </SelectItem>
                          <SelectItem value="moderate">
                            Moderate - Partial recovery
                          </SelectItem>
                          <SelectItem value="poor">
                            Poor - Minimal recovery
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How well athlete recovered in 10s periods
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technicalBreakdown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Breakdown</FormLabel>
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
                          <SelectItem value="none">
                            None - Perfect form throughout
                          </SelectItem>
                          <SelectItem value="slight">
                            Slight - Minor form changes
                          </SelectItem>
                          <SelectItem value="moderate">
                            Moderate - Noticeable fatigue
                          </SelectItem>
                          <SelectItem value="severe">
                            Severe - Significant breakdown
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Running form degradation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="mentalFatigue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mental Fatigue (1-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="1=Fresh, 10=Exhausted"
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
                        Mental state at test end
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legHeavinessScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leg Heaviness (1-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="1=Light, 10=Very heavy"
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
                      <FormDescription>Perceived leg fatigue</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="breathingDifficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breathing Difficulty (1-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="1=Easy, 10=Very difficult"
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
                      <FormDescription>Respiratory stress</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Blood Lactate (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" /> Blood Lactate Measurement
                (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bloodLactatePostTest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post-Test Lactate (mmol/L)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="25"
                          placeholder="Immediately after test"
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
                        Measured within 1 minute of test completion
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodLactateAt3Min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3-Min Recovery Lactate (mmol/L)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="20"
                          placeholder="3 minutes after test"
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
                        For lactate clearance rate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Environmental */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-5 w-5" /> Test Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                          <SelectItem value="indoor">Indoor (Gym)</SelectItem>
                          <SelectItem value="outdoor_grass">
                            Outdoor (Grass)
                          </SelectItem>
                          <SelectItem value="outdoor_turf">
                            Outdoor (Artificial Turf)
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
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis Dashboard */}
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
                    Performance Level
                  </p>
                  <Badge className={getRatingColor(metrics.performanceLevel)}>
                    {metrics.performanceLevel}
                  </Badge>
                </div>
                <div className="text-4xl font-bold text-primary">
                  {metrics.totalDistance}m
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total distance covered | {metrics.sportSpecificRating} for{" "}
                  {form.watch("primarySport")}
                </p>
              </div>

              {/* Intermittent Endurance */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Intermittent Endurance
                  Capacity
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Endurance Score
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.intermittentEnduranceScore}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      40m shuttles completed
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      VO₂max (Intermittent)
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.estimatedVO2MaxIntermittent.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ml/kg/min
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Active Time</p>
                    <p className="text-lg font-bold">
                      {Math.floor(metrics.totalActiveTime / 60)}:
                      {(metrics.totalActiveTime % 60)
                        .toString()
                        .padStart(2, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics.totalActiveTime}s running
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Total Duration
                    </p>
                    <p className="text-lg font-bold">
                      {Math.floor(metrics.totalTestDuration / 60)}:
                      {(metrics.totalTestDuration % 60)
                        .toString()
                        .padStart(2, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Including recovery
                    </p>
                  </div>
                </div>
              </div>

              {/* Recovery Capacity */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Recovery Capacity
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Recovery Efficiency
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.recoveryEfficiencyIndex}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Recovery Power
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.recoveryPowerScore}/100
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Active:Recovery Ratio
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.activeToRecoveryRatio}:1
                    </p>
                  </div>
                  {metrics.lactateClearanceRate && (
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Lactate Clearance
                      </p>
                      <p className="text-lg font-bold">
                        {metrics.lactateClearanceRate.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        mmol/L per min
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sport-Specific Metrics */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Sport-Specific Performance
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">RHIRA Score</p>
                    <p className="text-lg font-bold">
                      {metrics.repeatedHighIntensityRunningAbility}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Repeated high-intensity ability
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Match Fitness
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.matchFitnessEquivalent} min
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Match play equivalent
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Speed Reserve
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.speedReservePercentage}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Of maximum speed
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Training Zone Speed
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.trainingZoneSpeed} km/h
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      85% of final speed
                    </p>
                  </div>
                </div>
              </div>

              {/* Fatigue Resistance */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Fatigue Resistance & Quality
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Pace Consistency
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.paceConsistency}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Fatigue Resistance
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.fatigueResistanceIndex}/100
                    </p>
                  </div>
                  {metrics.mentalResilienceScore && (
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Mental Resilience
                      </p>
                      <p className="text-lg font-bold">
                        {metrics.mentalResilienceScore}/100
                      </p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Percentile Rank
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.percentileInSport}th
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      In {form.watch("primarySport")}
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
                      <span className="font-semibold">Performance Level:</span>{" "}
                      {metrics.performanceLevel} - {metrics.totalDistance}m
                      total distance
                    </li>
                    <li>
                      <span className="font-semibold">Sport Rating:</span>{" "}
                      {metrics.sportSpecificRating} for{" "}
                      {form.watch("primarySport")} (Top{" "}
                      {100 - metrics.percentileInSport}%)
                    </li>
                    <li>
                      <span className="font-semibold">Recovery Ability:</span>{" "}
                      {metrics.recoveryEfficiencyIndex}% efficiency with{" "}
                      {form.watch("totalRecoveryPeriods")} recovery periods
                    </li>
                    <li>
                      <span className="font-semibold">Match Readiness:</span>{" "}
                      Can sustain {metrics.matchFitnessEquivalent} minutes of
                      high-intensity match play
                    </li>
                    <li>
                      <span className="font-semibold">
                        Training Prescription:
                      </span>{" "}
                      Interval training at {metrics.trainingZoneSpeed} km/h
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
                        placeholder="Recovery strategy, pacing approach, fatigue signs, any technical issues..."
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
              {form.formState.isSubmitting ? "Saving..." : "Save Yo-Yo Test"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
