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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const SPORTS = [
  "FOOTBALL",
  "BASKETBALL",
  "CRICKET",
  "TENNIS",
  "RUNNING",
  "SWIMMING",
  "BADMINTON",
  "VOLLEYBALL",
  "HOCKEY",
  "ATHLETICS",
  "WRESTLING",
  "BOXING",
  "MARTIAL_ARTS",
  "CYCLING",
  "GOLF",
  "OTHER",
] as const;

const SportEnum = z.enum(SPORTS);

const sportsExpertiseSchema = z
  .object({
    primaryExpertise: SportEnum,
    secondaryExpertise: z.array(SportEnum).max(5, "Maximum 5 sports allowed"),
  })
  .refine(
    (data) => {
      // Primary sport cannot be in secondary sports
      return !data.secondaryExpertise.includes(data.primaryExpertise);
    },
    {
      message: "Primary sport cannot be selected as secondary sport",
      path: ["secondaryExpertise"],
    }
  );

type SportsExpertiseFormData = z.infer<typeof sportsExpertiseSchema>;

interface SportsExpertiseStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function SportsExpertiseStep({
  onValidationChange,
}: SportsExpertiseStepProps) {
  const { formData, updateField } = useAssociateStore();

  const form = useForm<SportsExpertiseFormData>({
    resolver: zodResolver(sportsExpertiseSchema),
    defaultValues: {
      primaryExpertise: (formData.primaryExpertise as any) || undefined,
      secondaryExpertise: (formData.secondaryExpertise as any) || [],
    },
    mode: "onChange",
  });

  const { watch, formState, setValue } = form;
  const primaryExpertise = watch("primaryExpertise");
  const secondaryExpertise = watch("secondaryExpertise");

  useEffect(() => {
    onValidationChange(formState.isValid);
  }, [formState.isValid, onValidationChange]);

  useEffect(() => {
    if (primaryExpertise) {
      updateField("primaryExpertise", primaryExpertise);
    }
  }, [primaryExpertise, updateField]);

  useEffect(() => {
    updateField("secondaryExpertise", secondaryExpertise);
  }, [secondaryExpertise, updateField]);

  const handleAddSecondarySport = (sport: string) => {
    if (sport === primaryExpertise) {
      form.setError("secondaryExpertise", {
        message: "Cannot select primary sport as secondary",
      });
      return;
    }

    if (!secondaryExpertise.includes(sport as any)) {
      const updated = [...secondaryExpertise, sport as any];
      setValue("secondaryExpertise", updated);
      form.clearErrors("secondaryExpertise");
    }
  };

  const handleRemoveSecondarySport = (sport: string) => {
    const updated = secondaryExpertise.filter((s) => s !== sport);
    setValue("secondaryExpertise", updated);
  };

  const formatSportName = (sport: string) => {
    return sport
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const availableSecondary = SPORTS.filter(
    (sport) => sport !== primaryExpertise && !secondaryExpertise.includes(sport)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Sports Expertise
        </h2>
        <p className="text-gray-600">
          Select your primary sport expertise and any secondary sports you're
          knowledgeable about
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          {/* Primary Expertise */}
          <FormField
            control={form.control}
            name="primaryExpertise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Sport Expertise *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SPORTS.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {formatSportName(sport)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The sport you have the most expertise in
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Secondary Expertise */}
          <FormField
            control={form.control}
            name="secondaryExpertise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Sports (Optional)</FormLabel>
                <div className="space-y-4">
                  {/* Selected Sports */}
                  {secondaryExpertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                      {secondaryExpertise.map((sport) => (
                        <Badge
                          key={sport}
                          variant="secondary"
                          className="text-sm px-3 py-1 flex items-center gap-2"
                        >
                          {formatSportName(sport)}
                          <button
                            title="button"
                            type="button"
                            onClick={() => handleRemoveSecondarySport(sport)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Secondary Sport */}
                  {availableSecondary.length > 0 &&
                    secondaryExpertise.length < 5 && (
                      <Select onValueChange={handleAddSecondarySport}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add a secondary sport" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSecondary.map((sport) => (
                            <SelectItem key={sport} value={sport}>
                              {formatSportName(sport)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                  {secondaryExpertise.length >= 5 && (
                    <p className="text-sm text-amber-600">
                      Maximum 5 secondary sports reached
                    </p>
                  )}
                </div>
                <FormDescription>
                  Select up to 5 sports you have knowledge about (
                  {secondaryExpertise.length}/5)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Visual Feedback */}
      {formState.isValid && primaryExpertise && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Sports expertise configured!</span>
        </div>
      )}
    </div>
  );
}
