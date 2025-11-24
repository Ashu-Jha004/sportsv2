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

const fiveZeroFiveSchema = z.object({
  timeSeconds: z
    .number({
      error: "Time is required",
    })
    .positive("Must be positive")
    .max(15, "Unrealistic time"),
  notes: z.string().optional(),
});

type FiveZeroFiveTestFormData = z.infer<typeof fiveZeroFiveSchema>;

type FiveZeroFiveTestFormProps = {
  initialData?: Partial<FiveZeroFiveTestFormData>;
  onSave: (data: FiveZeroFiveTestFormData) => void;
};

export function FiveZeroFiveTestForm({
  initialData,
  onSave,
}: FiveZeroFiveTestFormProps) {
  const form = useForm<FiveZeroFiveTestFormData>({
    resolver: zodResolver(fiveZeroFiveSchema),
    defaultValues: initialData || { timeSeconds: undefined, notes: "" },
  });

  const onSubmit = (data: FiveZeroFiveTestFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save 5-0-5 test data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="timeSeconds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time (seconds) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 2.45"
                  step="0.01"
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
            Save 5-0-5 Test
          </Button>
        </div>
      </form>
    </Form>
  );
}
