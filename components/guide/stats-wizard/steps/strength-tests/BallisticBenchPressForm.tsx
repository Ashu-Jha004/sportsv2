"use client";

import React, { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select"; // if you have a Select component
import { Alert, AlertDescription } from "@/components/ui/alert";

/* ============================
   ZOD SCHEMA & TYPES
   ============================ */

const equipmentModes = ["transducer", "camera", "manual"] as const;
type EquipmentMode = (typeof equipmentModes)[number];

const setSchema = z.object({
  id: z.string().optional(),
  load: z
    .number({ error: "Load (kg) required" })
    .min(0.5, "Load must be > 0")
    .max(1000, "Unrealistic load"),
  reps: z.number({ error: "Reps required" }).int().min(1).max(50),
  // Manual / camera fields
  distance: z.number().min(0).max(2).optional(), // meters
  time: z.number().min(0.001).max(60).optional(), // seconds (concentric)
  // Optional transducer-provided fields (preferred if you have a device)
  peakVelocity: z.number().min(0).optional(),
  peakForce: z.number().min(0).optional(),
  bodyWeight: z.number().min(20).max(300), // required for force calcs
  restAfter: z.number().min(0).max(600).optional(),
});

const ballisticBenchPressSchema = z.object({
  equipmentMode: z.enum(equipmentModes),
  sets: z.array(setSchema).min(1, "At least 1 set required"),
  notes: z.string().optional(),
});

type BallisticBenchPressFormValues = z.infer<typeof ballisticBenchPressSchema>;

/* ============================
   PHYSICS HELPERS
   ============================ */

const g = 9.81;

function safeNumber(v: any): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function calcVelocityFromDistanceTime(
  distanceMeters?: number | null,
  timeSec?: number | null
) {
  const d = safeNumber(distanceMeters);
  const t = safeNumber(timeSec);
  if (d == null || t == null || t <= 0) return null;
  return d / t;
}

function calcForce(loadKg?: number | null, bodyWeightKg?: number | null) {
  // movingMass = load + 0.2 * bodyWeight (approximation)
  const load = safeNumber(loadKg);
  const bw = safeNumber(bodyWeightKg);
  if (load == null) return null;
  const movingMass = load + (bw != null ? 0.2 * bw : 0);
  return movingMass * g; // Newtons
}

function calcPower(forceN?: number | null, velocityMs?: number | null) {
  if (forceN == null || velocityMs == null) return null;
  return forceN * velocityMs;
}

function calcWork(forceN?: number | null, distanceM?: number | null) {
  if (forceN == null || distanceM == null) return null;
  return forceN * distanceM;
}

function calcImpulse(forceN?: number | null, timeSec?: number | null) {
  if (forceN == null || timeSec == null) return null;
  return forceN * timeSec;
}

function round(val: number | null | undefined, d = 2) {
  if (val == null || Number.isNaN(val)) return null;
  const p = Math.pow(10, d);
  return Math.round(val * p) / p;
}

/* ============================
   COMPONENT
   ============================ */

type Props = {
  initialData?: Partial<BallisticBenchPressFormValues>;
  onSave: (payload: Record<string, any>) => void | Promise<void>;
};

export function BallisticBenchPressForm({ initialData, onSave }: Props) {
  const form = useForm<BallisticBenchPressFormValues>({
    resolver: zodResolver(ballisticBenchPressSchema),
    defaultValues: {
      equipmentMode: "manual",
      sets: [
        {
          load: 20,
          reps: 3,
          distance: 0.45,
          time: 0.8,
          peakVelocity: undefined,
          peakForce: undefined,
          bodyWeight: initialData?.sets?.[0]?.bodyWeight ?? 75,
          restAfter: 90,
        },
      ],
      notes: "",
      ...initialData,
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sets",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live computed metrics aggregated across sets
  const computed = useMemo(() => {
    const values = form.getValues();
    const mode = values.equipmentMode as EquipmentMode;
    const sets = values.sets || [];

    let peakPower = 0;
    let meanPowerSum = 0;
    let meanVelocitySum = 0;
    let totalWork = 0;
    let totalImpulse = 0;
    let sampleCount = 0;
    let bestSetIndex: number | null = null;

    const velocityLoadPoints: Array<{ load: number; peakVelocity: number }> =
      [];

    sets.forEach((s, i) => {
      const load = safeNumber(s.load);
      const bw = safeNumber(s.bodyWeight);

      // Determine velocity: prefer sensor peakVelocity, else compute from distance/time
      const peakVel =
        safeNumber(s.peakVelocity) ??
        calcVelocityFromDistanceTime(s.distance, s.time);
      const avgVel = calcVelocityFromDistanceTime(s.distance, s.time);

      // Determine force: prefer sensor peakForce else compute approximation
      const peakForce = safeNumber(s.peakForce) ?? calcForce(load, bw);

      const powerPeak = calcPower(peakForce, peakVel);
      const work = calcWork(peakForce, safeNumber(s.distance));
      const impulse = calcImpulse(peakForce, safeNumber(s.time));

      if (powerPeak != null && powerPeak > peakPower) {
        peakPower = powerPeak;
        bestSetIndex = i;
      }
      if (powerPeak != null) meanPowerSum += powerPeak;
      if (avgVel != null) meanVelocitySum += avgVel;
      if (work != null) totalWork += work;
      if (impulse != null) totalImpulse += impulse;
      if (powerPeak != null || avgVel != null) sampleCount += 1;

      if (load != null && peakVel != null) {
        velocityLoadPoints.push({ load, peakVelocity: peakVel });
      }
    });

    const meanPower = sampleCount > 0 ? meanPowerSum / sampleCount : null;
    const avgVelocity = sampleCount > 0 ? meanVelocitySum / sampleCount : null;

    return {
      equipmentMode: values.equipmentMode as EquipmentMode,
      setsCount: sets.length,
      peakPower: round(peakPower, 1),
      meanPower: meanPower != null ? round(meanPower, 1) : null,
      peakVelocity:
        velocityLoadPoints.length > 0
          ? round(Math.max(...velocityLoadPoints.map((p) => p.peakVelocity)), 3)
          : null,
      avgVelocity: avgVelocity != null ? round(avgVelocity, 3) : null,
      totalWork: round(totalWork, 1),
      totalImpulse: round(totalImpulse, 1),
      velocityLoadPoints,
      bestSetIndex,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("sets"), form.watch("equipmentMode")]);

  const handleSubmit = async (values: BallisticBenchPressFormValues) => {
    setIsSubmitting(true);
    try {
      // recompute snapshot (same logic as computed)
      const mode = values.equipmentMode as EquipmentMode;
      let peakPower = 0;
      let meanPowerSum = 0;
      let meanVelocitySum = 0;
      let totalWork = 0;
      let totalImpulse = 0;
      let sampleCount = 0;
      let bestSetIndex: number | null = null;
      const vlPoints: Array<{ load: number; peakVelocity: number }> = [];

      for (let i = 0; i < values.sets.length; i++) {
        const s = values.sets[i];
        const load = safeNumber(s.load);
        const bw = safeNumber(s.bodyWeight);
        const peakVel =
          safeNumber(s.peakVelocity) ??
          calcVelocityFromDistanceTime(s.distance, s.time);
        const avgVel = calcVelocityFromDistanceTime(s.distance, s.time);
        const peakForce = safeNumber(s.peakForce) ?? calcForce(load, bw);

        const powerPeak = calcPower(peakForce, peakVel);
        const work = calcWork(peakForce, safeNumber(s.distance));
        const impulse = calcImpulse(peakForce, safeNumber(s.time));

        if (powerPeak != null && powerPeak > peakPower) {
          peakPower = powerPeak;
          bestSetIndex = i;
        }
        if (powerPeak != null) meanPowerSum += powerPeak;
        if (avgVel != null) meanVelocitySum += avgVel;
        if (work != null) totalWork += work;
        if (impulse != null) totalImpulse += impulse;
        if (powerPeak != null || avgVel != null) sampleCount += 1;

        if (load != null && peakVel != null) {
          vlPoints.push({ load, peakVelocity: peakVel });
        }
      }

      const meanPower = sampleCount > 0 ? meanPowerSum / sampleCount : null;
      const avgVelocity =
        sampleCount > 0 ? meanVelocitySum / sampleCount : null;

      const calculated = {
        equipmentMode: mode,
        setsCount: values.sets.length,
        peakPower: round(peakPower, 1),
        meanPower: meanPower != null ? round(meanPower, 1) : null,
        peakVelocity:
          vlPoints.length > 0
            ? round(Math.max(...vlPoints.map((p) => p.peakVelocity)), 3)
            : null,
        avgVelocity: avgVelocity != null ? round(avgVelocity, 3) : null,
        totalWork: round(totalWork, 1),
        totalImpulse: round(totalImpulse, 1),
        velocityLoadPoints: vlPoints,
        bestSetIndex,
      };

      const payload = {
        raw: values,
        calculated,
        meta: {
          recordedAt: new Date().toISOString(),
        },
      };

      await onSave(payload);
    } catch (err) {
      console.error("BallisticBenchPressForm save error:", err);
      // set a visible field error to notify user
      form.setError(
        "sets.0.load" as any,
        {
          type: "manual",
          message: "Failed to save test. Try again.",
        } as any
      );
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
            <CardTitle>Ballistic Bench Press — Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                {/* Equipment mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="equipmentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Mode</FormLabel>
                        <FormControl>
                          <select
                            title="bench"
                            className="w-full rounded-md border p-2"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          >
                            <option value="transducer">
                              Linear transducer / encoder
                            </option>
                            <option value="camera">Camera (video) based</option>
                            <option value="manual">
                              Manual (distance + time)
                            </option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* sets */}
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border p-4 space-y-4 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Set {index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Badge>Reps: {field.reps ?? "—"}</Badge>
                        <Button
                          variant="destructive"
                          type="button"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* load */}
                      <FormField
                        control={form.control}
                        name={`sets.${index}.load`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Load (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={0.5}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value !== ""
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

                      {/* reps */}
                      <FormField
                        control={form.control}
                        name={`sets.${index}.reps`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reps</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value !== ""
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

                      {/* distance */}
                      <FormField
                        control={form.control}
                        name={`sets.${index}.distance`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bar Travel Distance (m)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={0.01}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value !== ""
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* time */}
                      <FormField
                        control={form.control}
                        name={`sets.${index}.time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Concentric Time (s)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={0.01}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value !== ""
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

                      {/* optional sensor fields */}
                      <FormField
                        control={form.control}
                        name={`sets.${index}.peakVelocity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Peak Velocity (m/s) - optional (sensor)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={0.001}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value !== ""
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
                        name={`sets.${index}.peakForce`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Peak Force (N) - optional (sensor)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={0.1}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value !== ""
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`sets.${index}.bodyWeight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Athlete Bodyweight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={0.1}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value !== ""
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
                        name={`sets.${index}.restAfter`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rest After (s) — optional</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step={1}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value !== ""
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

                      <div />
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        load: 20,
                        reps: 3,
                        distance: 0.45,
                        time: 0.8,
                        peakVelocity: undefined,
                        peakForce: undefined,
                        bodyWeight: initialData?.sets?.[0]?.bodyWeight ?? 75,
                        restAfter: 90,
                      })
                    }
                  >
                    Add Set
                  </Button>

                  <div className="ml-auto">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? "Saving..."
                        : "Save Ballistic Bench Press"}
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Instructions & Live Metrics */}
      <div className="lg:col-span-5 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Instructions & Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <strong>Purpose:</strong> assess upper-body ballistic power and
              produce velocity–load profiling data.
            </div>

            <div>
              <strong>Equipment modes:</strong>
              <ul className="list-disc ml-5">
                <li>
                  <strong>transducer</strong> — use an encoder / linear
                  transducer for best velocity/force accuracy.
                </li>
                <li>
                  <strong>camera</strong> — extract displacement/time from video
                  frames (works with high-frame-rate phones).
                </li>
                <li>
                  <strong>manual</strong> — use measured bar travel (m) and
                  concentric time (s).
                </li>
              </ul>
            </div>

            <div>
              <strong>Formulas used:</strong>
              <ul className="list-disc ml-5">
                <li>
                  velocity (m/s) = distance (m) ÷ time (s) OR sensor
                  peakVelocity
                </li>
                <li>force (N) ≈ (load_kg + 0.2×bodyweight_kg) × g</li>
                <li>power (W) = force (N) × velocity (m/s)</li>
                <li>work (J) = force × distance (m)</li>
                <li>impulse (N·s) = force × time (s)</li>
              </ul>
            </div>

            <div className="text-xs text-muted-foreground">
              Tip: If you have transducer data (peakVelocity / peakForce) prefer
              those fields — they will be used over manual estimates.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Calculated Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Equipment Mode</span>
              <Badge>{computed?.equipmentMode ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Sets Analyzed</span>
              <Badge>{computed?.setsCount ?? 0}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Peak Power (W)</span>
              <Badge>{computed?.peakPower ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Mean Power (W)</span>
              <Badge>{computed?.meanPower ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Peak Velocity (m/s)</span>
              <Badge>{computed?.peakVelocity ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Avg Velocity (m/s)</span>
              <Badge>{computed?.avgVelocity ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Total Work (J)</span>
              <Badge>{computed?.totalWork ?? "—"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Total Impulse (N·s)</span>
              <Badge>{computed?.totalImpulse ?? "—"}</Badge>
            </div>

            <div>
              <strong className="block">Velocity–Load Points</strong>
              <div className="mt-2 text-xs">
                {computed?.velocityLoadPoints?.length ? (
                  <ul className="list-disc ml-5">
                    {computed.velocityLoadPoints.map((p, i) => (
                      <li key={i}>
                        {p.load} kg — {round(p.peakVelocity, 3)} m/s
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground">
                    No V–L points yet (enter distance/time or sensor data)
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Coaching Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="list-disc ml-5">
              <li>
                Use same ROM and cueing across sets for valid V–L profiling.
              </li>
              <li>If using free bar throws, ensure safeties/spotter.</li>
              <li>Save raw + calculated metrics for trend analysis.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
