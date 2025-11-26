"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

/* ======================
   ZOD SCHEMA
   ====================== */
const pullUpsSchema = z.object({
  repsCompleted: z
    .number({ error: "Reps completed is required" })
    .int()
    .min(0, "Minimum 0 reps")
    .max(100, "Maximum 100 reps"), // large cap for safety

  bodyWeightKg: z
    .number({ error: "Body weight is required for relative metrics" })
    .min(20, "Unrealistic bodyweight")
    .max(300, "Unrealistic bodyweight"),

  // Optional coach/athlete inputs
  rpe: z.number().min(1).max(10).optional(),
  techniqueScore: z.number().min(1).max(10).optional(),
  grip: z.enum(["narrow", "shoulder", "wide", "neutral"]).optional(),
  videoUrl: z.string().url().optional().or(z.literal("").optional()),
  notes: z.string().optional(),
});

type PullUpsFormData = z.infer<typeof pullUpsSchema>;

/* ======================
   HELPER CALCULATIONS
   ====================== */

/**
 * strengthIndex:
 * - base metric: repsCompleted
 */
function calcStrengthIndex(reps: number) {
  return reps;
}

/**
 * bodyweightAdjustedScore:
 * - scales reps by an "expected bodyweight" baseline (70 kg).
 * - score = reps * (70 / bodyWeightKg)
 * - this rewards more reps at lower bodyweight (relative strength).
 */
function calcBodyweightAdjustedScore(reps: number, bodyWeightKg: number) {
  if (!bodyWeightKg || bodyWeightKg <= 0) return null;
  const baseline = 70;
  return Number((reps * (baseline / bodyWeightKg)).toFixed(2));
}

/**
 * enduranceRatio:
 * - reps / cap (cap chosen as 50 typical max); returns 0..1
 */
function calcEnduranceRatio(reps: number, cap = 50) {
  if (!reps) return 0;
  return Number(Math.min(reps / cap, 1).toFixed(3));
}

/**
 * powerScore:
 * - simple proxy: reps * bodyWeightKg * factor
 * - factor set to 1 for simplicity, can be tuned later
 */
function calcPowerScore(reps: number, bodyWeightKg: number, factor = 1) {
  if (!reps || !bodyWeightKg) return null;
  return Number((reps * bodyWeightKg * factor).toFixed(1));
}

/**
 * performanceLevel:
 * - uses reps thresholds for simplicity (coaches often use reps)
 * - returns string label
 */
function calcPerformanceLevel(reps: number) {
  if (reps >= 20) return "Elite";
  if (reps >= 15) return "Advanced";
  if (reps >= 8) return "Intermediate";
  if (reps >= 1) return "Beginner";
  return "None";
}

/* ======================
   COMPONENT
   ====================== */

type Props = {
  initialData?: Partial<PullUpsFormData>;
  onSave: (payload: Record<string, any>) => void; // includes calculated metrics
};

