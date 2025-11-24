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

const visualReactionSchema = z.object({
  reactionTimeMs: z
    .number({
      error: "Reaction time is required",
    })
    .positive("Must be positive")
    .max(2000, "Unrealistic reaction time"),
  notes: z.string().optional(),
});

type VisualReactionFormData = z.infer<typeof visualReactionSchema>;

type VisualReactionFormProps = {
  initialData?: Partial<VisualReactionFormData>;
  onSave: (data: VisualReactionFormData) => void;
};

export function VisualReactionSpeedForm({
  initialData,
  onSave,
}: VisualReactionFormProps) {
  const form = useForm<VisualReactionFormData>({
    resolver: zodResolver(visualReactionSchema),
    defaultValues: initialData || { reactionTimeMs: undefined, notes: "" },
  });

  const onSubmit = (data: VisualReactionFormData) => {
    try {
      onSave(data);
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Failed to save reaction drill data.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reactionTimeMs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reaction Time (ms) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 250"
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
          <Button type="submit" size="lg" className="gap-2">
            Save Visual Reaction Drill
          </Button>
        </div>
      </form>
    </Form>
  );
}
