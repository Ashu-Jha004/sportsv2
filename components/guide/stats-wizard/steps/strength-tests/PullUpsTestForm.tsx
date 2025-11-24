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

const pullUpsSchema = z.object({
  repsCompleted: z
    .number({
      error: "Reps completed is required",
    })
    .int()
    .min(0, "Minimum 0 reps")
    .max(50, "Maximum 50 reps"),
  notes: z.string().optional(),
});

type PullUpsTestFormData = z.infer<typeof pullUpsSchema>;

type PullUpsTestFormProps = {
  initialData?: Partial<PullUpsTestFormData>;
  onSave: (data: PullUpsTestFormData) => void;
};

export function PullUpsTestForm({ initialData, onSave }: PullUpsTestFormProps) {
  const form = useForm<PullUpsTestFormData>({
    resolver: zodResolver(pullUpsSchema),
    defaultValues: initialData || { repsCompleted: 0, notes: "" },
  });

  const onSubmit = (data: PullUpsTestFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save pull-ups data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="repsCompleted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reps Completed *</FormLabel>
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
            Save Pull-Ups
          </Button>
        </div>
      </form>
    </Form>
  );
}
