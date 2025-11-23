"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Star, Calculator } from "lucide-react";
import {
  calculateJumpHeightFromFlightTime,
  calculateJumpHeightFromReach,
  calculateCMJPeakPower,
  calculateRelativePower,
  calculateTakeoffVelocity,
  findBestAttempt,
} from "@/lib/calculations/stats-calculations";
import type {
  JumpAttempt,
  CountermovementJumpTest,
} from "@/types/stats/athlete-stats.types";

const attemptSchema = z.object({
  attemptNumber: z.number(),
  standingReach: z.number().optional(),
  jumpReach: z.number().optional(),
  flightTime: z.number().optional(),
  load: z.number().min(0).default(0),
  notes: z.string().optional(),
});

const cmjSchema = z.object({
  attempts: z.array(attemptSchema).min(1, "At least one attempt is required"),
  testDate: z.string(),
});

type CMJFormData = z.infer<typeof cmjSchema>;

type CountermovementJumpFormProps = {
  bodyWeight: number; // From basic measurements
  initialData?: Partial<CountermovementJumpTest>;
  onSave: (data: CountermovementJumpTest) => void;
};

export function CountermovementJumpForm({
  bodyWeight,
  initialData,
  onSave,
}: any) {
  const [calculatedResults, setCalculatedResults] = useState<any[]>([]);

  const form = useForm<any>({
    resolver: zodResolver(cmjSchema),
    defaultValues: {
      attempts: initialData?.attempts || [
        { attemptNumber: 1, load: 0, notes: "" },
      ],
      testDate: initialData?.testDate || new Date().toISOString(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attempts",
  });

  // Calculate jump height for an attempt
  const calculateAttemptResults = (attempt: z.infer<typeof attemptSchema>) => {
    let jumpHeight = 0;

    // Method 1: From flight time
    if (attempt.flightTime) {
      jumpHeight = calculateJumpHeightFromFlightTime(attempt.flightTime);
    }
    // Method 2: From reach difference
    else if (attempt.standingReach && attempt.jumpReach) {
      jumpHeight = calculateJumpHeightFromReach(
        attempt.jumpReach,
        attempt.standingReach
      );
    }

    if (jumpHeight > 0) {
      const totalMass = bodyWeight + attempt.load;
      const peakPower = calculateCMJPeakPower(jumpHeight, totalMass);
      const relativePower = calculateRelativePower(peakPower, bodyWeight);
      const velocity = calculateTakeoffVelocity(jumpHeight);

      return {
        jumpHeight,
        peakPower,
        relativePower,
        velocity,
      };
    }

    return null;
  };

  // Recalculate on form changes
  const recalculateAll = () => {
    const attempts = form.getValues("attempts");
    const results = attempts.map((attempt: any) =>
      calculateAttemptResults(attempt)
    );
    setCalculatedResults(results);
  };

  const onSubmit = (data: CMJFormData) => {
    try {
      // Find best attempt
      const attemptResults = data.attempts.map((attempt, idx) => {
        const results = calculateAttemptResults(attempt);
        return {
          attempt,
          results,
        };
      });

      const validAttempts = attemptResults.filter((a) => a.results !== null);

      if (validAttempts.length === 0) {
        form.setError("root", {
          message:
            "Please provide either flight time OR standing reach + jump reach for at least one attempt",
        });
        return;
      }

      // Find best by jump height
      const bestAttempt = validAttempts.reduce((best, current) => {
        return (current.results?.jumpHeight || 0) >
          (best.results?.jumpHeight || 0)
          ? current
          : best;
      });

      const testData: CountermovementJumpTest = {
        attempts: data.attempts as JumpAttempt[],
        bestAttempt: {
          attemptNumber: bestAttempt.attempt.attemptNumber,
          jumpHeight: bestAttempt.results!.jumpHeight,
          peakPower: bestAttempt.results!.peakPower,
          relativePeakPower: bestAttempt.results!.relativePower,
          peakVelocity: bestAttempt.results!.velocity,
        },
        testDate: data.testDate,
      };

      onSave(testData);
    } catch (error) {
      console.error("[CMJForm] Error saving:", error);
      form.setError("root", {
        message: "Failed to save test data. Please check your inputs.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Attempts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Test Attempts
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const nextNum = fields.length + 1;
                append({ attemptNumber: nextNum, load: 0, notes: "" });
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Attempt
            </Button>
          </div>

          {fields.map((field, index) => {
            const results = calculatedResults[index];
            const isBest =
              results &&
              calculatedResults.every(
                (r, i) =>
                  i === index || !r || r.jumpHeight <= results.jumpHeight
              );

            return (
              <div
                key={field.id}
                className="relative rounded-lg border bg-card p-4"
              >
                {isBest && results && (
                  <Badge
                    variant="secondary"
                    className="absolute right-4 top-4 bg-amber-500/10 text-amber-700"
                  >
                    <Star className="mr-1 h-3 w-3" />
                    Best
                  </Badge>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <h5 className="font-semibold text-foreground">
                    Attempt {index + 1}
                  </h5>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Load */}
                  <FormField
                    control={form.control}
                    name={`attempts.${index}.load`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Load (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0 for bodyweight"
                            step="0.5"
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : 0
                              );
                              setTimeout(recalculateAll, 100);
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          0 = bodyweight only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Flight Time */}
                  <FormField
                    control={form.control}
                    name={`attempts.${index}.flightTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight Time (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 0.55"
                            step="0.001"
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              );
                              setTimeout(recalculateAll, 100);
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Standing Reach */}
                  <FormField
                    control={form.control}
                    name={`attempts.${index}.standingReach`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Standing Reach (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 240"
                            step="0.1"
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              );
                              setTimeout(recalculateAll, 100);
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Jump Reach */}
                  <FormField
                    control={form.control}
                    name={`attempts.${index}.jumpReach`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jump Reach (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 285"
                            step="0.1"
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              );
                              setTimeout(recalculateAll, 100);
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name={`attempts.${index}.notes`}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any observations or notes..."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Calculated Results */}
                {results && (
                  <Alert className="mt-4 border-primary/20 bg-primary/5">
                    <Calculator className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">
                            Jump Height:
                          </span>
                          <span className="ml-2 font-semibold text-foreground">
                            {results.jumpHeight.toFixed(2)} cm
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Peak Power:
                          </span>
                          <span className="ml-2 font-semibold text-foreground">
                            {results.peakPower.toFixed(0)} W
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Relative Power:
                          </span>
                          <span className="ml-2 font-semibold text-foreground">
                            {results.relativePower.toFixed(2)} W/kg
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Takeoff Velocity:
                          </span>
                          <span className="ml-2 font-semibold text-foreground">
                            {results.velocity.toFixed(3)} m/s
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Error */}
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Save Countermovement Jump Test
        </Button>
      </form>
    </Form>
  );
}
