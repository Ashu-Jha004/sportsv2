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

const yoYoTestSchema = z.object({
  distanceMeters: z
    .number({
      error: "Distance is required",
    })
    .min(0, "Distance cannot be negative")
    .max(5000, "Distance must be realistic"),
  notes: z.string().optional(),
});

type YoYoTestFormData = z.infer<typeof yoYoTestSchema>;

type YoYoTestFormProps = {
  initialData?: Partial<YoYoTestFormData>;
  onSave: (data: YoYoTestFormData) => void;
};

export function YoYoTestForm({ initialData, onSave }: YoYoTestFormProps) {
  const form = useForm<YoYoTestFormData>({
    resolver: zodResolver(yoYoTestSchema),
    defaultValues: initialData || { distanceMeters: undefined, notes: "" },
  });

  const onSubmit = (data: YoYoTestFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save Yo-Yo test data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="distanceMeters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance Completed (meters) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 1200"
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
            Save Yo-Yo Test
          </Button>
        </div>
      </form>
    </Form>
  );
}
