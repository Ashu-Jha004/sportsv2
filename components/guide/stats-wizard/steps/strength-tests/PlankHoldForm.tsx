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

const plankHoldSchema = z.object({
  bodyweightDurationSeconds: z
    .number({
      error: "Bodyweight duration is required",
    })
    .min(1, "Must be at least 1 second")
    .max(3600, "Cannot exceed 3600 seconds"),
  weightedLoadKg: z.number().min(0).optional(),
  weightedDurationSeconds: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type PlankHoldFormData = z.infer<typeof plankHoldSchema>;

type PlankHoldFormProps = {
  initialData?: Partial<PlankHoldFormData>;
  onSave: (data: PlankHoldFormData) => void;
};

export function PlankHoldForm({ initialData, onSave }: PlankHoldFormProps) {
  const form = useForm<PlankHoldFormData>({
    resolver: zodResolver(plankHoldSchema),
    defaultValues: initialData || {
      bodyweightDurationSeconds: undefined,
      weightedLoadKg: 0,
      weightedDurationSeconds: 0,
      notes: "",
    },
  });

  const onSubmit = (data: PlankHoldFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save plank hold data",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bodyweightDurationSeconds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bodyweight Plank Duration (seconds) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={3600}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
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
          name="weightedLoadKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weighted Load (kg) - Optional</FormLabel>
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
          name="weightedDurationSeconds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Weighted Plank Duration (seconds) - Optional
              </FormLabel>
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
          <Button type="submit" size="lg" className="gap-2">
            Save Plank Hold
          </Button>
        </div>
      </form>
    </Form>
  );
}
