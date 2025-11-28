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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* -------------------------
   📌 ZOD VALIDATION SCHEMA
----------------------------*/
const schema = z.object({
  loadKg: z.number().min(1, "Enter a valid load"),
  reps: z.number().min(1).max(30),
  bodyWeight: z.number().min(20).max(200).optional(),
  techniqueScore: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

/* -------------------------
   📌 CALCULATION HELPERS
----------------------------*/

type CalculatedOutputs = {
  estimated1RM: number | null;
  volumeLoad: number | null;
  relativeStrength: number | null;
};

function estimate1RM(load: number, reps: number): number {
  return Math.round(load * (1 + reps / 30));
}

function calcVolume(load: number, reps: number): number {
  return load * reps;
}

function calcRelativeStrength(estimated1RM: number, bodyWeight?: number) {
  if (!estimated1RM || !bodyWeight) return null;
  return parseFloat((estimated1RM / bodyWeight).toFixed(2));
}

/* -------------------------
   📌 MAIN COMPONENT
----------------------------*/

export function BarbellRowForm({
  initialData,
  onSave,
}: {
  initialData?: Partial<FormData>;
  onSave: (data: FormData & CalculatedOutputs) => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      loadKg: undefined,
      reps: undefined,
      bodyWeight: undefined,
      techniqueScore: undefined,
      notes: "",
    },
  });

  const [calculated, setCalculated] = useState<CalculatedOutputs>({
    estimated1RM: null,
    volumeLoad: null,
    relativeStrength: null,
  });

  const load = form.watch("loadKg");
  const reps = form.watch("reps");
  const bw = form.watch("bodyWeight");

  useEffect(() => {
    if (load && reps) {
      const est1RM = estimate1RM(load, reps);
      setCalculated({
        estimated1RM: est1RM,
        volumeLoad: calcVolume(load, reps),
        relativeStrength: calcRelativeStrength(est1RM, bw),
      });
    } else {
      setCalculated({
        estimated1RM: null,
        volumeLoad: null,
        relativeStrength: null,
      });
    }
  }, [load, reps, bw]);

  const onSubmit = (data: FormData) => {
    onSave({ ...data, ...calculated });
  };

  return (
    <div className="space-y-6">
      {/* ----------------------
          ℹ️ INFO CARD 
      -----------------------*/}
      <Card className="bg-linear-to-br from-slate-50 to-slate-100 border">
        <CardHeader>
          <CardTitle>Barbell Row — Test Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Purpose:</strong> Measures upper-back, lats, and
            posterior-chain pulling strength.
          </div>

          <div>
            <strong>How to Perform:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Stand with feet shoulder-width, bar over mid-foot.</li>
              <li>Hinge to ~45° torso angle, maintain neutral spine.</li>
              <li>Grip slightly wider than shoulder width.</li>
              <li>Row bar to lower ribs while keeping elbows tight.</li>
              <li>Lower bar under control and repeat.</li>
            </ul>
          </div>

          <div>
            <strong>Auto Calculations:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>📌 Estimated 1RM (Epley): Load × (1 + Reps/30)</li>
              <li>📌 Volume Load: Load × Reps</li>
              <li>📌 Relative Strength: Estimated 1RM ÷ Body Weight</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------
          FORM 
      -----------------------*/}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Load */}
          <FormField
            control={form.control}
            name="loadKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Load (kg) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={0.5}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reps */}
          <FormField
            control={form.control}
            name="reps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Body Weight */}
          <FormField
            control={form.control}
            name="bodyWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={0.5}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || undefined)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Technique Score */}
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
                      field.onChange(parseInt(e.target.value) || undefined)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* NOTES */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full rounded-md border p-2 text-sm"
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* ----------------------
              🧮 CALCULATED OUTPUT
          -----------------------*/}
          <Card className="border bg-white">
            <CardHeader>
              <CardTitle>Calculated Outputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <strong>Estimated 1RM:</strong>{" "}
                {calculated.estimated1RM
                  ? `${calculated.estimated1RM} kg`
                  : "--"}
              </p>
              <p>
                <strong>Volume Load:</strong>{" "}
                {calculated.volumeLoad ? `${calculated.volumeLoad} kg` : "--"}
              </p>
              <p>
                <strong>Relative Strength (1RM ÷ BW):</strong>{" "}
                {calculated.relativeStrength
                  ? `${calculated.relativeStrength}`
                  : "--"}
              </p>
            </CardContent>
          </Card>

          {/* SUBMIT */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="gap-2">
              Save Barbell Row
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
