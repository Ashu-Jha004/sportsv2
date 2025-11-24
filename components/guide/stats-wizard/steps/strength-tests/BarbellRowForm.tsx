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

const barbellRowSchema = z.object({
  loadKg: z
    .number({ error: "Load is required" })
    .min(0, "Load cannot be negative")
    .max(500, "Unrealistic load"),
  reps: z
    .number({ error: "Reps is required" })
    .int()
    .min(1, "Minimum 1 rep")
    .max(50, "Maximum 50 reps"),
  notes: z.string().optional(),
});

type BarbellRowFormData = z.infer<typeof barbellRowSchema>;

type BarbellRowFormProps = {
  initialData?: Partial<BarbellRowFormData>;
  onSave: (data: BarbellRowFormData) => void;
};

export function BarbellRowForm({ initialData, onSave }: BarbellRowFormProps) {
  const form = useForm<BarbellRowFormData>({
    resolver: zodResolver(barbellRowSchema),
    defaultValues: initialData || {
      loadKg: undefined,
      reps: undefined,
      notes: "",
    },
  });

  const onSubmit = (data: BarbellRowFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save barbell row data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="loadKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Load (kg) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  step={0.5}
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
          name="reps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reps *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={50}
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
            Save Barbell Row
          </Button>
        </div>
      </form>
    </Form>
  );
}
