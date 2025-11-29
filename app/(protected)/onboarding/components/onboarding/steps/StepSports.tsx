// src/features/onboarding/components/steps/StepSports.tsx
"use client";

import { useMemo, useCallback } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Dribbble,
  Bike,
  Activity,
  Waves,
  Zap,
  Target,
} from "lucide-react";

type SportsFormValues = OnboardingSportsDTO;

// Sport icons mapping
const SPORT_ICONS = {
  FOOTBALL: Trophy,
  BASKETBALL: Dribbble,
  CRICKET: Target,
  TENNIS: Activity,
  RUNNING: Zap,
  SWIMMING: Waves,
  OTHER: Bike,
};

const SPORT_OPTIONS: {
  value: SportsFormValues["primarySport"];
  label: string;
  description: string;
  icon: keyof typeof SPORT_ICONS;
}[] = [
  {
    value: "FOOTBALL",
    label: "Football",
    description: "Soccer, the beautiful game",
    icon: "FOOTBALL",
  },
  {
    value: "BASKETBALL",
    label: "Basketball",
    description: "Court sports and hoops",
    icon: "BASKETBALL",
  },
  {
    value: "CRICKET",
    label: "Cricket",
    description: "Bat and ball excellence",
    icon: "CRICKET",
  },
  {
    value: "TENNIS",
    label: "Tennis",
    description: "Racket sports mastery",
    icon: "TENNIS",
  },
  {
    value: "RUNNING",
    label: "Running",
    description: "Track, marathon, and endurance",
    icon: "RUNNING",
  },
  {
    value: "SWIMMING",
    label: "Swimming",
    description: "Aquatic performance",
    icon: "SWIMMING",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Alternative sports and activities",
    icon: "OTHER",
  },
];

export default function StepSports() {
  const { sports, updateSports } = useOnboardingStore();

  const form = useForm<SportsFormValues>({
    resolver: zodResolver(OnboardingSportsSchema),
    defaultValues: {
      primarySport: sports.primarySport ?? "FOOTBALL",
      secondarySport: sports.secondarySport ?? undefined,
    },
    mode: "onChange",
  });

  // ADDED: Handle field updates to store
  const handleFieldUpdate = useCallback(
    (field: keyof SportsFormValues, value: any) => {
      updateSports({ [field]: value });
    },
    [updateSports]
  );

  // REMOVED: The problematic useEffect with form.watch()

  const primarySportValue = form.watch("primarySport");

  // Filter secondary options (exclude primary)
  const secondaryOptions = useMemo(() => {
    return SPORT_OPTIONS.filter((sport) => sport.value !== primarySportValue);
  }, [primarySportValue]);

  const getSportIcon = (sportValue: string | undefined) => {
    const sport = SPORT_OPTIONS.find((s) => s.value === sportValue);
    if (!sport) return null;
    const Icon = SPORT_ICONS[sport.icon];
    return Icon;
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Choose Your Sports
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Select your primary sport and optionally a secondary one to
            personalize your training insights.
          </p>
        </div>

        {/* Primary Sport */}
        <FormField
          control={form.control}
          name="primarySport"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-slate-900">
                Primary Sport
              </FormLabel>
              <FormDescription className="text-sm text-slate-600">
                This is your main athletic focus and will drive your performance
                metrics.
              </FormDescription>
              <FormControl>
                <div className="mt-3">
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      handleFieldUpdate("primarySport", val);
                    }}
                  >
                    <SelectTrigger className="h-auto rounded-xl border-2 border-slate-300 bg-white p-4 transition hover:border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select your primary sport">
                        {field.value && (
                          <div className="flex items-center gap-3">
                            {(() => {
                              const Icon = getSportIcon(field.value);
                              return Icon ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-emerald-100 to-teal-100">
                                  <Icon className="h-5 w-5 text-emerald-600" />
                                </div>
                              ) : null;
                            })()}
                            <div className="text-left">
                              <p className="font-semibold text-slate-900">
                                {
                                  SPORT_OPTIONS.find(
                                    (s) => s.value === field.value
                                  )?.label
                                }
                              </p>
                              <p className="text-xs text-slate-500">
                                {
                                  SPORT_OPTIONS.find(
                                    (s) => s.value === field.value
                                  )?.description
                                }
                              </p>
                            </div>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {SPORT_OPTIONS.map((sport) => {
                        const Icon = SPORT_ICONS[sport.icon];
                        return (
                          <SelectItem
                            key={sport.value}
                            value={sport.value}
                            className="cursor-pointer rounded-lg py-3 transition hover:bg-emerald-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-emerald-100 to-teal-100">
                                <Icon className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {sport.label}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {sport.description}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Secondary Sport */}
        <FormField
          control={form.control}
          name="secondarySport"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-slate-900">
                Secondary Sport
                <span className="ml-2 text-xs font-normal text-slate-500">
                  (Optional)
                </span>
              </FormLabel>
              <FormDescription className="text-sm text-slate-600">
                Add a secondary sport for cross-training insights and balanced
                performance tracking.
              </FormDescription>
              <FormControl>
                <div className="mt-3">
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => {
                      if (val === "" || val === "NONE") {
                        field.onChange(undefined);
                        handleFieldUpdate("secondarySport", undefined);
                      } else {
                        field.onChange(val);
                        handleFieldUpdate("secondarySport", val);
                      }
                    }}
                  >
                    <SelectTrigger className="h-auto rounded-xl border-2 border-slate-300 bg-white p-4 transition hover:border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select a secondary sport (optional)">
                        {field.value ? (
                          <div className="flex items-center gap-3">
                            {(() => {
                              const Icon = getSportIcon(field.value);
                              return Icon ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-slate-100 to-slate-200">
                                  <Icon className="h-5 w-5 text-slate-600" />
                                </div>
                              ) : null;
                            })()}
                            <div className="text-left">
                              <p className="font-semibold text-slate-900">
                                {
                                  SPORT_OPTIONS.find(
                                    (s) => s.value === field.value
                                  )?.label
                                }
                              </p>
                              <p className="text-xs text-slate-500">
                                {
                                  SPORT_OPTIONS.find(
                                    (s) => s.value === field.value
                                  )?.description
                                }
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">
                            No secondary sport selected
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem
                        value="NONE"
                        className="cursor-pointer rounded-lg py-3 transition hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <span className="text-lg">—</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">None</p>
                            <p className="text-xs text-slate-500">
                              Focus on primary sport only
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      {secondaryOptions.map((sport) => {
                        const Icon = SPORT_ICONS[sport.icon];
                        return (
                          <SelectItem
                            key={sport.value}
                            value={sport.value}
                            className="cursor-pointer rounded-lg py-3 transition hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-slate-100 to-slate-200">
                                <Icon className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {sport.label}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {sport.description}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Info Card */}
        <div className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 p-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                Why choose sports?
              </h3>
              <p className="mt-1 text-sm text-slate-700">
                Your sport selection helps us tailor performance metrics,
                training recommendations, and competitive benchmarks specific to
                your athletic discipline.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
