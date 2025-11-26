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
const pushUpsSchema = z.object({
  repsBodyweight: z
    .number({ error: "Bodyweight reps required" })
    .int()
    .min(0, "Min 0 reps")
    .max(200, "Max 200 reps"),

  repsWeighted: z.number().int().min(0).max(200).optional(),

  weightedLoadKg: z
    .number()
    .min(0, "Weighted load cannot be negative")
    .max(200, "Unrealistic weighted load")
    .optional(),

  bodyWeightKg: z
    .number()
    .min(20, "Unrealistic bodyweight")
    .max(300, "Unrealistic bodyweight")
    .optional(),

  setDurationSeconds: z
    .number()
    .min(1, "Duration must be >= 1s")
    .max(3600, "Duration too large")
    .optional(),

  tempo: z.string().optional(),
  rpe: z.number().min(1).max(10).optional(),
  techniqueScore: z.number().min(1).max(10).optional(),
  handPosition: z
    .enum(["standard", "wide", "narrow", "incline", "decline", "neutral"])
    .optional(),
  videoUrl: z.string().url().optional().or(z.literal("").optional()),
  notes: z.string().optional(),
});

type PushUpsFormData = z.infer<typeof pushUpsSchema>;

/* ======================
   HELPER CALCULATIONS
   ====================== */

/**
 * strengthIndex:
 * base: total reps (bodyweight + weighted)
 */
function calcStrengthIndex(repsBodyweight: number, repsWeighted?: number) {
  return repsBodyweight + (repsWeighted ?? 0);
}

/**
 * bodyweightAdjustedScore:
 * reps × (baseline / bodyWeightKg), baseline = 70kg
 */
function calcBodyweightAdjustedScore(totalReps: number, bodyWeightKg?: number) {
  if (!bodyWeightKg) return null;
  const baseline = 70;
  return Number((totalReps * (baseline / bodyWeightKg)).toFixed(2));
}

/**
 * volumeLoad:
 * weightedLoadKg × repsWeighted
 */
function calcVolumeLoad(weightedLoadKg?: number, repsWeighted?: number) {
  if (!weightedLoadKg || !repsWeighted) return null;
  return Number((weightedLoadKg * repsWeighted).toFixed(1));
}

/**
 * density:
 * totalReps / setDurationSeconds (reps per second)
 */
function calcDensity(totalReps: number, setDurationSeconds?: number) {
  if (!setDurationSeconds || setDurationSeconds <= 0) return null;
  return Number((totalReps / setDurationSeconds).toFixed(3));
}

/**
 * powerProxy:
 * simple proxy: (bodyWeightKg + weightedLoadKg) * totalReps
 */
function calcPowerProxy(
  totalReps: number,
  bodyWeightKg?: number,
  weightedLoadKg?: number
) {
  const bw = bodyWeightKg ?? 0;
  const wl = weightedLoadKg ?? 0;
  if (totalReps <= 0) return null;
  return Number(((bw + wl) * totalReps).toFixed(1));
}

/**
 * performanceLevel by total reps (simple thresholds)
 */
function calcPerformanceLevel(totalReps: number) {
  if (totalReps >= 100) return "Superhuman";
  if (totalReps >= 60) return "Elite";
  if (totalReps >= 40) return "Advanced";
  if (totalReps >= 20) return "Intermediate";
  if (totalReps >= 1) return "Beginner";
  return "None";
}

/* ======================
   COMPONENT
   ====================== */

type Props = {
  initialData?: Partial<PushUpsFormData>;
  onSave: (payload: Record<string, any>) => void; // includes calculated
};

