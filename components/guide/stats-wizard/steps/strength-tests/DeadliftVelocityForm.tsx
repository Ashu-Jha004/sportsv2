"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const deadliftVelocitySchema = z.object({
  oneRepMaxKg: z
    .number({
      error: "1RM is required",
    })
    .min(0, "Must be positive")
    .max(500, "Unrealistic 1RM"),
  peakVelocityMetersPerSec: z
    .number({
      error: "Peak velocity required",
    })
    .min(0.1, "Too low velocity")
    .max(10, "Too high velocity"),
  notes: z.string().optional(),
});

type DeadliftVelocityFormData = z.infer<typeof deadliftVelocitySchema>;

type DeadliftVelocityFormProps = {
  initialData?: Partial<DeadliftVelocityFormData>;
  onSave: (data: DeadliftVelocityFormData) => void;
};

export function DeadliftVelocityForm({
  initialData,
  onSave,
}: DeadliftVelocityFormProps) {
  const form = useForm<DeadliftVelocityFormData>({
    resolver: zodResolver(deadliftVelocitySchema),
    defaultValues: initialData || {
      oneRepMaxKg: undefined,
      peakVelocityMetersPerSec: undefined,
      notes: "",
    },
  });

  const onSubmit = (data: DeadliftVelocityFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save deadlift velocity data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="oneRepMaxKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>1 Rep Max (kg) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  step={0.1}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : undefined
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
          name="peakVelocityMetersPerSec"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peak Velocity (m/s) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0.1}
                  max={10}
                  step={0.01}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : undefined
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
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-red-600">
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2">
            Save Deadlift Velocity
          </Button>
        </div>
      </form>
    </Form>
  );
}
