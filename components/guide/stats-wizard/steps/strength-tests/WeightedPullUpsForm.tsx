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

const weightedPullUpsSchema = z.object({
  reps: z
    .number({
      error: "Number of reps is required",
    })
    .int()
    .min(0, "Minimum 0 reps")
    .max(50, "Maximum 50 reps"),
  weightKg: z
    .number({
      error: "Weight must be a number",
    })
    .min(0, "Minimum 0 kg")
    .optional(),
  notes: z.string().optional(),
});

type WeightedPullUpsFormData = z.infer<typeof weightedPullUpsSchema>;

type WeightedPullUpsFormProps = {
  initialData?: Partial<WeightedPullUpsFormData>;
  onSave: (data: WeightedPullUpsFormData) => void;
};

export function WeightedPullUpsForm({
  initialData,
  onSave,
}: WeightedPullUpsFormProps) {
  const form = useForm<WeightedPullUpsFormData>({
    resolver: zodResolver(weightedPullUpsSchema),
    defaultValues: initialData || { reps: 0, weightKg: 0, notes: "" },
  });

  const onSubmit = (data: WeightedPullUpsFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save weighted pull-ups data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reps *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : 0
                    )
                  }
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weightKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Weight (kg) - Optional</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : 0
                    )
                  }
                  value={field.value || ""}
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
            Save Weighted Pull-Ups
          </Button>
        </div>
      </form>
    </Form>
  );
}
