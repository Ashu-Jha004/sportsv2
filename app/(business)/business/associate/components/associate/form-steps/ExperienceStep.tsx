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
import { Slider } from "@/components/ui/slider";

const experienceSchema = z.object({
  yearsOfExperience: z
    .number({
      error: "Must be a valid number",
    })
    .int("Must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(50, "Experience seems too high, please verify")
    .nonoptional({ error: "this field is required!" }),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

interface ExperienceStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function ExperienceStep({ onValidationChange }: ExperienceStepProps) {
  const { formData, updateField } = useAssociateStore();

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      yearsOfExperience: formData.yearsOfExperience || 0,
    },
    mode: "onChange",
  });

  const { watch, formState, setValue } = form;
  const yearsOfExperience = watch("yearsOfExperience");

  useEffect(() => {
    onValidationChange(formState.isValid && yearsOfExperience > 0);
  }, [formState.isValid, yearsOfExperience, onValidationChange]);

  useEffect(() => {
    if (yearsOfExperience !== null) {
      updateField("yearsOfExperience", yearsOfExperience);
    }
  }, [yearsOfExperience, updateField]);

  const getExperienceLevel = (years: number) => {
    if (years === 0)
      return { label: "Select experience", color: "text-gray-500" };
    if (years < 2) return { label: "Beginner", color: "text-blue-600" };
    if (years < 5) return { label: "Intermediate", color: "text-green-600" };
    if (years < 10) return { label: "Experienced", color: "text-orange-600" };
    return { label: "Expert", color: "text-purple-600" };
  };

  const experienceLevel = getExperienceLevel(yearsOfExperience || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Years of Experience
        </h2>
        <p className="text-gray-600">
          How many years of experience do you have in coaching, training, or
          mentoring athletes?
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience *</FormLabel>
                <div className="space-y-6">
                  {/* Number Input */}
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        field.onChange(value);
                      }}
                      className="text-lg w-32"
                      autoFocus
                    />
                  </FormControl>

                  {/* Slider */}
                  <div className="pt-2">
                    <Slider
                      min={0}
                      max={50}
                      step={1}
                      value={[field.value || 0]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0 years</span>
                      <span>25 years</span>
                      <span>50 years</span>
                    </div>
                  </div>

                  {/* Experience Level Badge */}
                  {yearsOfExperience > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div
                        className="w-3 h-3 rounded-full bg-current"
                        style={{
                          color: experienceLevel.color.replace("text-", ""),
                        }}
                      ></div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Experience Level
                        </p>
                        <p className={`font-semibold ${experienceLevel.color}`}>
                          {experienceLevel.label}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <FormDescription>
                  Include professional, semi-professional, and volunteer
                  experience
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Visual Feedback */}
      {formState.isValid && yearsOfExperience > 0 && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{yearsOfExperience} years of experience recorded!</span>
        </div>
      )}
    </div>
  );
}
