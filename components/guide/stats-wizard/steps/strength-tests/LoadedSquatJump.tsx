"use client";

import React, { useMemo, useState, useCallback } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

/* ============================
   ZOD SCHEMA WITH STRICT VALIDATION
============================ */

const repSchema = z.object({
  load: z
    .number({
      error: "Load is required",
    })
    .min(0, "Load cannot be negative")
    .max(1000, "Load seems unrealistic (max 1000kg)")
    .finite("Load must be a valid number"),

  reps: z
    .number({
      error: "Reps are required",
    })
    .int("Reps must be a whole number")
    .min(1, "Must do at least 1 rep")
    .max(100, "Reps seem unrealistic (max 100)")
    .finite("Reps must be a valid number"),

  restAfter: z
    .number({
      error: "Rest time is required",
    })
    .min(0, "Rest cannot be negative")
    .max(600, "Rest seems too long (max 10 minutes)")
    .finite("Rest must be a valid number"),
});

const setSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(50, "Name too long (max 50 characters)").optional(),
  reps: z
    .array(repSchema)
    .min(1, "Each set must have at least 1 rep entry")
    .max(20, "Too many rep entries per set (max 20)"),
  notes: z.string().max(500, "Notes too long (max 500 characters)").optional(),
});

const loadedSquatJumpSchema = z.object({
  sets: z
    .array(setSchema)
    .min(1, "Must have at least one set")
    .max(10, "Too many sets (max 10)"),

  bodyWeight: z
    .number({
      error: "Body weight is required",
    })
    .min(20, "Body weight seems too low (min 20kg)")
    .max(300, "Body weight seems too high (max 300kg)")
    .finite("Body weight must be a valid number"),

  totalTimeUsed: z
    .number({
      error: "Total time is required",
    })
    .min(0, "Time cannot be negative")
    .max(7200, "Time seems too long (max 2 hours)")
    .finite("Time must be a valid number"),

  notes: z
    .string()
    .max(1000, "Notes too long (max 1000 characters)")
    .optional(),
});

type LoadedSquatJumpFormValues = z.infer<typeof loadedSquatJumpSchema>;

/* ============================
   TYPES
============================ */

type PerSetMetric = {
  setIndex: number;
  totalReps: number;
  avgLoad: number;
  maxLoad: number;
  volumeLoad: number; // total kg moved in set
};

type OverallMetrics = {
  totalReps: number;
  avgLoad: number;
  maxLoad: number;
  totalVolumeLoad: number;
  totalSets: number;
};

type Props = {
  initialData?: Partial<LoadedSquatJumpFormValues>;
  onSave: (payload: Record<string, any>) => void | Promise<void>;
};

/* ============================
   HELPER FUNCTIONS
============================ */

function safeRound(val: number | null | undefined, decimals = 2): number {
  if (val == null || !Number.isFinite(val) || Number.isNaN(val)) return 0;
  const multiplier = Math.pow(10, decimals);
  return Math.round(val * multiplier) / multiplier;
}

function safeNumber(val: any): number {
  if (val == null || val === "") return 0;
  const num = Number(val);
  return Number.isFinite(num) && !Number.isNaN(num) ? num : 0;
}

/* ============================
   MAIN COMPONENT
============================ */

