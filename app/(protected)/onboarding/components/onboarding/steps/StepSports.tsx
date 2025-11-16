// src/features/onboarding/components/steps/StepSports.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OnboardingSportsSchema,
  type OnboardingSportsDTO,
} from "@/lib/validations/onboarding/onboarding.dto";
import { useOnboardingStore } from "@/stores/onboarding/store";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type SportsFormValues = OnboardingSportsDTO;

const SPORT_OPTIONS: {
  value: SportsFormValues["primarySport"];
  label: string;
}[] = [
  { value: "FOOTBALL", label: "Football" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "CRICKET", label: "Cricket" },
  { value: "TENNIS", label: "Tennis" },
  { value: "RUNNING", label: "Running" },
  { value: "SWIMMING", label: "Swimming" },
  { value: "OTHER", label: "Other" },
];

export default function StepSports() {
  const { sports, updateSports, nextStep, prevStep } = useOnboardingStore();

  const form = useForm<SportsFormValues>({
    resolver: zodResolver(OnboardingSportsSchema),
    defaultValues: {
      primarySport: (sports.primarySport as any) ?? "FOOTBALL",
      secondarySport: (sports.secondarySport as any) ?? undefined,
    },
    mode: "onChange",
  });

  const onSubmit = (values: SportsFormValues) => {
    updateSports(values);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="primarySport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary sport</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORT_OPTIONS.map((sport) => (
                      <SelectItem key={sport.value} value={sport.value}>
                        {sport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secondarySport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary sport (optional)</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(val) => {
                    if (!val) {
                      field.onChange(undefined);
                    } else {
                      field.onChange(val);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a secondary sport (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No string">None</SelectItem>
                    {SPORT_OPTIONS.map((sport) => (
                      <SelectItem key={sport.value} value={sport.value}>
                        {sport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit" disabled={!form.formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
