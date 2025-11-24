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

const standingLongJumpSchema = z.object({
  distanceMeters: z
    .number({
      error: "Distance is required",
    })
    .positive()
    .max(5, "Unrealistic distance"),
  notes: z.string().optional(),
});

type StandingLongJumpFormData = z.infer<typeof standingLongJumpSchema>;

type StandingLongJumpFormProps = {
  initialData?: Partial<StandingLongJumpFormData>;
  onSave: (data: StandingLongJumpFormData) => void;
};

export function StandingLongJumpForm({
  initialData,
  onSave,
}: StandingLongJumpFormProps) {
  const form = useForm<StandingLongJumpFormData>({
    resolver: zodResolver(standingLongJumpSchema),
    defaultValues: initialData || { distanceMeters: undefined, notes: "" },
  });

  const onSubmit = (data: StandingLongJumpFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save standing long jump data.",
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
              <FormLabel>Distance (meters) *</FormLabel>
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
            Save Standing Long Jump
          </Button>
        </div>
      </form>
    </Form>
  );
}
