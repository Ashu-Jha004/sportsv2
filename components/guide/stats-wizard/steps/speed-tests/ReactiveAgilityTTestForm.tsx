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
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Activity,
  Loader2,
  Plus,
  Trash2,
  Info,
  Brain,
  Timer,
  Target,
} from "lucide-react";

/* ============================
   ZOD SCHEMA
============================ */

const attemptSchema = z.object({
  attemptNumber: z.number().min(1).max(10),
  totalTime: z.number().min(5).max(20), // Total completion time
  decisionTime: z.number().min(0.1).max(3).optional(), // Time to recognize stimulus
  movementTime: z.number().min(4).max(18).optional(), // Time to complete movement
  cuedDirection: z.enum(["left", "right", "forward", "backward"]).optional(),
  responseCorrect: z.boolean().default(true),
  penaltySeconds: z.number().min(0).max(5).default(0), // Time penalty for errors
  notes: z.string().optional(),
});

const reactiveAgilityTTestSchema = z.object({
  // Test configuration
  testMode: z.enum(["reactive", "traditional"]).default("reactive"),
  cueType: z.enum(["visual", "auditory", "mixed"]).default("visual"),
  cueDelay: z.number().min(0).max(3).default(0), // Random delay before cue

  // Course setup
  courseDistance: z.number().min(5).max(5).default(5), // meters (T-Test standard)
  coneSpacing: z.number().min(5).max(5).default(5), // meters between side cones

  // Athlete info
  athleteAge: z.number().min(5).max(100).optional(),
  athleteGender: z.enum(["male", "female"]).default("male"),
  primarySport: z.string().optional(),

  // Performance data
  attempts: z.array(attemptSchema).min(3).max(10),

  // Environmental factors
  surfaceType: z
    .enum([
      "indoor_wood",
      "indoor_synthetic",
      "outdoor_grass",
      "outdoor_synthetic",
      "outdoor_court",
    ])
    .default("indoor_synthetic"),
  footwear: z.string().optional(),
  athleteCondition: z.enum(["fresh", "fatigued", "normal"]).default("normal"),

  notes: z.string().optional(),
});

type ReactiveAgilityTTestData = z.infer<typeof reactiveAgilityTTestSchema>;

type Props = {
  initialData?: Partial<ReactiveAgilityTTestData>;
  onSave: (data: any) => void;
};

/* ============================
   NORMATIVE DATA
============================ */

const T_TEST_NORMS = {
  male: {
    excellent: { min: 0, max: 9.5 },
    good: { min: 9.5, max: 10.5 },
    average: { min: 10.5, max: 11.5 },
    belowAverage: { min: 11.5, max: 12.5 },
    poor: { min: 12.5, max: 20 },
  },
  female: {
    excellent: { min: 0, max: 10.5 },
    good: { min: 10.5, max: 11.5 },
    average: { min: 11.5, max: 12.5 },
    belowAverage: { min: 12.5, max: 13.5 },
    poor: { min: 13.5, max: 20 },
  },
};

// Reactive component typically adds 0.5-1.5s to traditional T-Test
const REACTIVE_PENALTY_ESTIMATE = 1.0; // seconds

/* ============================
   CALCULATED METRICS TYPE
============================ */

type CalculatedMetrics = {
  // Time metrics
  bestTime: number | null;
  worstTime: number | null;
  averageTime: number | null;
  medianTime: number | null;

  // Decision & movement analysis
  averageDecisionTime: number | null;
  averageMovementTime: number | null;
  decisionToMovementRatio: number | null;

  // Statistical measures
  standardDeviation: number | null;
  coefficientOfVariation: number | null;

  // Reactive performance
  totalAttempts: number;
  correctResponses: number;
  accuracyPercentage: number | null;
  totalPenaltyTime: number | null;

  // Consistency
  consistency: "Excellent" | "Good" | "Fair" | "Poor";
  reliabilityScore: number | null;

  // Performance trends
  fatigueIndex: number | null; // First vs Last
  learningCurve: number | null; // Improvement from first to best

  // Comparative analysis
  estimatedTraditionalTime: number | null; // Remove reactive component
  performanceRating: string;
  reactiveCognitiveCost: number | null; // Extra time due to decision-making

  // Agility metrics
  changeOfDirectionSpeed: number | null;
  cognitiveAgilityScore: number | null; // Combines speed + accuracy
};

