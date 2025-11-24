"use client";

import { useForm } from "react-hook-form";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Zap } from "lucide-react";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";

// Validation schema
const sprintSchema = z.object({
  timeSeconds: z
    .number({
      error: "Time (seconds) is required",
    })
    .positive("Time must be positive")
    .max(20, "Time must be less than 20 seconds"),
  notes: z.string().optional(),
});

type TenMeterSprintFormData = z.infer<typeof sprintSchema>;

type TenMeterSprintFormProps = {
  initialData?: { timeSeconds: number; notes?: string };
  onSave: (data: TenMeterSprintFormData) => void;
};

export function TenMeterSprintForm({ initialData, onSave }: TenMeterSprintFormProps) {
  const form = useForm<TenMeterSprintFormData>({
    resolver: zodResolver(sprintSchema),
    defaultValues: initialData || { timeSeconds: undefined, notes: "" },
  });

  const onSubmit = (data: TenMeterSprintFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save sprint data. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Zap className="h-5 w-5" />
          <h4 className="font-semibold text-foreground">10 Meter Sprint</h4>
        </div>

        <FormField
          control={form.control}
          name="timeSeconds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time (seconds) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 1.85"
                  step="0.01"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Time taken by athlete to complete 10 meters sprint.
              </FormDescription>
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
                  className="w-full rounded-md border border-muted p-2 text-sm"
                  rows={3}
                  placeholder="Any observations or remarks"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="gap-2"
          >
            {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save 10m Sprint
          </Button>
        </div>
      </form>
    </Form>
  );
}
