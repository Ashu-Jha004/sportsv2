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

const pushUpsSchema = z.object({
  repsBodyweight: z
    .number()
    .int()
    .min(0, "Min 0 reps")
    .max(200, "Max 200 reps"),
  repsWeighted: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

type PushUpsTestFormData = z.infer<typeof pushUpsSchema>;

type PushUpsTestFormProps = {
  initialData?: Partial<PushUpsTestFormData>;
  onSave: (data: PushUpsTestFormData) => void;
};

export function PushUpsTestForm({ initialData, onSave }: PushUpsTestFormProps) {
  const form = useForm<PushUpsTestFormData>({
    resolver: zodResolver(pushUpsSchema),
    defaultValues: {
      repsBodyweight: initialData?.repsBodyweight ?? 0,
      repsWeighted: initialData?.repsWeighted ?? 0,
      notes: initialData?.notes ?? "",
    },
  });

  const onSubmit = (data: PushUpsTestFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save push-ups data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="repsBodyweight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bodyweight Push-Ups Reps</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={200}
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
          name="repsWeighted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weighted Push-Ups Reps (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
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
                  className="w-full rounded-md border p-2"
                  {...field}
                  rows={3}
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
            Save Push-Ups
          </Button>
        </div>
      </form>
    </Form>
  );
}
