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

/**
 * Ballistic Push-Ups (minimal equipment)
 *
 * Key ideas:
 * - Athlete performs explosive push-ups (clap or chest-release).
 * - Measure jump/clearance height in cm (smartphone video or measuring tape).
 * - From height (h meters) we compute:
 *    - takeoffVelocity = sqrt(2 * g * h)
 *    - flightTime = sqrt(8 * h / g)
 *    - mechanicalWorkPerRep = bodyMassKg * g * h (J)
 *    - estimatedPowerPerRep = mechanicalWorkPerRep / takeoffDurationSec (W)
 * - If athlete doesn't supply takeoffDurationSec, we assume 0.15s (configurable).
 */

// ---------- Validation schema ----------
const g = 9.81; // gravity m/s^2

const ballisticSchema = z.object({
  reps: z
    .number({ error: "Reps are required" })
    .int()
    .min(1, "At least 1 rep")
    .max(100, "Too many reps"),

  bestJumpHeightCm: z
    .number({ error: "Best jump height is required" })
    .min(0.5, "Enter realistic height in cm")
    .max(300, "Unrealistic jump height")
    .transform((v) => Number(v)),

  avgJumpHeightCm: z.number().min(0).max(300).optional(),

  takeoffDurationSec: z.number().min(0.01).max(2).optional(),

  bodyWeightKg: z.number().min(20).max(300).optional(),

  rpe: z.number().min(1).max(10).optional(),
  techniqueScore: z.number().min(1).max(10).optional(),
  videoUrl: z.string().url().optional().or(z.literal("").optional()),
  notes: z.string().optional(),
});

type BallisticFormData = z.infer<typeof ballisticSchema>;

// ---------- helper calculations ----------
function cmToM(cm?: number | null) {
  if (cm == null) return null;
  return cm / 100;
}

function calcTakeoffVelocityMetersPerSec(heightMeters?: number | null) {
  if (!heightMeters || heightMeters <= 0) return null;
  return Math.sqrt(2 * g * heightMeters);
}

function calcFlightTimeSeconds(heightMeters?: number | null) {
  if (!heightMeters || heightMeters <= 0) return null;
  // flight time derived from h = (g * t^2) / 8  => t = sqrt(8h/g)
  return Math.sqrt((8 * heightMeters) / g);
}

function calcMechanicalWorkJ(
  bodyWeightKg?: number | null,
  heightMeters?: number | null
) {
  if (!bodyWeightKg || !heightMeters) return null;
  // gravitational potential energy gained ≈ m * g * h
  return bodyWeightKg * g * heightMeters;
}

function calcEstimatedPowerW(
  mechanicalWorkJ?: number | null,
  takeoffDurationSec?: number | null
) {
  if (!mechanicalWorkJ || !takeoffDurationSec || takeoffDurationSec <= 0)
    return null;
  return mechanicalWorkJ / takeoffDurationSec;
}

function round(val?: number | null, decimals = 2) {
  if (val == null || Number.isNaN(val)) return null;
  const p = Math.pow(10, decimals);
  return Math.round(val * p) / p;
}

// ---------- component ----------
type Props = {
  initialData?: Partial<BallisticFormData>;
  onSave: (payload: Record<string, any>) => void;
  defaultTakeoffDurationSec?: number; // fallback assumption, default 0.15s
};