export function LoadedSquatJumpForm({ initialData, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // Initialize form with proper defaults
  const form = useForm<LoadedSquatJumpFormValues>({
    resolver: zodResolver(loadedSquatJumpSchema),
    defaultValues: {
      bodyWeight: initialData?.bodyWeight ?? undefined,
      totalTimeUsed: initialData?.totalTimeUsed ?? undefined,
      notes: initialData?.notes ?? "",
      sets: initialData?.sets?.length
        ? initialData.sets
        : [
            {
              name: "",
              notes: "",
              reps: [{ load: 20, reps: 5, restAfter: 60 }],
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

  // Watch sets for live metric calculation
  const watchedSets = useWatch({
    control: form.control,
    name: "sets",
  });

  // Compute metrics with proper memoization
  const computed = useMemo<{
    perSetMetrics: PerSetMetric[];
    overall: OverallMetrics;
  }>(() => {
    const sets = watchedSets || [];

    let overallTotalReps = 0;
    let overallLoadSum = 0;
    let overallLoadCount = 0;
    let overallMaxLoad = 0;
    let overallVolumeLoad = 0;

    const perSetMetrics: PerSetMetric[] = sets.map((s, si) => {
      let setTotalReps = 0;
      let setLoadSum = 0;
      let setLoadCount = 0;
      let setMaxLoad = 0;
      let setVolumeLoad = 0;

      const reps = s?.reps || [];

      reps.forEach((r) => {
        const load = safeNumber(r?.load);
        const repsCount = safeNumber(r?.reps);

        setTotalReps += repsCount;
        setLoadSum += load * repsCount;
        setLoadCount += repsCount;
        setVolumeLoad += load * repsCount;

        if (load > setMaxLoad) setMaxLoad = load;
        if (load > overallMaxLoad) overallMaxLoad = load;
      });

      overallTotalReps += setTotalReps;
      overallLoadSum += setLoadSum;
      overallLoadCount += setLoadCount;
      overallVolumeLoad += setVolumeLoad;

      return {
        setIndex: si,
        totalReps: setTotalReps,
        avgLoad: setLoadCount > 0 ? safeRound(setLoadSum / setLoadCount) : 0,
        maxLoad: setMaxLoad,
        volumeLoad: safeRound(setVolumeLoad),
      };
    });

    const overallAvgLoad =
      overallLoadCount > 0 ? safeRound(overallLoadSum / overallLoadCount) : 0;

    return {
      perSetMetrics,
      overall: {
        totalReps: overallTotalReps,
        avgLoad: overallAvgLoad,
        maxLoad: overallMaxLoad,
        totalVolumeLoad: safeRound(overallVolumeLoad),
        totalSets: sets.length,
      },
    };
  }, [watchedSets]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: LoadedSquatJumpFormValues) => {
      setIsSubmitting(true);
      setSaveStatus("idle");

      try {
        const payload = {
          raw: values,
          calculated: computed,
          meta: {
            recordedAt: new Date().toISOString(),
            formVersion: "1.0",
          },
        };

        await onSave(payload);

        // Reset form state to mark as clean
        form.reset(values, {
          keepValues: true,
          keepDirty: false,
          keepTouched: false,
        });

        setSaveStatus("success");

        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000);

        if (process.env.NODE_ENV === "development") {
          console.info("[LoadedSquatJumpForm] Saved:", payload);
        }
      } catch (err) {
        console.error("[LoadedSquatJumpForm] Save error:", err);
        setSaveStatus("error");

        // Show error for longer
        setTimeout(() => setSaveStatus("idle"), 5000);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSave, computed, form]
  );

  // Handle add set
  const handleAddSet = useCallback(() => {
    if (setFields.length >= 10) {
      alert("Maximum 10 sets allowed");
      return;
    }

    appendSet({
      name: "",
      notes: "",
      reps: [{ load: 20, reps: 5, restAfter: 60 }],
    });
  }, [appendSet, setFields.length]);

  // Handle remove set
  const handleRemoveSet = useCallback(
    (index: number) => {
      if (setFields.length <= 1) {
        alert("Cannot remove the last set");
        return;
      }
      removeSet(index);
    },
    [removeSet, setFields.length]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT PANEL: Form Inputs */}
      <div className="lg:col-span-7 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loaded Squat Jump — Test Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                {/* Top-level inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bodyWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Weight (kg) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="20"
                            max="300"
                            placeholder="70.0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(
                                val === "" ? undefined : parseFloat(val)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalTimeUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Time (seconds) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            max="7200"
                            placeholder="300"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(
                                val === "" ? undefined : parseInt(val, 10)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Sets</h3>
                    <Badge variant="secondary">
                      {setFields.length} / 10 Sets
                    </Badge>
                  </div>

                  {setFields.map((setField, setIndex) => (
                    <Card key={setField.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Set {setIndex + 1}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {form.watch(`sets.${setIndex}.reps`)?.length || 0}{" "}
                              reps
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSet(setIndex)}
                              disabled={setFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Set name */}
                        <FormField
                          control={form.control}
                          name={`sets.${setIndex}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Set Name (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Warm-up, Working set"
                                  maxLength={50}
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Nested reps */}
                        <NestedRepsComponent
                          control={form.control}
                          setIndex={setIndex}
                        />

                        {/* Set notes */}
                        <FormField
                          control={form.control}
                          name={`sets.${setIndex}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Set Notes (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any observations about this set..."
                                  rows={2}
                                  maxLength={500}
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
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSet}
                    disabled={setFields.length >= 10}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Set
                  </Button>
                </div>

                {/* Overall notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Test Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="General observations about the test session..."
                          rows={3}
                          maxLength={1000}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0} / 1000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status messages */}
                {saveStatus === "success" && (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Test data saved successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {saveStatus === "error" && (
                  <Alert className="border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Failed to save test data. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit button */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !form.formState.isValid}
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isSubmitting ? "Saving..." : "Save Test Data"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL: Live Metrics */}
      <div className="lg:col-span-5 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Live Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall metrics */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Overall Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Sets:</span>
                  <div className="font-semibold">
                    {computed.overall.totalSets}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Reps:</span>
                  <div className="font-semibold">
                    {computed.overall.totalReps}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Load:</span>
                  <div className="font-semibold">
                    {computed.overall.avgLoad} kg
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Load:</span>
                  <div className="font-semibold">
                    {computed.overall.maxLoad} kg
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Total Volume:</span>
                  <div className="font-semibold text-lg">
                    {computed.overall.totalVolumeLoad} kg
                  </div>
                </div>
              </div>
            </div>

            <hr />

            {/* Per-set metrics */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Per-Set Breakdown
              </h4>
              {computed.perSetMetrics.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sets added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {computed.perSetMetrics.map((metric) => (
                    <div
                      key={metric.setIndex}
                      className="p-3 rounded-lg bg-muted/50 text-sm space-y-1"
                    >
                      <div className="font-semibold">
                        Set {metric.setIndex + 1}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground">
                        <div>Reps: {metric.totalReps}</div>
                        <div>Avg: {metric.avgLoad} kg</div>
                        <div>Max: {metric.maxLoad} kg</div>
                        <div>Volume: {metric.volumeLoad} kg</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>
              <strong>Loaded Squat Jump</strong> tests power output with
              external load.
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Record the load (kg) for each rep or set</li>
              <li>Track total reps performed at each load</li>
              <li>Note rest periods between sets</li>
              <li>Volume load = load × reps (automatically calculated)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============================
   NESTED REPS COMPONENT
============================ */

type NestedRepsProps = {
  control: any;
  setIndex: number;
};

function NestedRepsComponent({ control, setIndex }: NestedRepsProps) {
  const {
    fields: repFields,
    append: appendRep,
    remove: removeRep,
  } = useFieldArray({
    control,
    name: `sets.${setIndex}.reps`,
  });

  const handleAddRep = useCallback(() => {
    if (repFields.length >= 20) {
      alert("Maximum 20 rep entries per set");
      return;
    }
    appendRep({ load: 20, reps: 5, restAfter: 60 });
  }, [appendRep, repFields.length]);

  const handleRemoveRep = useCallback(
    (repIndex: number) => {
      if (repFields.length <= 1) {
        alert("Each set must have at least 1 rep entry");
        return;
      }
      removeRep(repIndex);
    },
    [removeRep, repFields.length]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Rep Entries</label>
        <Badge variant="outline" className="text-xs">
          {repFields.length} / 20
        </Badge>
      </div>

      <div className="space-y-2">
        {repFields.map((repField, repIndex) => (
          <div
            key={repField.id}
            className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start"
          >
            <FormField
              control={control}
              name={`sets.${setIndex}.reps.${repIndex}.load`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Load (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="1000"
                      placeholder="20"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(
                          val === "" ? undefined : parseFloat(val)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`sets.${setIndex}.reps.${repIndex}.reps`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Reps</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      placeholder="5"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(
                          val === "" ? undefined : parseInt(val, 10)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`sets.${setIndex}.reps.${repIndex}.restAfter`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Rest (s)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="600"
                      placeholder="60"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(
                          val === "" ? undefined : parseInt(val, 10)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-7">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRep(repIndex)}
                disabled={repFields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddRep}
        disabled={repFields.length >= 20}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Rep Entry
      </Button>
    </div>
  );
}