/* ============================
   HELPER FUNCTIONS
============================ */

function getPerformanceRating(
  time: number,
  gender: "male" | "female",
  isReactive: boolean
): string {
  // Adjust time if reactive (remove reactive penalty for comparison)
  const adjustedTime = isReactive ? time - REACTIVE_PENALTY_ESTIMATE : time;
  const norms = T_TEST_NORMS[gender];

  if (adjustedTime <= norms.excellent.max) return "Excellent";
  if (adjustedTime <= norms.good.max) return "Good";
  if (adjustedTime <= norms.average.max) return "Average";
  if (adjustedTime <= norms.belowAverage.max) return "Below Average";
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
  gender: "male" | "female",
  isReactive: boolean
): CalculatedMetrics {
  if (attempts.length === 0) {
    return {
      bestTime: null,
      worstTime: null,
      averageTime: null,
      medianTime: null,
      averageDecisionTime: null,
      averageMovementTime: null,
      decisionToMovementRatio: null,
      standardDeviation: null,
      coefficientOfVariation: null,
      totalAttempts: 0,
      correctResponses: 0,
      accuracyPercentage: null,
      totalPenaltyTime: null,
      consistency: "Poor",
      reliabilityScore: null,
      fatigueIndex: null,
      learningCurve: null,
      estimatedTraditionalTime: null,
      performanceRating: "No data",
      reactiveCognitiveCost: null,
      changeOfDirectionSpeed: null,
      cognitiveAgilityScore: null,
    };
  }

  const times = attempts.map((a) => a.totalTime).sort((a, b) => a - b);
  const n = times.length;

  // Basic stats
  const bestTime = times[0];
  const worstTime = times[n - 1];
  const sum = times.reduce((a, b) => a + b, 0);
  const averageTime = sum / n;

  // Median
  const medianTime =
    n % 2 === 0
      ? (times[n / 2 - 1] + times[n / 2]) / 2
      : times[Math.floor(n / 2)];

  // Standard deviation
  const variance =
    times.reduce((sum, t) => sum + Math.pow(t - averageTime, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);

  // Coefficient of variation
  const coefficientOfVariation = (standardDeviation / averageTime) * 100;

  // Consistency
  let consistency: "Excellent" | "Good" | "Fair" | "Poor" = "Poor";
  if (coefficientOfVariation <= 3) consistency = "Excellent";
  else if (coefficientOfVariation <= 5) consistency = "Good";
  else if (coefficientOfVariation <= 8) consistency = "Fair";

  // Reliability
  const reliabilityScore = Math.max(0, 100 - coefficientOfVariation * 10);

  // Decision & Movement times
  const decisionTimes = attempts
    .filter((a) => a.decisionTime)
    .map((a) => a.decisionTime);
  const averageDecisionTime =
    decisionTimes.length > 0
      ? decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length
      : null;

  const movementTimes = attempts
    .filter((a) => a.movementTime)
    .map((a) => a.movementTime);
  const averageMovementTime =
    movementTimes.length > 0
      ? movementTimes.reduce((a, b) => a + b, 0) / movementTimes.length
      : null;

  const decisionToMovementRatio =
    averageDecisionTime && averageMovementTime
      ? (averageDecisionTime / averageMovementTime) * 100
      : null;

  // Accuracy
  const correctResponses = attempts.filter(
    (a) => a.responseCorrect !== false
  ).length;
  const accuracyPercentage = (correctResponses / attempts.length) * 100;

  // Total penalties
  const totalPenaltyTime = attempts.reduce(
    (sum, a) => sum + (a.penaltySeconds || 0),
    0
  );

  // Fatigue index
  let fatigueIndex = null;
  if (n >= 6) {
    const first3Avg =
      attempts.slice(0, 3).reduce((sum, a) => sum + a.totalTime, 0) / 3;
    const last3Avg =
      attempts.slice(-3).reduce((sum, a) => sum + a.totalTime, 0) / 3;
    fatigueIndex = ((last3Avg - first3Avg) / first3Avg) * 100;
  }

  // Learning curve
  const firstAttempt = attempts[0]?.totalTime;
  const learningCurve = firstAttempt
    ? ((firstAttempt - bestTime) / firstAttempt) * 100
    : null;

  // Estimated traditional time (remove reactive component)
  const estimatedTraditionalTime = isReactive
    ? Math.max(bestTime - REACTIVE_PENALTY_ESTIMATE, 8.0)
    : bestTime;

  // Reactive cognitive cost
  const reactiveCognitiveCost = isReactive
    ? averageDecisionTime || REACTIVE_PENALTY_ESTIMATE
    : null;

  // Performance rating
  const performanceRating = getPerformanceRating(bestTime, gender, isReactive);

  // Change of Direction Speed (inversely proportional to time)
  const changeOfDirectionSpeed = Math.round((10 / bestTime) * 100);

  // Cognitive Agility Score (combines speed + accuracy)
  const speedScore = Math.max(0, 100 - (bestTime - 9) * 10);
  const cognitiveAgilityScore = Math.round(
    speedScore * 0.7 + accuracyPercentage * 0.3
  );

  return {
    bestTime: Math.round(bestTime * 100) / 100,
    worstTime: Math.round(worstTime * 100) / 100,
    averageTime: Math.round(averageTime * 100) / 100,
    medianTime: Math.round(medianTime * 100) / 100,
    averageDecisionTime: averageDecisionTime
      ? Math.round(averageDecisionTime * 1000) / 1000
      : null,
    averageMovementTime: averageMovementTime
      ? Math.round(averageMovementTime * 100) / 100
      : null,
    decisionToMovementRatio: decisionToMovementRatio
      ? Math.round(decisionToMovementRatio * 10) / 10
      : null,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    coefficientOfVariation: Math.round(coefficientOfVariation * 10) / 10,
    totalAttempts: attempts.length,
    correctResponses,
    accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
    totalPenaltyTime: Math.round(totalPenaltyTime * 100) / 100,
    consistency,
    reliabilityScore: Math.round(reliabilityScore),
    fatigueIndex: fatigueIndex ? Math.round(fatigueIndex * 10) / 10 : null,
    learningCurve: learningCurve ? Math.round(learningCurve * 10) / 10 : null,
    estimatedTraditionalTime: Math.round(estimatedTraditionalTime * 100) / 100,
    performanceRating,
    reactiveCognitiveCost: reactiveCognitiveCost
      ? Math.round(reactiveCognitiveCost * 1000) / 1000
      : null,
    changeOfDirectionSpeed,
    cognitiveAgilityScore,
  };
}

/* ============================
   MAIN COMPONENT
============================ */

export function ReactiveAgilityTTestForm({ initialData, onSave }: Props) {
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(reactiveAgilityTTestSchema),
    defaultValues: {
      testMode: initialData?.testMode ?? "reactive",
      cueType: initialData?.cueType ?? "visual",
      cueDelay: initialData?.cueDelay ?? 0,
      courseDistance: 5,
      coneSpacing: 5,
      athleteAge: initialData?.athleteAge,
      athleteGender: initialData?.athleteGender ?? "male",
      primarySport: initialData?.primarySport ?? "",
      surfaceType: initialData?.surfaceType ?? "indoor_synthetic",
      footwear: initialData?.footwear ?? "",
      athleteCondition: initialData?.athleteCondition ?? "normal",
      attempts: initialData?.attempts ?? [
        {
          attemptNumber: 1,
          totalTime: 0,
          responseCorrect: true,
          penaltySeconds: 0,
        },
        {
          attemptNumber: 2,
          totalTime: 0,
          responseCorrect: true,
          penaltySeconds: 0,
        },
        {
          attemptNumber: 3,
          totalTime: 0,
          responseCorrect: true,
          penaltySeconds: 0,
        },
      ],
      notes: initialData?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attempts",
  });

  const attemptsData = form.watch("attempts");
  const athleteGender = form.watch("athleteGender");
  const testMode = form.watch("testMode");

  // Real-time calculation
  const metrics = useMemo(() => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 300);
    return calculateMetrics(
      attemptsData,
      athleteGender,
      testMode === "reactive"
    );
  }, [attemptsData, athleteGender, testMode]);

  const onSubmit = (data: ReactiveAgilityTTestData) => {
    try {
      const payload = {
        ...data,
        calculated: metrics,
        recordedAt: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.debug("[ReactiveAgilityTTestForm] Submitting:", payload);
      }

      onSave(payload);
    } catch (err) {
      console.error("[ReactiveAgilityTTestForm] Error:", err);
      form.setError("root", {
        type: "manual",
        message: "Failed to save reactive agility test data",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Reactive Agility T-Test
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Advanced agility assessment combining change-of-direction speed with
          cognitive decision-making. Measures reactive agility—the ability to
          respond to unpredictable stimuli while maintaining movement
          efficiency.
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
              <p className="font-semibold text-indigo-900">Course Layout</p>
              <p className="text-indigo-800 text-xs">
                T-shape: 5m forward, 5m side-to-side (10m total width)
              </p>
            </div>
            <div>
              <p className="font-semibold text-indigo-900">
                Reactive Component
              </p>
              <p className="text-indigo-800 text-xs">
                Visual/auditory cues indicate direction (left/right/forward)
              </p>
            </div>
            <div>
              <p className="font-semibold text-indigo-900">Movement Pattern</p>
              <p className="text-indigo-800 text-xs">
                Sprint forward → React to cue → Change direction → Complete
                pattern
              </p>
            </div>
            <div>
              <p className="font-semibold text-indigo-900">Scoring</p>
              <p className="text-indigo-800 text-xs">
                Total time + accuracy penalties (wrong direction = +2s)
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
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="testMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Mode</FormLabel>
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
                          <SelectItem value="reactive">
                            Reactive (With Cues)
                          </SelectItem>
                          <SelectItem value="traditional">
                            Traditional (Predetermined)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {testMode === "reactive" && (
                  <>
                    <FormField
                      control={form.control}
                      name="cueType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cue Type</FormLabel>
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
                              <SelectItem value="visual">
                                Visual (Lights)
                              </SelectItem>
                              <SelectItem value="auditory">
                                Auditory (Voice)
                              </SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cueDelay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cue Delay (s)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="3"
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
                            Random delay before cue
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Athlete Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5" /> Athlete Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="athleteAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
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
                        For normative comparison
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primarySport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Sport</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Basketball"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
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
                          <SelectItem value="outdoor_court">
                            Outdoor (Court)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="footwear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footwear</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Court shoes, cleats"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="athleteCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
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
                          <SelectItem value="fresh">Fresh</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="fatigued">Fatigued</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Attempt Recording */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Timer className="h-5 w-5" /> Performance Attempts
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-2">
                Record total time for each attempt. Add penalties for incorrect
                responses.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 rounded-lg border bg-muted/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">Attempt {index + 1}</p>
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
                      name={`attempts.${index}.totalTime`}
                      render={({ field: timeField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Total Time (seconds)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="5"
                              max="20"
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

                    {testMode === "reactive" && (
                      <FormField
                        control={form.control}
                        name={`attempts.${index}.decisionTime`}
                        render={({ field: decisionField }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Decision Time (s)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.001"
                                min="0.1"
                                max="3"
                                placeholder="Optional"
                                {...decisionField}
                                value={decisionField.value ?? ""}
                                onChange={(e) =>
                                  decisionField.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Time to recognize stimulus
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {testMode === "reactive" && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`attempts.${index}.cuedDirection`}
                        render={({ field: dirField }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Cued Direction
                            </FormLabel>
                            <Select
                              value={dirField.value}
                              onValueChange={dirField.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="left">
                                  <div className="flex items-center gap-2">
                                    <ArrowLeft className="h-3 w-3" /> Left
                                  </div>
                                </SelectItem>
                                <SelectItem value="right">
                                  <div className="flex items-center gap-2">
                                    <ArrowRight className="h-3 w-3" /> Right
                                  </div>
                                </SelectItem>
                                <SelectItem value="forward">
                                  <div className="flex items-center gap-2">
                                    <ArrowUp className="h-3 w-3" /> Forward
                                  </div>
                                </SelectItem>
                                <SelectItem value="backward">
                                  <div className="flex items-center gap-2">
                                    <ArrowDown className="h-3 w-3" /> Backward
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`attempts.${index}.responseCorrect`}
                        render={({ field: correctField }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Response</FormLabel>
                            <Select
                              value={
                                correctField.value ? "correct" : "incorrect"
                              }
                              onValueChange={(val) =>
                                correctField.onChange(val === "correct")
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="correct">
                                  ✓ Correct
                                </SelectItem>
                                <SelectItem value="incorrect">
                                  ✗ Incorrect
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`attempts.${index}.penaltySeconds`}
                        render={({ field: penaltyField }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Penalty (s)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                max="5"
                                {...penaltyField}
                                value={penaltyField.value ?? ""}
                                onChange={(e) =>
                                  penaltyField.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Wrong direction: +2s
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                      attemptNumber: fields.length + 1,
                      totalTime: 0,
                      responseCorrect: true,
                      penaltySeconds: 0,
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

          {/* Performance Analysis */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isCalculating ? "Calculating..." : "Performance Analysis"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Rating */}
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
                <h4 className="font-semibold text-sm mb-3">Time Performance</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Best Time</p>
                    <p className="text-lg font-bold">
                      {metrics.bestTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="text-lg font-bold">
                      {metrics.averageTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Median</p>
                    <p className="text-lg font-bold">
                      {metrics.medianTime?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Std Dev</p>
                    <p className="text-lg font-bold">
                      {metrics.standardDeviation?.toFixed(2) ?? "—"}s
                    </p>
                  </div>
                </div>
              </div>

              {/* Reactive Performance */}
              {testMode === "reactive" && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4" /> Cognitive & Decision Making
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                      <p className="text-lg font-bold">
                        {metrics.accuracyPercentage?.toFixed(1) ?? "—"}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metrics.correctResponses}/{metrics.totalAttempts}{" "}
                        correct
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Avg Decision Time
                      </p>
                      <p className="text-lg font-bold">
                        {metrics.averageDecisionTime
                          ? (metrics.averageDecisionTime * 1000).toFixed(0)
                          : "—"}
                        ms
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Cognitive Cost
                      </p>
                      <p className="text-lg font-bold">
                        {metrics.reactiveCognitiveCost?.toFixed(3) ?? "—"}s
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Extra time for decision
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">
                        Total Penalties
                      </p>
                      <p className="text-lg font-bold">
                        +{metrics.totalPenaltyTime?.toFixed(1) ?? "—"}s
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Agility Metrics */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Agility Analysis
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      COD Speed Score
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.changeOfDirectionSpeed ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Out of 100
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Cognitive Agility
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.cognitiveAgilityScore ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Speed + Accuracy
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Consistency</p>
                    <p className="text-lg font-bold">{metrics.consistency}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CV: {metrics.coefficientOfVariation?.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Reliability</p>
                    <p className="text-lg font-bold">
                      {metrics.reliabilityScore ?? "—"}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparative Analysis */}
              {testMode === "reactive" && (
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Comparative Analysis
                  </h4>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Estimated Traditional T-Test Time
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics.estimatedTraditionalTime?.toFixed(2) ?? "—"}s
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Reactive component removed for comparison)
                    </p>
                  </div>
                </div>
              )}

              {/* Performance Trends */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Performance Trends
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">
                      Learning Curve
                    </p>
                    <p className="text-lg font-bold">
                      {metrics.learningCurve?.toFixed(1) ?? "—"}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Improvement from first
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
                      {metrics.fatigueIndex && metrics.fatigueIndex > 5
                        ? "Moderate fatigue"
                        : "Good resistance"}
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
                      <span className="font-semibold">Agility Rating:</span>{" "}
                      {metrics.performanceRating} - Best time{" "}
                      {metrics.bestTime?.toFixed(2)}s
                    </li>
                    {testMode === "reactive" && (
                      <>
                        <li>
                          <span className="font-semibold">
                            Decision Accuracy:
                          </span>{" "}
                          {metrics.accuracyPercentage?.toFixed(1)}% correct
                          responses
                        </li>
                        <li>
                          <span className="font-semibold">
                            Cognitive Speed:
                          </span>{" "}
                          {metrics.averageDecisionTime
                            ? (metrics.averageDecisionTime * 1000).toFixed(0)
                            : "—"}
                          ms average decision time
                        </li>
                      </>
                    )}
                    <li>
                      <span className="font-semibold">Consistency:</span>{" "}
                      {metrics.consistency} (CV{" "}
                      {metrics.coefficientOfVariation?.toFixed(1)}%)
                    </li>
                    <li>
                      <span className="font-semibold">
                        Cognitive Agility Score:
                      </span>{" "}
                      {metrics.cognitiveAgilityScore}/100
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
                        placeholder="Movement quality, reaction patterns, fatigue observations, equipment notes..."
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
                : "Save Reactive Agility Test"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