export function PullUpsTestForm({ initialData, onSave }: Props) {
  const form = useForm<PullUpsFormData>({
    resolver: zodResolver(pullUpsSchema),
    defaultValues: {
      repsCompleted: undefined,
      bodyWeightKg: undefined,
      rpe: undefined,
      techniqueScore: undefined,
      grip: "shoulder",
      videoUrl: "",
      notes: "",
      ...initialData,
    },
    mode: "onBlur",
  });

  const reps = form.watch("repsCompleted");
  const bw = form.watch("bodyWeightKg");

  const computed = useMemo(() => {
    const repsVal = typeof reps === "number" ? reps : 0;
    const bwVal = typeof bw === "number" ? bw : undefined;

    const strengthIndex = calcStrengthIndex(repsVal);
    const bodyweightAdjustedScore =
      bwVal != null ? calcBodyweightAdjustedScore(repsVal, bwVal) : null;
    const enduranceRatio = calcEnduranceRatio(repsVal);
    const powerScore = bwVal != null ? calcPowerScore(repsVal, bwVal) : null;
    const performanceLevel = calcPerformanceLevel(repsVal);

    return {
      strengthIndex,
      bodyweightAdjustedScore,
      enduranceRatio,
      powerScore,
      performanceLevel,
    };
  }, [reps, bw]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PullUpsFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        raw: data,
        calculated: {
          strengthIndex: computed.strengthIndex,
          bodyweightAdjustedScore: computed.bodyweightAdjustedScore,
          enduranceRatio: computed.enduranceRatio,
          powerScore: computed.powerScore,
          performanceLevel: computed.performanceLevel,
        },
        meta: {
          recordedAt: new Date().toISOString(),
        },
      };

      await onSave(payload);
    } catch (err) {
      console.error("PullUpsTestForm save error:", err);
      form.setError("repsCompleted", {
        type: "manual",
        message: "Failed to save pull-ups data. Try again.",
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Inputs */}
      <div className="lg:col-span-7 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pull-Ups Test — Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {/* Reps */}
                <FormField
                  control={form.control}
                  name="repsCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reps Completed *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value !== ""
                                ? parseInt(e.target.value, 10)
                                : undefined
                            )
                          }
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bodyweight */}
                <FormField
                  control={form.control}
                  name="bodyWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Weight (kg) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.1}
                          min={20}
                          max={300}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value !== ""
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* RPE & Technique */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rpe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RPE (1–10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value !== ""
                                  ? parseInt(e.target.value, 10)
                                  : undefined
                              )
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="techniqueScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technique Score (1–10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value !== ""
                                  ? parseInt(e.target.value, 10)
                                  : undefined
                              )
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Grip */}
                <FormField
                  control={form.control}
                  name="grip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grip</FormLabel>
                      <FormControl>
                        <select
                          title="select"
                          className="w-full rounded-md border p-2"
                          value={field.value ?? "shoulder"}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="narrow">Narrow</option>
                          <option value="shoulder">Shoulder-width</option>
                          <option value="wide">Wide</option>
                          <option value="neutral">Neutral (hammer)</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Video URL */}
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL (optional)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* errors */}
                {form.formState.errors &&
                  Object.keys(form.formState.errors).length > 0 && (
                    <Alert>
                      <AlertDescription>
                        Please check highlighted fields.
                      </AlertDescription>
                    </Alert>
                  )}

                {/* submit */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Pull-Ups"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Right: Instructions & Live Metrics */}
      <div className="lg:col-span-5 space-y-4">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Pull-Ups — Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <strong>Purpose:</strong> Assess upper-body pulling strength &
              endurance.
            </div>
            <div>
              <strong>How to perform:</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Grip bar shoulder-width (unless testing other grips).</li>
                <li>
                  Start from a full dead hang, chin must clear bar each rep.
                </li>
                <li>No kipping unless test specifically allows it.</li>
                <li>Stop if form breaks or athlete cannot clear chin.</li>
              </ul>
            </div>
            <div>
              <strong>What we store:</strong> raw inputs + all computed metrics
              (strengthIndex, bodyweightAdjustedScore, enduranceRatio,
              powerScore, performanceLevel).
            </div>
          </CardContent>
        </Card>

        {/* Live Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Live Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Strength Index</span>
              <Badge>{computed.strengthIndex ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Bodyweight-Adjusted Score</span>
              <Badge>{computed.bodyweightAdjustedScore ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Endurance Ratio</span>
              <Badge>{computed.enduranceRatio ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Power Score</span>
              <Badge>{computed.powerScore ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Performance Level</span>
              <Badge>{computed.performanceLevel ?? "—"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick coaching tips */}
        <Card>
          <CardHeader>
            <CardTitle>Coaching Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="list-disc ml-5 space-y-1">
              <li>Use same grip and standards every test for consistency.</li>
              <li>Prefer fresh tests (no heavy lifting before test).</li>
              <li>Record video where possible for technique review.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
