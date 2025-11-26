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
  Eye,
  Timer,
  Activity,
  Loader2,
  Plus,
  Trash2,
  Info,
  Brain,
  TrendingDown,
} from "lucide-react";

/* ============================
   ZOD SCHEMA
============================ */

const trialSchema = z.object({
  trialNumber: z.number().min(1).max(20),
  reactionTime: z.number().min(0.05).max(2.0), // seconds
  stimulus: z.enum(["left", "right", "up", "down", "center"]).optional(),
  correct: z.boolean().default(true),
  notes: z.string().optional(),
});

const visualReactionSpeedSchema = z.object({
  testType: z.enum(["simple", "choice"]).default("simple"),
  numberOfTrials: z.number().min(5).max(20).default(10),
  numberOfStimuli: z.number().min(1).max(5).default(1),
  stimulusType: z
    .enum(["light", "color", "direction", "shape"])
    .default("light"),
  preparationTime: z.number().min(1).max(10).default(3), // seconds
  randomDelay: z.boolean().default(true),
  athleteAge: z.number().min(5).max(100).optional(),
  athleteGender: z.enum(["male", "female"]).default("male"),
  dominantHand: z.enum(["right", "left", "ambidextrous"]).default("right"),
  trials: z.array(trialSchema).min(5),
  equipmentUsed: z.string().optional(),
  testingEnvironment: z.string().optional(),
  athleteCondition: z.enum(["fresh", "fatigued", "normal"]).default("normal"),
  notes: z.string().optional(),
});

type VisualReactionSpeedData = z.infer<typeof visualReactionSpeedSchema>;

type Props = {
  initialData?: Partial<VisualReactionSpeedData>;
  onSave: (data: any) => void;
};

/* ============================
   NORMATIVE DATA
============================ */

const REACTION_TIME_NORMS = {
  elite: { min: 0.15, max: 0.2, label: "Elite" },
  excellent: { min: 0.2, max: 0.25, label: "Excellent" },
  good: { min: 0.25, max: 0.3, label: "Good" },
  average: { min: 0.3, max: 0.35, label: "Average" },
  belowAverage: { min: 0.35, max: 0.45, label: "Below Average" },
  poor: { min: 0.45, max: 2.0, label: "Poor" },
};

/* ============================
   CALCULATED METRICS TYPE
============================ */

type CalculatedMetrics = {
  // Reaction time metrics
  bestTime: number | null;
  worstTime: number | null;
  averageTime: number | null;
  medianTime: number | null;

  // Statistical measures
  standardDeviation: number | null;
  coefficientOfVariation: number | null;

  // Consistency & reliability
  consistency: "Excellent" | "Good" | "Fair" | "Poor";
  reliabilityIndex: number | null;

  // Accuracy (for choice reaction tests)
  totalTrials: number;
  correctResponses: number;
  accuracyPercentage: number | null;

  // Performance trends
  fatigueIndex: number | null; // First 5 vs Last 5
  improvementIndex: number | null; // First trial vs Best trial

  // Quartile analysis
  q1Time: number | null; // 25th percentile
  q3Time: number | null; // 75th percentile
  interquartileRange: number | null;

  // Performance rating
  performanceRating: string;
  cognitiveSpeed:
    | "Elite"
    | "Excellent"
    | "Good"
    | "Average"
    | "Below Average"
    | "Poor";

  // Outlier detection
  outliers: number[];
  cleanedAverageTime: number | null; // Average without outliers
};

/* ============================
   HELPER FUNCTIONS
============================ */

function getPerformanceRating(avgTime: number): string {
  if (avgTime <= 0.2) return REACTION_TIME_NORMS.elite.label;
  if (avgTime <= 0.25) return REACTION_TIME_NORMS.excellent.label;
  if (avgTime <= 0.3) return REACTION_TIME_NORMS.good.label;
  if (avgTime <= 0.35) return REACTION_TIME_NORMS.average.label;
  if (avgTime <= 0.45) return REACTION_TIME_NORMS.belowAverage.label;
  return REACTION_TIME_NORMS.poor.label;
}

