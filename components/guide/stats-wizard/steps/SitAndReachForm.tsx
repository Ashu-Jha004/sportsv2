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

const sitAndReachSchema = z.object({
  distanceCm: z
    .number({
      error: "Distance is required",
    })
    .min(-30, "Too low")
    .max(50, "Too high"),
  notes: z.string().optional(),
});

type SitAndReachFormData = z.infer<typeof sitAndReachSchema>;

type SitAndReachFormProps = {
  initialData?: Partial<SitAndReachFormData>;
  onSave: (data: SitAndReachFormData) => void;
};

export function SitAndReachForm({ initialData, onSave }: SitAndReachFormProps) {
  const form = useForm<SitAndReachFormData>({
    resolver: zodResolver(sitAndReachSchema),
    defaultValues: initialData || { distanceCm: undefined, notes: "" },
  });

  const onSubmit = (data: SitAndReachFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save sit and reach data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="distanceCm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance Reached (cm) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  step="0.1"
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
          <Button type="submit" size="lg">
            Save Sit and Reach
          </Button>
        </div>
      </form>
    </Form>
  );
}
