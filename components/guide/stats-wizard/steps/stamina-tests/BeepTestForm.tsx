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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Activity } from "lucide-react";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";

const beepTestSchema = z.object({
  levelCompleted: z
    .number({
      error: "Level completed is required",
    })
    .min(0, "Level cannot be negative")
    .max(30, "Level must be realistic"),
  notes: z.string().optional(),
});

type BeepTestFormData = z.infer<typeof beepTestSchema>;

type BeepTestFormProps = {
  initialData?: Partial<BeepTestFormData>;
  onSave: (data: BeepTestFormData) => void;
};

export function BeepTestForm({ initialData, onSave }: BeepTestFormProps) {
  const form = useForm<BeepTestFormData>({
    resolver: zodResolver(beepTestSchema),
    defaultValues: initialData || { levelCompleted: undefined, notes: "" },
  });

  const onSubmit = (data: BeepTestFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save beep test data. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="h-5 w-5" />
          <h4 className="font-semibold text-foreground">Beep Test</h4>
        </div>

        <FormField
          control={form.control}
          name="levelCompleted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level Completed *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 15"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                The highest level the athlete completed in the beep test.
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
                <Textarea
                  placeholder="Any observations..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="gap-2"
          >
            {form.formState.isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Save Beep Test
          </Button>
        </div>
      </form>
    </Form>
  );
}
