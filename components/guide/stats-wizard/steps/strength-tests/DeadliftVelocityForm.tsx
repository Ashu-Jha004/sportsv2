"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* -------------------------------------------
   ZOD VALIDATION SCHEMA
----------------------------------------------*/
const schema = z.object({
  oneRepMaxKg: z.number().min(1).max(500),
  loadUsedKg: z.number().min(1).max(500),
  peakVelocity: z.number().min(0.1).max(10),
  reps: z.number().min(1).max(20),
  barDisplacement: z.number().min(0.1).max(2).optional(),
  bodyWeight: z.number().min(20).max(200).optional(),
  techniqueScore: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

/* -------------------------------------------
   HELPER CALCULATION FUNCTIONS
----------------------------------------------*/

type CalculatedOutputs = {
  power: number | null;
  volumeLoad: number | null;
  relativeStrength: number | null;
  velocityToLoadRatio: number | null;
  estimatedVelocity1RM: number | null;
};

function calcPower(load: number, velocity: number): number {
  return parseFloat((load * velocity).toFixed(2));
}

function calcVolume(load: number, reps: number): number {
  return load * reps;
}

function calcRelativeStrength(
  oneRM: number,
  bodyWeight?: number
): number | null {
  if (!bodyWeight) return null;
  return parseFloat((oneRM / bodyWeight).toFixed(2));
}

function calcVelocityLoadRatio(velocity: number, load: number) {
  return parseFloat((velocity / load).toFixed(4));
}

function estimateVelocityBased1RM(load: number, velocity: number) {
  return parseFloat((load / (velocity / 0.5)).toFixed(1));
}

/* -------------------------------------------
   MAIN COMPONENT
----------------------------------------------*/

export function DeadliftVelocityForm({
  initialData,
  onSave,
}: {
  initialData?: Partial<FormData>;
  onSave: (data: FormData & CalculatedOutputs) => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      oneRepMaxKg: initialData?.oneRepMaxKg,
      loadUsedKg: initialData?.loadUsedKg,
      peakVelocity: initialData?.peakVelocity,
      reps: initialData?.reps,
      barDisplacement: initialData?.barDisplacement,
      bodyWeight: initialData?.bodyWeight,
      techniqueScore: initialData?.techniqueScore,
      notes: initialData?.notes ?? "",
    },
  });

  const [calc, setCalc] = useState<CalculatedOutputs>({
    power: null,
    volumeLoad: null,
    relativeStrength: null,
    velocityToLoadRatio: null,
    estimatedVelocity1RM: null,
  });

  const watchLoad = form.watch("loadUsedKg");
  const watchVelocity = form.watch("peakVelocity");
  const watchReps = form.watch("reps");
  const watchOneRM = form.watch("oneRepMaxKg");
  const watchBW = form.watch("bodyWeight");

  useEffect(() => {
    if (watchLoad && watchVelocity && watchReps && watchOneRM) {
      const power = calcPower(watchLoad, watchVelocity);
      const volume = calcVolume(watchLoad, watchReps);
      const rel = calcRelativeStrength(watchOneRM, watchBW);
      const ratio = calcVelocityLoadRatio(watchVelocity, watchLoad);
      const estV1RM = estimateVelocityBased1RM(watchLoad, watchVelocity);

      setCalc({
        power,
        volumeLoad: volume,
        relativeStrength: rel,
        velocityToLoadRatio: ratio,
        estimatedVelocity1RM: estV1RM,
      });
    }
  }, [watchLoad, watchVelocity, watchReps, watchOneRM, watchBW]);

  const onSubmit = (data: FormData) => {
    onSave({ ...data, ...calc });
  };

  return (
    <div className="space-y-6">
      {/* INFO CARD */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border">
        <CardHeader>
          <CardTitle>Deadlift Velocity Test — Guide</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Purpose:</strong> Measures bar-speed, neuromuscular power,
            and load–velocity performance for deadlifting.
          </div>

          <div>
            <strong>How to Perform:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Attach linear encoder or bar velocity tracking device.</li>
              <li>
                Perform deadlifts at selected submaximal loads (20–80% 1RM).
              </li>
              <li>
                Lift with maximal intent: "Move the bar as fast as possible."
              </li>
              <li>Record peak velocity for the best rep.</li>
            </ul>
          </div>

          <div>
            <strong>Automatic Calculations:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Power = Load × Peak Velocity</li>
              <li>Volume Load = Load × Reps</li>
              <li>Relative Strength = 1RM ÷ Body Weight</li>
              <li>Velocity-to-Load Ratio = Vel ÷ Load</li>
              <li>Estimated Velocity-Based 1RM</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* FORM */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 1RM - FIXED */}
          <FormField
            control={form.control}
            name="oneRepMaxKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>1 Rep Max (kg) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
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

          {/* Load Used - FIXED */}
          <FormField
            control={form.control}
            name="loadUsedKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Load Used (kg) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
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

          {/* Peak Velocity - FIXED */}
          <FormField
            control={form.control}
            name="peakVelocity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peak Velocity (m/s) *</FormLabel>
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

          {/* Reps - FIXED */}
          <FormField
            control={form.control}
            name="reps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps Performed *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
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

          {/* Bar displacement - FIXED */}
          <FormField
            control={form.control}
            name="barDisplacement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bar Displacement (m)</FormLabel>
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

          {/* Bodyweight - FIXED */}
          <FormField
            control={form.control}
            name="bodyWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Weight (kg)</FormLabel>
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

          {/* Technique Score - FIXED */}
          <FormField
            control={form.control}
            name="techniqueScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technique Score (1–10)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    max="10"
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

          {/* Notes - FIXED */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CALCULATED OUTPUT */}
          <Card className="border bg-white">
            <CardHeader>
              <CardTitle>Calculated Performance Metrics</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 text-sm">
              <p>
                <strong>Power Output:</strong>{" "}
                {calc.power ? `${calc.power} W` : "—"}
              </p>

              <p>
                <strong>Volume Load:</strong>{" "}
                {calc.volumeLoad ? `${calc.volumeLoad} kg` : "—"}
              </p>

              <p>
                <strong>Relative Strength:</strong>{" "}
                {calc.relativeStrength ? `${calc.relativeStrength}` : "—"}
              </p>

              <p>
                <strong>Velocity-to-Load Ratio:</strong>{" "}
                {calc.velocityToLoadRatio || "—"}
              </p>

              <p>
                <strong>Estimated Velocity-Based 1RM:</strong>{" "}
                {calc.estimatedVelocity1RM
                  ? `${calc.estimatedVelocity1RM} kg`
                  : "—"}
              </p>
            </CardContent>
          </Card>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="gap-2">
              Save Deadlift Velocity
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
