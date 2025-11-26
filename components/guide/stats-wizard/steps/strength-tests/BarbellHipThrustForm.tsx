"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

/* -------------------------
   📌 SCHEMA
----------------------------*/
const schema = z.object({
  loadKg: z.number().min(1, "Enter a valid load"),
  reps: z.number().min(1).max(20),
  bodyWeight: z.number().min(20).max(200).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  initialData?: Partial<FormData>;
  onSave: (data: FormData & CalculatedOutputs) => void;
};

/* -------------------------
   📌 CALCULATION HELPERS
----------------------------*/

type CalculatedOutputs = {
  estimated1RM: number | null;
  volumeLoad: number | null;
};

function estimate1RM(load: number, reps: number): number {
  // Epley Formula
  return Math.round(load * (1 + reps / 30));
}

function calcVolume(load: number, reps: number): number {
  return load * reps;
}

/* -------------------------
   📌 MAIN COMPONENT
----------------------------*/

export function BarbellHipThrustForm({ initialData, onSave }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      loadKg: undefined,
      reps: undefined,
      bodyWeight: undefined,
      notes: "",
    },
  });

  const [calculated, setCalculated] = useState<CalculatedOutputs>({
    estimated1RM: null,
    volumeLoad: null,
  });

  /* 🔄 AUTO-CALCULATE WHEN INPUTS CHANGE */
  const load = form.watch("loadKg");
  const reps = form.watch("reps");

  useEffect(() => {
    if (load && reps) {
      setCalculated({
        estimated1RM: estimate1RM(load, reps),
        volumeLoad: calcVolume(load, reps),
      });
    } else {
      setCalculated({
        estimated1RM: null,
        volumeLoad: null,
      });
    }
  }, [load, reps]);

  const onSubmit = (data: FormData) => {
    onSave({
      ...data,
      ...calculated,
    });
  };

  return (
    <div className="space-y-6">
      {/* ----------------------
          ℹ️ INFO CARD 
      -----------------------*/}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border">
        <CardHeader>
          <CardTitle>Barbell Hip Thrust — Test Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Purpose:</strong> Evaluates posterior-chain strength
            (glutes, hip extensors).
          </div>

          <div>
            <strong>How to Perform:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Sit with upper back resting on bench.</li>
              <li>Load barbell across hips with pad.</li>
              <li>Feet flat, hip-width apart.</li>
              <li>Thrust upward until hips reach full extension.</li>
              <li>Lower under control and repeat for required reps.</li>
            </ul>
          </div>

          <div>
            <strong>Auto Calculations:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>
                📌 Estimated 1RM (Epley): <code>Load × (1 + Reps/30)</code>
              </li>
              <li>
                📌 Volume Load: <code>Load × Reps</code>
              </li>
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
              🧮 AUTO CALCULATED
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
            </CardContent>
          </Card>

          {/* SUBMIT */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="gap-2">
              Save Barbell Hip Thrust
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
