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
const plankHoldSchema = z.object({
  // required primary measure
  bodyweightDurationSeconds: z
    .number({ error: "Bodyweight duration is required" })
    .int()
    .min(1, "Must be at least 1 second")
    .max(3600, "Cannot exceed 3600 seconds"),

  // optional weighted hold
  weightedLoadKg: z
    .number({ error: "Weighted load must be a number" })
    .min(0, "Cannot be negative")
    .max(200, "Unrealistic weighted load")
    .optional(),

  weightedDurationSeconds: z
    .number()
    .min(0, "Must be >= 0")
    .max(3600, "Cannot exceed 3600 seconds")
    .optional(),

  // additional inputs
  rpe: z.number().min(1).max(10).optional(),
  formQualityScore: z.number().min(1).max(5).optional(),
  hipDrop: z.enum(["none", "left", "right", "bilateral"]).optional(),
  painAreas: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("").optional()),

  notes: z.string().optional(),
});

type PlankHoldFormData = z.infer<typeof plankHoldSchema>;

/* ======================
   HELPER CALCULATIONS
   ====================== */

/**
 * Core Endurance Score (CES)
 * CES = duration_seconds * body_weight_kg
 * If bodyWeight not provided, CES will remain null (coach can choose to supply BW)
 */
function calcCES(durationSec: number, bodyWeightKg?: number | null) {
  if (!durationSec || !bodyWeightKg) return null;
  return Number((durationSec * bodyWeightKg).toFixed(1));
}

/**
 * Weighted Intensity Index (WII)
 * WII = weighted_load_kg * weighted_duration_seconds
 */
function calcWII(
  weightedLoadKg?: number | null,
  weightedDurationSec?: number | null
) {
  if (!weightedLoadKg || !weightedDurationSec) return null;
  return Number((weightedLoadKg * weightedDurationSec).toFixed(1));
}

/**
 * Endurance Ratio (ER)
 * ER = weighted_duration_seconds / bodyweight_duration_seconds
 */
function calcER(
  weightedDuration?: number | null,
  bodyweightDuration?: number | null
) {
  if (
    !bodyweightDuration ||
    bodyweightDuration <= 0 ||
    weightedDuration == null
  )
    return null;
  return Number((weightedDuration / bodyweightDuration).toFixed(3));
}

/**
 * Fatigue % = (1 - ER) * 100
 */
function calcFatiguePercent(er?: number | null) {
  if (er == null) return null;
  return Number(((1 - er) * 100).toFixed(1));
}

/**
 * Total Work (simple approximation)
 * workSeconds = bodyweightDurationSeconds + weightedDurationSeconds
 */
function calcTotalHoldTime(bodySec: number | null, weightedSec: number | null) {
  const a = bodySec ?? 0;
  const b = weightedSec ?? 0;
  return Math.round((a + b) * 10) / 10;
}

/* ======================
   COMPONENT
   ====================== */

type Props = {
  initialData?: Partial<PlankHoldFormData & { bodyWeightKg?: number }>;
  onSave: (payload: Record<string, any>) => void;
};

