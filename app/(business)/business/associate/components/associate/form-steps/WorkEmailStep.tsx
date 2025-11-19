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
import { Input } from "@/components/ui/input";

const workEmailSchema = z.object({
  workEmail: z
    .string()
    .min(1, "Work email is required")
    .email("Invalid email address")
    .refine((email) => email.toLowerCase().trim(), {
      message: "Email must be valid",
    }),
});

type WorkEmailFormData = z.infer<typeof workEmailSchema>;

interface WorkEmailStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function WorkEmailStep({ onValidationChange }: WorkEmailStepProps) {
  const { formData, updateField } = useAssociateStore();

  const form = useForm<WorkEmailFormData>({
    resolver: zodResolver(workEmailSchema),
    defaultValues: {
      workEmail: formData.workEmail || "",
    },
    mode: "onChange",
  });

  const { watch, formState } = form;
  const workEmail = watch("workEmail");

  // Update validation state
  useEffect(() => {
    onValidationChange(formState.isValid);
  }, [formState.isValid, onValidationChange]);

  // Update store when value changes
  useEffect(() => {
    if (workEmail) {
      updateField("workEmail", workEmail);
    }
  }, [workEmail, updateField]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Work Email Address
        </h2>
        <p className="text-gray-600">
          Provide your professional email address where we can contact you
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="workEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.name@company.com"
                    {...field}
                    className="text-lg"
                    autoFocus
                  />
                </FormControl>
                <FormDescription>
                  This should be different from your personal email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Visual Feedback */}
      {formState.isValid && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Email looks good!</span>
        </div>
      )}
    </div>
  );
}