export function PushUpsTestForm({ initialData, onSave }: Props) {
  const form = useForm<PushUpsFormData>({
    resolver: zodResolver(pushUpsSchema),
    defaultValues: {
      repsBodyweight: undefined,
      repsWeighted: undefined,
      weightedLoadKg: undefined,
      bodyWeightKg: undefined,
      setDurationSeconds: undefined,
      tempo: "",
      rpe: undefined,
      techniqueScore: undefined,
      handPosition: "standard",
      videoUrl: "",
      notes: "",
      ...initialData,
    },
    mode: "onBlur",
  });

  // watch values
  const repsBodyweight = form.watch("repsBodyweight");
  const repsWeighted = form.watch("repsWeighted");
  const weightedLoadKg = form.watch("weightedLoadKg");
  const bodyWeightKg = form.watch("bodyWeightKg");
  const setDurationSeconds = form.watch("setDurationSeconds");

  const computed = useMemo(() => {
    const rb = typeof repsBodyweight === "number" ? repsBodyweight : 0;
    const rw = typeof repsWeighted === "number" ? repsWeighted : 0;
    const totalReps = rb + rw;

    const strengthIndex = calcStrengthIndex(rb, rw);
    const bodyweightAdjustedScore = bodyWeightKg
      ? calcBodyweightAdjustedScore(totalReps, bodyWeightKg)
      : null;
    const volumeLoad = calcVolumeLoad(weightedLoadKg, repsWeighted);
    const density = setDurationSeconds
      ? calcDensity(totalReps, setDurationSeconds)
      : null;
    const powerProxy = calcPowerProxy(totalReps, bodyWeightKg, weightedLoadKg);
    const performanceLevel = calcPerformanceLevel(totalReps);

    return {
      totalReps,
      strengthIndex,
      bodyweightAdjustedScore,
      volumeLoad,
      density,
      powerProxy,
      performanceLevel,
    };
  }, [
    repsBodyweight,
    repsWeighted,
    weightedLoadKg,
    bodyWeightKg,
    setDurationSeconds,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PushUpsFormData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        raw: data,
        calculated: {
          totalReps: computed.totalReps,
          strengthIndex: computed.strengthIndex,
          bodyweightAdjustedScore: computed.bodyweightAdjustedScore,
          volumeLoad: computed.volumeLoad,
          density: computed.density,
          powerProxy: computed.powerProxy,
          performanceLevel: computed.performanceLevel,
        },
        meta: {
          recordedAt: new Date().toISOString(),
        },
      };

      await onSave(payload);
    } catch (err) {
      console.error("PushUpsTestForm save error:", err);
      form.setError("repsBodyweight", {
        type: "manual",
        message: "Failed to save push-ups data. Try again.",
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Inputs (span 7) */}
      <div className="lg:col-span-7 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Push-Ups Test — Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {/* Bodyweight reps */}
                <FormField
                  control={form.control}
                  name="repsBodyweight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bodyweight Push-Ups Reps *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={200}
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

                {/* Weighted reps */}
                <FormField
                  control={form.control}
                  name="repsWeighted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weighted Push-Ups Reps (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
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

                {/* Weighted load */}
                <FormField
                  control={form.control}
                  name="weightedLoadKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weighted Load (kg) — optional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
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

                {/* Body weight */}
                <FormField
                  control={form.control}
                  name="bodyWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Body Weight (kg) — optional (used for relative scores)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={20}
                          max={300}
                          step={0.1}
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

                {/* set duration & tempo */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="setDurationSeconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Set Duration (seconds) — optional</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={3600}
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

                  <FormField
                    control={form.control}
                    name="tempo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo (e.g., 2/0/1) — optional</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="eccentric/iso/concentric"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* rpe & technique */}
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

                {/* hand position */}
                <FormField
                  control={form.control}
                  name="handPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hand Position</FormLabel>
                      <FormControl>
                        <select
                          title="select"
                          className="w-full rounded-md border p-2"
                          value={field.value ?? "standard"}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="standard">Standard</option>
                          <option value="wide">Wide</option>
                          <option value="narrow">Narrow</option>
                          <option value="incline">Incline</option>
                          <option value="decline">Decline</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* video url */}
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

                {/* notes */}
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

                {/* form errors */}
                {form.formState.errors &&
                  Object.keys(form.formState.errors).length > 0 && (
                    <Alert>
                      <AlertDescription>
                        Please review highlighted fields.
                      </AlertDescription>
                    </Alert>
                  )}

                {/* submit */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Push-Ups"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Right: Instructions & Live Metrics (span 5) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Instructions card */}
        <Card>
          <CardHeader>
            <CardTitle>Push-Ups — Instructions & Formulas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <strong>Purpose:</strong> Assess upper-body pressing endurance,
              muscular endurance and relative strength.
            </div>

            <div>
              <strong>How to perform:</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>
                  Use a standardized push-up (chest to ~fist height or
                  designated mark).
                </li>
                <li>Maintain straight body line; no sagging hips.</li>
                <li>
                  Complete max reps with quality technique; record reps and
                  optional weighted set.
                </li>
                <li>Record set duration if you want density metric.</li>
              </ul>
            </div>

            <div>
              <strong>Formulas (auto):</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>
                  <code>totalReps = repsBodyweight + repsWeighted</code>
                </li>
                <li>
                  <code>strengthIndex = totalReps</code>
                </li>
                <li>
                  <code>
                    bodyweightAdjustedScore = totalReps × (70 / bodyWeightKg)
                  </code>
                </li>
                <li>
                  <code>volumeLoad = weightedLoadKg × repsWeighted</code>
                </li>
                <li>
                  <code>density = totalReps ÷ setDurationSeconds</code>
                </li>
                <li>
                  <code>
                    powerProxy = (bodyWeightKg + weightedLoadKg) × totalReps
                  </code>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Live metrics card */}
        <Card>
          <CardHeader>
            <CardTitle>Live Calculated Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Total Reps</span>
              <Badge>{computed.totalReps ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Strength Index</span>
              <Badge>{computed.strengthIndex ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Bodyweight-Adjusted Score</span>
              <Badge>{computed.bodyweightAdjustedScore ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Volume Load (kg)</span>
              <Badge>{computed.volumeLoad ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Density (reps/sec)</span>
              <Badge>{computed.density ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Power Proxy</span>
              <Badge>{computed.powerProxy ?? "—"}</Badge>
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
              <li>
                Keep testing conditions consistent (surface, hand placement,
                warm-up).
              </li>
              <li>
                Use same tempo and standard across sessions for reliable
                comparisons.
              </li>
              <li>Record video if possible for technique verification.</li>
              <li>
                Store both raw and calculated values for historical analytics.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