export function BallisticPushUpsForm({
  initialData,
  onSave,
  defaultTakeoffDurationSec = 0.15,
}: Props) {
  const form = useForm<BallisticFormData>({
    resolver: zodResolver(ballisticSchema),
    defaultValues: {
      reps: undefined,
      bestJumpHeightCm: undefined,
      avgJumpHeightCm: undefined,
      takeoffDurationSec: undefined,
      bodyWeightKg: undefined,
      rpe: undefined,
      techniqueScore: undefined,
      videoUrl: "",
      notes: "",
      ...initialData,
    },
    mode: "onBlur",
  });

  const reps = form.watch("reps");
  const bestCm = form.watch("bestJumpHeightCm");
  const avgCm = form.watch("avgJumpHeightCm");
  const takeoffDur = form.watch("takeoffDurationSec");
  const bw = form.watch("bodyWeightKg");

  // computed metrics (live)
  const computed = useMemo(() => {
    const bestM = cmToM(typeof bestCm === "number" ? bestCm : null);
    const avgM = cmToM(typeof avgCm === "number" ? avgCm : null);
    const takeoffDurUsed =
      typeof takeoffDur === "number" && takeoffDur > 0
        ? takeoffDur
        : defaultTakeoffDurationSec;
    const bodyMass = typeof bw === "number" && bw > 0 ? bw : null;

    const takeoffVelocity = calcTakeoffVelocityMetersPerSec(bestM);
    const flightTime = calcFlightTimeSeconds(bestM);
    const mechWorkPerRep = calcMechanicalWorkJ(bodyMass, bestM); // J
    const estimatedPowerPerRep = calcEstimatedPowerW(
      mechWorkPerRep,
      takeoffDurUsed
    );
    const totalMechanicalWork =
      mechWorkPerRep != null && typeof reps === "number"
        ? mechWorkPerRep * reps
        : null;
    const averagePowerSet =
      totalMechanicalWork != null && reps && takeoffDurUsed
        ? totalMechanicalWork / (reps * takeoffDurUsed)
        : null;

    return {
      bestMeters: bestM,
      avgMeters: avgM,
      takeoffVelocity:
        takeoffVelocity != null ? round(takeoffVelocity, 3) : null, // m/s
      flightTime: flightTime != null ? round(flightTime, 3) : null,
      mechanicalWorkPerRep:
        mechWorkPerRep != null ? round(mechWorkPerRep, 2) : null, // J
      estimatedPowerPerRep:
        estimatedPowerPerRep != null ? round(estimatedPowerPerRep, 1) : null, // W
      totalMechanicalWork:
        totalMechanicalWork != null ? round(totalMechanicalWork, 1) : null,
      averagePowerSet:
        averagePowerSet != null ? round(averagePowerSet, 1) : null,
      takeoffDurationUsed: takeoffDurUsed,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reps, bestCm, avgCm, takeoffDur, bw, defaultTakeoffDurationSec]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BallisticFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        raw: data,
        calculated: {
          bestMeters: computed.bestMeters,
          avgMeters: computed.avgMeters,
          takeoffVelocity_m_s: computed.takeoffVelocity,
          flightTime_s: computed.flightTime,
          mechanicalWorkPerRep_J: computed.mechanicalWorkPerRep,
          estimatedPowerPerRep_W: computed.estimatedPowerPerRep,
          totalMechanicalWork_J: computed.totalMechanicalWork,
          averagePowerSet_W: computed.averagePowerSet,
          takeoffDurationUsed_s: computed.takeoffDurationUsed,
        },
        meta: {
          recordedAt: new Date().toISOString(),
        },
      };

      await onSave(payload);
    } catch (err) {
      console.error("BallisticPushUpsForm save error:", err);
      form.setError("reps", {
        type: "manual",
        message: "Failed to save ballistic push-ups data. Try again.",
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Inputs */}
      <div className="lg:col-span-7 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ballistic Push-Ups — Inputs</CardTitle>
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
                  name="reps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reps (explosive) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
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

                {/* Best jump height (cm) */}
                <FormField
                  control={form.control}
                  name="bestJumpHeightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Best Jump Height (cm) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
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

                {/* Average jump height */}
                <FormField
                  control={form.control}
                  name="avgJumpHeightCm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Jump Height (cm) — optional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
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

                {/* Takeoff duration */}
                <FormField
                  control={form.control}
                  name="takeoffDurationSec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Takeoff Duration (s) — optional (default{" "}
                        {defaultTakeoffDurationSec}s)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0.01}
                          max={2}
                          step={0.01}
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
                        Body Weight (kg) — optional (improves metrics)
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
                    </FormItem>
                  )}
                />

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

                {/* errors */}
                {form.formState.errors &&
                  Object.keys(form.formState.errors).length > 0 && (
                    <Alert>
                      <AlertDescription>
                        Please check the highlighted fields.
                      </AlertDescription>
                    </Alert>
                  )}

                {/* submit */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Ballistic Push-Ups"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Instructions & Live Metrics */}
      <div className="lg:col-span-5 space-y-4">
        {/* Instructions card */}
        <Card>
          <CardHeader>
            <CardTitle>
              Ballistic Push-Ups — Instructions (Minimal Equipment)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <strong>Purpose:</strong> Assess upper-body explosiveness (takeoff
              speed and mechanical work).
            </div>

            <div>
              <strong>Minimal equipment method:</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>
                  Use phone video (slow-motion) or a tape measure to estimate
                  jump/clearance height from push-up (cm).
                </li>
                <li>
                  Measure best jump height (peak of chest or hand clearance) in
                  cm; optionally measure average height across valid reps.
                </li>
                <li>
                  If available, measure takeoff (propulsion) phase duration in
                  seconds from video (otherwise we assume{" "}
                  {defaultTakeoffDurationSec}s).
                </li>
                <li>
                  Record body weight for better power/work estimates (optional
                  but recommended).
                </li>
                <li>Take 2–3 attempts and use best valid rep for metrics.</li>
              </ul>
            </div>

            <div>
              <strong>Formulas used (auto):</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>
                  <code>takeoffVelocity = sqrt(2 * g * height)</code> (m/s)
                </li>
                <li>
                  <code>flightTime = sqrt(8 * height / g)</code> (s)
                </li>
                <li>
                  <code>mechanicalWorkPerRep = bodyMassKg * g * height</code>{" "}
                  (J)
                </li>
                <li>
                  <code>
                    estimatedPowerPerRep = mechanicalWorkPerRep /
                    takeoffDurationSec
                  </code>{" "}
                  (W)
                </li>
              </ul>
            </div>

            <div className="text-xs text-muted-foreground">
              Tip: measuring height from a frame-by-frame video is the simplest
              accurate method using minimal tools.
            </div>
          </CardContent>
        </Card>

        {/* Live metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Live Calculated Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Best Jump Height</span>
              <Badge>
                {computed.bestMeters != null
                  ? `${round(computed.bestMeters, 3)} m (${bestCm} cm)`
                  : "—"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Takeoff Velocity</span>
              <Badge>
                {computed.takeoffVelocity != null
                  ? `${computed.takeoffVelocity} m/s`
                  : "—"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Flight Time</span>
              <Badge>
                {computed.flightTime != null ? `${computed.flightTime} s` : "—"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Mechanical Work / Rep</span>
              <Badge>
                {computed.mechanicalWorkPerRep != null
                  ? `${computed.mechanicalWorkPerRep} J`
                  : "—"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Estimated Power / Rep</span>
              <Badge>
                {computed.estimatedPowerPerRep != null
                  ? `${computed.estimatedPowerPerRep} W`
                  : "—"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Total Mechanical Work (set)</span>
              <Badge>
                {computed.totalMechanicalWork != null
                  ? `${computed.totalMechanicalWork} J`
                  : "—"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Average Power (set)</span>
              <Badge>
                {computed.averagePowerSet != null
                  ? `${computed.averagePowerSet} W`
                  : "—"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick tips */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Coaching Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Use phone slow-mo and a ruler/marker on wall or floor to
                estimate jump height reliably.
              </li>
              <li>
                Prefer the best valid rep for explosiveness metrics; average for
                consistency metrics.
              </li>
              <li>
                Note takeoff duration if you can — it improves power estimates
                significantly.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
