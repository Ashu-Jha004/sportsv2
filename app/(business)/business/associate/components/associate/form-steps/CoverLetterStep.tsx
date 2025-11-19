"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssociateStore } from "@/stores/associate/associate-store";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const coverLetterSchema = z.object({
  coverLetter: z
    .string()
    .min(100, "Cover letter must be at least 100 characters")
    .max(2000, "Cover letter must not exceed 2000 characters"),
});

type CoverLetterFormData = z.infer<typeof coverLetterSchema>;

interface CoverLetterStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function CoverLetterStep({ onValidationChange }: CoverLetterStepProps) {
  const { formData, updateField } = useAssociateStore();

  const form = useForm<CoverLetterFormData>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      coverLetter: formData.coverLetter || "",
    },
    mode: "onChange",
  });

  const { watch, formState } = form;
  const coverLetter = watch("coverLetter");

  useEffect(() => {
    onValidationChange(formState.isValid);
  }, [formState.isValid, onValidationChange]);

  useEffect(() => {
    if (coverLetter) {
      updateField("coverLetter", coverLetter);
    }
  }, [coverLetter, updateField]);

  const charCount = coverLetter?.length || 0;
  const minChars = 100;
  const maxChars = 2000;
  const progress = Math.min((charCount / minChars) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Cover Letter
        </h2>
        <p className="text-gray-600">
          Tell us why you want to become an associate and what you can offer
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Cover Letter *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="I am passionate about coaching and mentoring athletes because..."
                    {...field}
                    rows={12}
                    className="resize-none text-base"
                    autoFocus
                  />
                </FormControl>
                <FormDescription>
                  Include your experience, motivation, and how you can help
                  athletes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Character Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span
                className={
                  charCount >= minChars
                    ? "text-green-600 font-medium"
                    : "text-gray-500"
                }
              >
                {charCount >= minChars
                  ? `✓ Minimum reached`
                  : `${minChars - charCount} more characters needed`}
              </span>
              <span
                className={
                  charCount > maxChars ? "text-red-600" : "text-gray-500"
                }
              >
                {charCount} / {maxChars}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  charCount >= minChars ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