export function PlankHoldForm({ initialData, onSave }: Props) {
  const form = useForm<PlankHoldFormData>({
    resolver: zodResolver(plankHoldSchema),
    defaultValues: {
      bodyweightDurationSeconds: undefined,
      weightedLoadKg: undefined,
      weightedDurationSeconds: undefined,
      rpe: undefined,
      formQualityScore: undefined,
      hipDrop: "none",
      painAreas: "",
      videoUrl: "",
      notes: "",
      ...initialData,
    },
    mode: "onBlur",
  });

  // watch fields
  const bodySec = form.watch("bodyweightDurationSeconds");
  const weightedLoad = form.watch("weightedLoadKg");
  const weightedSec = form.watch("weightedDurationSeconds");

  // optional body weight provided via initialData or later by coach (not in form)
  const bodyWeightKg = (initialData as any)?.bodyWeightKg ?? undefined;

  // live computed values
  const computed = useMemo(() => {
    const ces = calcCES(bodySec ?? 0, bodyWeightKg ?? undefined);
    const wii = calcWII(weightedLoad ?? null, weightedSec ?? null);
    const er = calcER(weightedSec ?? null, bodySec ?? null);
    const fatigue = calcFatiguePercent(er);
    const totalHoldTime = calcTotalHoldTime(
      bodySec ?? null,
      weightedSec ?? null
    );
    return {
      ces,
      wii,
      er,
      fatigue,
      totalHoldTime,
    };
  }, [bodySec, weightedLoad, weightedSec, bodyWeightKg]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: PlankHoldFormData) => {
    try {
      setIsSubmitting(true);

      // Build payload with calculated outputs
      const payload = {
        ...data,
        calculated: {
          coreEnduranceScore: computed.ces, // may be null if bodyWeight not provided
          weightedIntensityIndex: computed.wii,
          enduranceRatio: computed.er,
          fatiguePercent: computed.fatigue,
          totalHoldTimeSeconds: computed.totalHoldTime,
        },
        meta: {
          recordedAt: new Date().toISOString(),
        },
      };

      // call parent save
      await onSave(payload);
    } catch (err) {
      console.error("PlankHoldForm save error:", err);
      form.setError("bodyweightDurationSeconds", {
        type: "manual",
        message: "Failed to save plank data. Try again.",
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Inputs (span 7 on large screens) */}
      <div className="lg:col-span-7 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Plank Hold — Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Bodyweight duration */}
                <FormField
                  control={form.control}
                  name="bodyweightDurationSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bodyweight Plank Duration (seconds) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          type="number"
                          min={1}
                          max={3600}
                          step={1}
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

                {/* Weighted duration */}
                <FormField
                  control={form.control}
                  name="weightedDurationSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Weighted Plank Duration (seconds) — optional
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={3600}
                          step={1}
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

                {/* RPE & Form Score */}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="formQualityScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Quality (1–5)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={5}
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
                </div>

                {/* Hip Drop */}
                <FormField
                  control={form.control}
                  name="hipDrop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hip Drop</FormLabel>
                      <FormControl>
                        <select
                          title="select"
                          className="w-full rounded-md border p-2"
                          value={field.value ?? "none"}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="none">None</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="bilateral">Bilateral</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pain areas */}
                <FormField
                  control={form.control}
                  name="painAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain / Tension Areas (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., low back, left hip"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                        <Input
                          type="url"
                          placeholder="https:// (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form-level errors */}
                {form.formState.errors && (
                  <div>
                    {Object.keys(form.formState.errors).length > 0 && (
                      <Alert>
                        <AlertDescription className="text-sm">
                          Please check the highlighted fields.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Submit button (placed in left column) */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Plank Hold"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Instructions & Live Calculations (span 5) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Instruction Card */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions & Formulas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Purpose:</strong> The plank hold tests core endurance and
              ability to maintain neutral pelvis/spine under load.
            </div>

            <div>
              <strong>How to perform (brief):</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Assume forearm plank position, elbows under shoulders.</li>
                <li>
                  Keep hips level, body in straight line from head to heels.
                </li>
                <li>
                  Hold for maximum time (bodyweight). Optionally add weight on
                  the back and hold.
                </li>
                <li>Record durations in seconds using stopwatch.</li>
              </ul>
            </div>

            <div>
              <strong>Formulas used (auto):</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>
                  <code>
                    Core Endurance Score (CES) = duration_sec × body_weight_kg
                  </code>
                </li>
                <li>
                  <code>
                    Weighted Intensity Index (WII) = weighted_load_kg ×
                    weighted_duration_sec
                  </code>
                </li>
                <li>
                  <code>
                    Endurance Ratio (ER) = weighted_duration_sec ÷
                    bodyweight_duration_sec
                  </code>
                </li>
                <li>
                  <code>Fatigue % = (1 − ER) × 100</code>
                </li>
              </ul>
            </div>

            <div className="text-xs text-muted-foreground">
              Tip: Take 2–3 trials and record the best valid attempt. For
              weighted holds, use a plate/pad and place evenly on the upper
              back.
            </div>
          </CardContent>
        </Card>

        {/* Live Calculations Card */}
        <Card>
          <CardHeader>
            <CardTitle>Live Calculated Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Core Endurance Score (CES)</span>
              <Badge>{computed.ces != null ? `${computed.ces}` : "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Weighted Intensity Index (WII)</span>
              <Badge>{computed.wii != null ? `${computed.wii}` : "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Endurance Ratio (ER)</span>
              <Badge>{computed.er != null ? `${computed.er}` : "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Fatigue (%)</span>
              <Badge>
                {computed.fatigue != null ? `${computed.fatigue}%` : "—"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Total Hold Time (s)</span>
              <Badge>
                {computed.totalHoldTime != null
                  ? `${computed.totalHoldTime}s`
                  : "—"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick guidelines card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Coaching Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="list-disc ml-5">
              <li>Keep feet hip-width and elbows under shoulders.</li>
              <li>Use a pad for weighted holds to avoid pain.</li>
              <li>Stop the test if pain or compensatory movement occurs.</li>
              <li>Record video for technique feedback (optional).</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
