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
import { Textarea } from "@/components/ui/textarea";

const heartRateSchema = z.object({
  restingHR: z.number({ error: "Resting HR is required" }).min(30).max(120),
  maxHR: z.number().min(100).max(220).optional(),
  recoveryHR: z.number().min(30).max(200).optional(),
  notes: z.string().optional(),
});

type HeartRateMetricsFormData = z.infer<typeof heartRateSchema>;

type HeartRateMetricsFormProps = {
  initialData?: Partial<HeartRateMetricsFormData>;
  onSave: (data: HeartRateMetricsFormData) => void;
};

export function HeartRateMetricsForm({
  initialData,
  onSave,
}: HeartRateMetricsFormProps) {
  const form = useForm<HeartRateMetricsFormData>({
    resolver: zodResolver(heartRateSchema),
    defaultValues: initialData || {
      restingHR: undefined,
      maxHR: undefined,
      recoveryHR: undefined,
      notes: "",
    },
  });

  const onSubmit = (data: HeartRateMetricsFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save heart rate data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="restingHR"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resting Heart Rate (bpm) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 60"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
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
          name="maxHR"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Heart Rate (bpm) - Optional</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 190"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
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
          name="recoveryHR"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Recovery Heart Rate (1 min post-exercise, bpm) - Optional
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 120"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
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
                <Textarea rows={3} {...field} />
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
          <Button type="submit" size="lg">
            Save Heart Rate Metrics
          </Button>
        </div>
      </form>
    </Form>
  );
}
