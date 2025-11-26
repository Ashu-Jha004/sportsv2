"use client";

import React, { useMemo, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

/* ============================
   ZOD SCHEMA
============================ */

const repSchema = z.object({
  groundContactTimeSec: z.number().min(0.01).max(5),
  jumpHeightCm: z.number().min(0).max(200),
});

const setSchema = z.object({
  name: z.string().optional(),
  dropHeightCm: z.number().min(5).max(200),
  reps: z.array(repSchema).min(1),
  notes: z.string().optional(),
});

const depthJumpSchema = z.object({
  sets: z.array(setSchema).min(1),
  notes: z.string().optional(),
});

type DepthJumpFormValues = z.infer<typeof depthJumpSchema>;

/* ============================
   HELPER FUNCTIONS
============================ */

const GRAVITY = 9.81;

function safeRound(
  val: number | null | undefined,
  decimals = 2
): number | null {
  if (val == null || !Number.isFinite(val)) return null;
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function calcRSI(jumpCm: number, contactSec: number): number | null {
  if (!jumpCm || !contactSec || contactSec <= 0) return null;
  return jumpCm / contactSec;
}

function calcFlightTime(jumpCm: number): number | null {
  if (!jumpCm || jumpCm <= 0) return null;
  const jumpMeters = jumpCm / 100;
  return Math.sqrt((8 * jumpMeters) / GRAVITY);
}

/* ============================
   TYPES
============================ */

type Props = {
  initialData?: Partial<DepthJumpFormValues>;
  onSave: (payload: any) => void | Promise<void>;
};

/* ============================
   MAIN COMPONENT
============================ */

export function DepthJumpForm({ initialData, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const form = useForm<DepthJumpFormValues>({
    resolver: zodResolver(depthJumpSchema),
    defaultValues: initialData || {
      notes: "",
      sets: [
        {
          name: "",
          dropHeightCm: 40,
          notes: "",
          reps: [
            { groundContactTimeSec: 0.22, jumpHeightCm: 25 },
            { groundContactTimeSec: 0.2, jumpHeightCm: 26 },
          ],
        },
      ],
    },
    mode: "onBlur",
  });

  const {
    fields: setFields,
    append: appendSet,
    remove: removeSet,
  } = useFieldArray({
    control: form.control,
    name: "sets",
  });

  const watchedSets = useWatch({ control: form.control, name: "sets" }) || [];

  // Calculate metrics
  const metrics = useMemo(() => {
    let totalReps = 0;
    let bestRSI: number | null = null;
    let bestJump: number | null = null;
    let rsiSum = 0;
    let rsiCount = 0;

    const perSet = watchedSets.map((set: any, idx: number) => {
      const reps = set?.reps || [];
      let setBestRSI: number | null = null;
      let setRSISum = 0;
      let setRSICount = 0;
      let setBestJump: number | null = null;

      reps.forEach((rep: any) => {
        const jump = rep?.jumpHeightCm || 0;
        const contact = rep?.groundContactTimeSec || 0;
        const rsi = calcRSI(jump, contact);

        if (rsi) {
          setRSISum += rsi;
          setRSICount++;
          rsiSum += rsi;
          rsiCount++;
          if (!setBestRSI || rsi > setBestRSI) setBestRSI = rsi;
          if (!bestRSI || rsi > bestRSI) bestRSI = rsi;
        }

        if (jump) {
          if (!setBestJump || jump > setBestJump) setBestJump = jump;
          if (!bestJump || jump > bestJump) bestJump = jump;
        }

        totalReps++;
      });

      return {
        setIndex: idx,
        dropHeight: set?.dropHeightCm || 0,
        repsCount: reps.length,
        bestRSI: safeRound(setBestRSI, 2),
        avgRSI: setRSICount > 0 ? safeRound(setRSISum / setRSICount, 2) : null,
        bestJump: safeRound(setBestJump, 1),
      };
    });

    return {
      perSet,
      overall: {
        totalReps,
        bestRSI: safeRound(bestRSI, 2),
        avgRSI: rsiCount > 0 ? safeRound(rsiSum / rsiCount, 2) : null,
        bestJump: safeRound(bestJump, 1),
      },
    };
  }, [watchedSets]);

  const handleSubmit = async (values: DepthJumpFormValues) => {
    setIsSubmitting(true);
    setSaveStatus("idle");

    try {
      await onSave({
        raw: values,
        calculated: metrics,
        meta: { recordedAt: new Date().toISOString() },
      });

      form.reset(values, { keepValues: true, keepDirty: false });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT PANEL */}
      <div className="lg:col-span-7 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Depth Jump Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                {/* Sets */}
                <div className="space-y-4">
                  {setFields.map((setField, setIndex) => (
                    <Card key={setField.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Set {setIndex + 1}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge>
                              {form.watch(`sets.${setIndex}.reps`)?.length || 0}{" "}
                              reps
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (setFields.length > 1) removeSet(setIndex);
                              }}
                              disabled={setFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`sets.${setIndex}.dropHeightCm`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Drop Height (cm)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="1"
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
                            name={`sets.${setIndex}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Set Name (optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <NestedReps
                          control={form.control}
                          setIndex={setIndex}
                        />

                        <FormField
                          control={form.control}
                          name={`sets.${setIndex}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  value={field.value ?? ""}
                                  rows={2}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendSet({
                        name: "",
                        dropHeightCm: 40,
                        notes: "",
                        reps: [
                          { groundContactTimeSec: 0.22, jumpHeightCm: 25 },
                        ],
                      })
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          rows={3}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {saveStatus === "success" && (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Saved successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {saveStatus === "error" && (
                  <Alert className="border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Failed to save. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isSubmitting ? "Saving..." : "Save Test"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL - Metrics */}
      <div className="lg:col-span-5 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Total Reps:</span>
                <div className="font-semibold">{metrics.overall.totalReps}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Best RSI:</span>
                <div className="font-semibold text-lg">
                  {metrics.overall.bestRSI ?? "—"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Avg RSI:</span>
                <div className="font-semibold">
                  {metrics.overall.avgRSI ?? "—"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Best Jump:</span>
                <div className="font-semibold">
                  {metrics.overall.bestJump ?? "—"} cm
                </div>
              </div>
            </div>

            <hr />

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Per-Set</h4>
              {metrics.perSet.map((set: any) => (
                <div
                  key={set.setIndex}
                  className="p-2 rounded bg-muted/50 text-xs"
                >
                  <div className="font-semibold">Set {set.setIndex + 1}</div>
                  <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                    <div>Drop: {set.dropHeight}cm</div>
                    <div>Reps: {set.repsCount}</div>
                    <div>Best RSI: {set.bestRSI ?? "—"}</div>
                    <div>Avg RSI: {set.avgRSI ?? "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formula</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="bg-muted px-2 py-1 rounded font-mono text-xs">
              RSI = jumpHeight (cm) / contactTime (s)
            </div>
            <p>Higher RSI indicates better reactive strength</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============================
   NESTED REPS COMPONENT
============================ */

function NestedReps({ control, setIndex }: { control: any; setIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sets.${setIndex}.reps`,
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Reps</label>

      {fields.map((field, repIndex) => (
        <div
          key={field.id}
          className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-start"
        >
          <FormField
            control={control}
            name={`sets.${setIndex}.reps.${repIndex}.groundContactTimeSec`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Contact (s)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`sets.${setIndex}.reps.${repIndex}.jumpHeightCm`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Jump (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-7">
            <RepMetrics
              control={control}
              setIndex={setIndex}
              repIndex={repIndex}
            />
          </div>

          <div className="pt-7">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (fields.length > 1) remove(repIndex);
              }}
              disabled={fields.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ groundContactTimeSec: 0.22, jumpHeightCm: 25 })}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Rep
      </Button>
    </div>
  );
}

/* ============================
   REP METRICS DISPLAY
============================ */

function RepMetrics({ control, setIndex, repIndex }: any) {
  const contact = useWatch({
    control,
    name: `sets.${setIndex}.reps.${repIndex}.groundContactTimeSec`,
  });

  const jump = useWatch({
    control,
    name: `sets.${setIndex}.reps.${repIndex}.jumpHeightCm`,
  });

  const rsi = calcRSI(jump || 0, contact || 0);
  const flight = calcFlightTime(jump || 0);

  return (
    <div className="text-xs text-muted-foreground min-w-[70px]">
      <div className="font-semibold">RSI: {rsi ? safeRound(rsi, 2) : "—"}</div>
      <div>Flight: {flight ? safeRound(flight, 3) + "s" : "—"}</div>
    </div>
  );
}