function getRatingColor(rating: string): string {
  if (rating === "Elite")
    return "bg-purple-100 text-purple-900 border-purple-300";
  if (rating === "Excellent")
    return "bg-emerald-100 text-emerald-900 border-emerald-300";
  if (rating === "Good") return "bg-green-100 text-green-900 border-green-300";
  if (rating === "Average") return "bg-blue-100 text-blue-900 border-blue-300";
  if (rating === "Below Average")
    return "bg-amber-100 text-amber-900 border-amber-300";
  return "bg-red-100 text-red-900 border-red-300";
}

function calculateMetrics(trials: any[]): CalculatedMetrics {
  if (trials.length === 0) {
    return {
      bestTime: null,
      worstTime: null,
      averageTime: null,
      medianTime: null,
      standardDeviation: null,
      coefficientOfVariation: null,
      consistency: "Poor",
      reliabilityIndex: null,
      totalTrials: 0,
      correctResponses: 0,
      accuracyPercentage: null,
      fatigueIndex: null,
      improvementIndex: null,
      q1Time: null,
      q3Time: null,
      interquartileRange: null,
      performanceRating: "No data",
      cognitiveSpeed: "Poor",
      outliers: [],
      cleanedAverageTime: null,
    };
  }

  const times = trials.map((t) => t.reactionTime).sort((a, b) => a - b);
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

  // Quartiles
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1Time = times[q1Index];
  const q3Time = times[q3Index];
  const interquartileRange = q3Time - q1Time;

  // Standard deviation
  const variance =
    times.reduce((sum, t) => sum + Math.pow(t - averageTime, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);

  // Coefficient of variation
  const coefficientOfVariation = (standardDeviation / averageTime) * 100;

  // Consistency rating
  let consistency: "Excellent" | "Good" | "Fair" | "Poor" = "Poor";
  if (coefficientOfVariation <= 5) consistency = "Excellent";
  else if (coefficientOfVariation <= 10) consistency = "Good";
  else if (coefficientOfVariation <= 15) consistency = "Fair";

  // Reliability index
  const reliabilityIndex = Math.max(0, 100 - coefficientOfVariation * 5);

  // Accuracy (for choice reaction tests)
  const correctResponses = trials.filter((t) => t.correct !== false).length;
  const accuracyPercentage = (correctResponses / trials.length) * 100;

  // Fatigue index (first 5 vs last 5)
  let fatigueIndex = null;
  if (n >= 10) {
    const first5Avg =
      trials.slice(0, 5).reduce((sum, t) => sum + t.reactionTime, 0) / 5;
    const last5Avg =
      trials.slice(-5).reduce((sum, t) => sum + t.reactionTime, 0) / 5;
    fatigueIndex = ((last5Avg - first5Avg) / first5Avg) * 100;
  }

  // Improvement index
  const firstTrial = trials[0]?.reactionTime;
  const improvementIndex = firstTrial
    ? ((firstTrial - bestTime) / firstTrial) * 100
    : null;

  // Outlier detection (using IQR method)
  const lowerBound = q1Time - 1.5 * interquartileRange;
  const upperBound = q3Time + 1.5 * interquartileRange;
  const outliers = trials
    .map((t, idx) =>
      t.reactionTime < lowerBound || t.reactionTime > upperBound ? idx : -1
    )
    .filter((idx) => idx !== -1);

  // Cleaned average (without outliers)
  const cleanedTimes = times.filter((t) => t >= lowerBound && t <= upperBound);
  const cleanedAverageTime =
    cleanedTimes.length > 0
      ? cleanedTimes.reduce((a, b) => a + b, 0) / cleanedTimes.length
      : averageTime;

  // Performance rating
  const performanceRating = getPerformanceRating(cleanedAverageTime);
  const cognitiveSpeed = performanceRating as any;

  return {
    bestTime: Math.round(bestTime * 1000) / 1000,
    worstTime: Math.round(worstTime * 1000) / 1000,
    averageTime: Math.round(averageTime * 1000) / 1000,
    medianTime: Math.round(medianTime * 1000) / 1000,
    standardDeviation: Math.round(standardDeviation * 1000) / 1000,
    coefficientOfVariation: Math.round(coefficientOfVariation * 10) / 10,
    consistency,
    reliabilityIndex: Math.round(reliabilityIndex),
    totalTrials: trials.length,
    correctResponses,
    accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
    fatigueIndex: fatigueIndex ? Math.round(fatigueIndex * 10) / 10 : null,
    improvementIndex: improvementIndex
      ? Math.round(improvementIndex * 10) / 10
      : null,
    q1Time: Math.round(q1Time * 1000) / 1000,
    q3Time: Math.round(q3Time * 1000) / 1000,
    interquartileRange: Math.round(interquartileRange * 1000) / 1000,
    performanceRating,
    cognitiveSpeed,
    outliers,
    cleanedAverageTime: Math.round(cleanedAverageTime * 1000) / 1000,
  };
}

/* ============================
   MAIN COMPONENT
============================ */

export function VisualReactionSpeedForm({ initialData, onSave }: Props) {
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(visualReactionSpeedSchema),
    defaultValues: {
      testType: initialData?.testType ?? "simple",
      numberOfTrials: initialData?.numberOfTrials ?? 10,
      numberOfStimuli: initialData?.numberOfStimuli ?? 1,
      stimulusType: initialData?.stimulusType ?? "light",
      preparationTime: initialData?.preparationTime ?? 3,
      randomDelay: initialData?.randomDelay ?? true,
      athleteAge: initialData?.athleteAge,
      athleteGender: initialData?.athleteGender ?? "male",
      dominantHand: initialData?.dominantHand ?? "right",
      athleteCondition: initialData?.athleteCondition ?? "normal",
      trials:
        initialData?.trials ??
        Array(10)
          .fill(null)
          .map((_, i) => ({
            trialNumber: i + 1,
            reactionTime: 0,
            correct: true,
          })),
      equipmentUsed: initialData?.equipmentUsed ?? "",
      testingEnvironment: initialData?.testingEnvironment ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "trials",
  });

  const trialsData = form.watch("trials");
  const testType = form.watch("testType");

  // Calculate metrics
  const metrics = useMemo(() => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 300);
    return calculateMetrics(trialsData);
  }, [trialsData]);

  const onSubmit = (data: VisualReactionSpeedData) => {
    try {
      const payload = {
        ...data,
        calculated: metrics,
        recordedAt: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.debug("[VisualReactionSpeedForm] Submitting:", payload);
      }

      onSave(payload);
    } catch (err) {
      console.error("[VisualReactionSpeedForm] Error:", err);
      form.setError("root", {
        type: "manual",
        message: "Failed to save visual reaction speed test",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Visual Reaction Speed Drill
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Comprehensive assessment of visual processing speed and reaction time.
          Measures the athlete's ability to recognize visual stimuli and respond
          rapidly with precise movements.
        </p>
      </div>

      {/* Test Overview */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-purple-600" /> Test Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-purple-900">Simple Reaction</p>
              <p className="text-purple-800 text-xs">
                Single stimulus → One response (fastest pure reaction time)
              </p>
            </div>
            <div>
              <p className="font-semibold text-purple-900">Choice Reaction</p>
              <p className="text-purple-800 text-xs">
                Multiple stimuli → Decision required (tests cognitive
                processing)
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="testType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Type</FormLabel>
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
                          <SelectItem value="simple">
                            Simple Reaction
                          </SelectItem>
                          <SelectItem value="choice">
                            Choice Reaction
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Simple = 1 stimulus, Choice = Multiple stimuli
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stimulusType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stimulus Type</FormLabel>
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
                          <SelectItem value="light">Light Flash</SelectItem>
                          <SelectItem value="color">Color Change</SelectItem>
                          <SelectItem value="direction">
                            Directional Arrow
                          </SelectItem>
                          <SelectItem value="shape">
                            Shape Recognition
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
                  name="numberOfTrials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Trials</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          max="20"
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
                      <FormDescription>5-20 recommended</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {testType === "choice" && (
                  <FormField
                    control={form.control}
                    name="numberOfStimuli"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Stimuli</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="2"
                            max="5"
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
                )}

                <FormField
                  control={form.control}
                  name="preparationTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep Time (s)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
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
                      <FormDescription>Before each stimulus</FormDescription>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dominantHand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dominant Hand</FormLabel>
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
                          <SelectItem value="right">Right</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="ambidextrous">
                            Ambidextrous
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
                name="athleteCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Athlete Condition</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fresh">
                          Fresh (Well Rested)
                        </SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="fatigued">Fatigued</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Trial Recording */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Timer className="h-5 w-5" /> Trial Times
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-2">
                Record reaction time in seconds (e.g., 0.250 = 250ms)
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`flex items-end gap-3 p-3 rounded-lg border ${
                    metrics.outliers.includes(index)
                      ? "bg-red-50 border-red-300"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`trials.${index}.reactionTime`}
                      render={({ field: timeField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Trial {index + 1}
                            {metrics.outliers.includes(index) && (
                              <Badge
                                variant="destructive"
                                className="ml-2 text-xs"
                              >
                                Outlier
                              </Badge>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.001"
                              min="0.05"
                              max="2.0"
                              placeholder="0.000"
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

                  {testType === "choice" && (
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`trials.${index}.correct`}
                        render={({ field: correctField }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Correct</FormLabel>
                            <Select
                              value={correctField.value ? "yes" : "no"}
                              onValueChange={(val) =>
                                correctField.onChange(val === "yes")
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">✓ Yes</SelectItem>
                                <SelectItem value="no">✗ No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {fields.length > 5 && (
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

              {fields.length < 20 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      trialNumber: fields.length + 1,
                      reactionTime: 0,
                      correct: true,
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

          {/* Performance Metrics */}
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
                    Cognitive Speed Rating
                  </p>
                  <Badge className={getRatingColor(metrics.cognitiveSpeed)}>
                    {metrics.cognitiveSpeed}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {metrics.cleanedAverageTime
                    ? (metrics.cleanedAverageTime * 1000).toFixed(0)
                    : "—"}
                  ms
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Average reaction time (outliers removed)
                </p>
              </div>

              {/* Time Statistics */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Reaction Times</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Best Time</p>
                    <p className="text-lg font-bold">
                      {metrics.bestTime
                        ? (metrics.bestTime * 1000).toFixed(0)
                        : "—"}
                      ms
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Worst Time</p>
                    <p className="text-lg font-bold">
                      {metrics.worstTime
                        ? (metrics.worstTime * 1000).toFixed(0)
                        : "—"}
                      ms
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Median Time</p>
                    <p className="text-lg font-bold">
                      {metrics.medianTime
                        ? (metrics.medianTime * 1000).toFixed(0)
                        : "—"}
                      ms
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Std Dev</p>
                    <p className="text-lg font-bold">
                      {metrics.standardDeviation
                        ? (metrics.standardDeviation * 1000).toFixed(0)
                        : "—"}
                      ms
                    </p>
                  </div>
                </div>
              </div>

              {/* Consistency */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Consistency & Reliability
                </h4>
                <div className="grid grid-cols-2 gap-3">
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
                      {metrics.reliabilityIndex}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Improvement</p>
                    <p className="text-lg font-bold">
                      {metrics.improvementIndex?.toFixed(1) ?? "—"}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      First to best
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground">Fatigue</p>
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

              {/* Accuracy (Choice only) */}
              {testType === "choice" && (
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Accuracy & Decision Making
                  </h4>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        Correct Responses
                      </p>
                      <Badge
                        variant={
                          metrics.accuracyPercentage! >= 90
                            ? "default"
                            : "secondary"
                        }
                      >
                        {metrics.accuracyPercentage?.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {metrics.correctResponses} / {metrics.totalTrials}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Insights */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold mb-2">Performance Summary:</p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>
                      <span className="font-semibold">Speed Rating:</span>{" "}
                      {metrics.cognitiveSpeed} (
                      {metrics.cleanedAverageTime
                        ? (metrics.cleanedAverageTime * 1000).toFixed(0)
                        : "—"}
                      ms average)
                    </li>
                    <li>
                      <span className="font-semibold">Consistency:</span>{" "}
                      {metrics.consistency} (CV{" "}
                      {metrics.coefficientOfVariation?.toFixed(1)}%)
                    </li>
                    {testType === "choice" && (
                      <li>
                        <span className="font-semibold">Accuracy:</span>{" "}
                        {metrics.accuracyPercentage?.toFixed(1)}% correct
                        responses
                      </li>
                    )}
                    <li>
                      <span className="font-semibold">Outliers Detected:</span>{" "}
                      {metrics.outliers.length} trial(s) outside normal range
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Environment & Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="equipmentUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Used</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Reaction light board, timing software"
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
                name="testingEnvironment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testing Environment</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Indoor lab, controlled lighting, minimal distractions"
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes & Observations</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Athlete focus level, environmental factors, any irregularities..."
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
              {form.formState.isSubmitting ? "Saving..." : "Save Reaction Test"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
