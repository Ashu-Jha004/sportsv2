// app/(business)/business/features/guide/onboarding/components/guide/onboarding/GuideOnboardingWizard.tsx
"use client";

import { useCallback, useMemo, useTransition } from "react";
import {
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  guideOnboardingSchema,
  type GuideOnboardingInput,
  SPORT_VALUES,
  type SportValue,
} from "@/lib/validations/guideOnboarding/guide-onboarding-schema";
import { useGuideOnboardingStore } from "@/stores/guide/onboarding/guide-onboarding-store";
import { createGuideApplication } from "../../../actions";
import { mapGuideApplicationResultToForm } from "@/lib/guide/forms/map-server-action-result";
import { GuideResumeUpload } from "./upload/GuideResumeupload";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const STEP_TITLES = [
  "Contact details",
  "Resume upload",
  "Sports expertise",
  "Experience",
  "Location",
  "Review & submit",
] as const;

const STEP_COUNT = STEP_TITLES.length;

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

function getFieldsForStep(step: StepIndex): any[] {
  switch (step) {
    case 0:
      return ["guideEmail"];
    case 1:
      return ["documents"];
    case 2:
      return ["primarySport", "secondarySports"];
    case 3:
      return ["experienceYears"];
    case 4:
      return ["country", "state", "city", "latitude", "longitude"];
    case 5:
      return [];
    default:
      return [];
  }
}

export default function GuideOnboardingWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ✅ Use stable selectors: no object literals that change on every render
  const currentStep = useGuideOnboardingStore((state) => state.currentStep);
  const storedData = useGuideOnboardingStore((state) => state.data);
  const nextStep = useGuideOnboardingStore((state) => state.nextStep);
  const prevStep = useGuideOnboardingStore((state) => state.prevStep);
  const updateData = useGuideOnboardingStore((state) => state.updateData);
  const setSubmitting = useGuideOnboardingStore((state) => state.setSubmitting);
  const isSubmitting = useGuideOnboardingStore((state) => state.isSubmitting);

  const defaultValues = useMemo<any>(
    () => ({
      guideEmail: storedData.guideEmail ?? "",
      documents: storedData.documents ?? [],
      primarySport: (storedData.primarySport as SportValue) ?? "FOOTBALL",
      secondarySports: (storedData.secondarySports as SportValue[]) ?? [],
      experienceYears: storedData.experienceYears ?? undefined,
      country: storedData.country ?? "",
      state: storedData.state ?? "",
      city: storedData.city ?? "",
      latitude: storedData.latitude ?? 0,
      longitude: storedData.longitude ?? 0,
      acceptTerms: storedData.acceptTerms ?? false,
    }),
    [storedData]
  );

  const form = useForm<any>({
    resolver: zodResolver(guideOnboardingSchema),
    defaultValues,
    mode: "onChange",
  });

  const stepTitle = STEP_TITLES[currentStep];

  const goNext = useCallback(
    async (step: StepIndex) => {
      const fields = getFieldsForStep(step);
      if (fields.length > 0) {
        const isValid = await form.trigger(fields as any);
        if (!isValid) {
          console.warn(
            "[GuideOnboardingWizard] Validation failed for step",
            step
          );
          return;
        }
      }

      const values = form.getValues();
      updateData(values);
      nextStep();
    },
    [form, nextStep, updateData]
  );

  const goPrev = useCallback(() => {
    const values = form.getValues();
    updateData(values);
    prevStep();
  }, [form, prevStep, updateData]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("[GuideOnboardingWizard] Geolocation API not available");
      form.setError("latitude", {
        type: "manual",
        message: "Geolocation is not supported by this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.info("[GuideOnboardingWizard] Location fetched from browser", {
          latitude,
          longitude,
        });
        form.setValue("latitude", latitude, { shouldDirty: true });
        form.setValue("longitude", longitude, { shouldDirty: true });
        updateData({
          latitude,
          longitude,
        });
      },
      (err) => {
        console.error("[GuideOnboardingWizard] Failed to fetch location", {
          error: err,
        });
        form.setError("latitude", {
          type: "manual",
          message: "Unable to get your location. Please fill it manually.",
        });
      }
    );
  }, [form, updateData]);

  const onSubmit: SubmitHandler<any> = useCallback(
    async (values) => {
      setSubmitting(true);
      updateData(values);

      startTransition(async () => {
        const result = await createGuideApplication(values);
        const mapped = mapGuideApplicationResultToForm(result);

        if (!result.success) {
          Object.entries(mapped.fieldErrors).forEach(([name, message]) => {
            form.setError(name as any, {
              type: "server",
              message,
            });
          });

          if (mapped.formError) {
            console.warn(
              "[GuideOnboardingWizard] Submission error",
              mapped.formError
            );
          }

          setSubmitting(false);
          return;
        }

        console.info(
          "[GuideOnboardingWizard] Application submitted successfully",
          { guideId: result.guideId }
        );

        setSubmitting(false);
        router.replace("/guide/dashboard?status=pending_review");
      });
    },
    [form, router, setSubmitting, updateData, startTransition]
  );

  const isLastStep = currentStep === STEP_COUNT - 1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl border bg-white p-6 shadow-sm md:p-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Guide onboarding
          </h1>
          <p className="text-sm text-gray-500">
            Step {currentStep + 1} of {STEP_COUNT}: {stepTitle}
          </p>
        </div>
      </header>

      <Form {...form}>
        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {currentStep === 0 && <StepContact form={form} />}
          {currentStep === 1 && <StepResume form={form} />}
          {currentStep === 2 && <StepSports form={form} />}
          {currentStep === 3 && <StepExperience form={form} />}
          {currentStep === 4 && (
            <StepLocation
              form={form}
              onUseCurrentLocation={handleUseCurrentLocation}
            />
          )}
          {currentStep === 5 && <StepReview form={form} />}

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={currentStep === 0 || isSubmitting || isPending}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              {!isLastStep && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => goNext(currentStep as StepIndex)}
                  disabled={isSubmitting || isPending}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}

              {isLastStep && (
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || isPending}
                >
                  {isSubmitting || isPending
                    ? "Submitting..."
                    : "Submit application"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

// === Step components ===

type StepProps = {
  form: UseFormReturn<any>;
};

type LocationStepProps = StepProps & {
  onUseCurrentLocation: () => void;
};

function StepContact({ form }: StepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="guideEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Guide email address</FormLabel>
            <FormControl>
              <Input type="email" placeholder="you@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function StepResume({ form }: StepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="documents"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Resume (PDF)</FormLabel>
            <FormControl>
              <GuideResumeUpload
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function StepSports({ form }: StepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="primarySport"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary sport</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORT_VALUES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
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
        name="secondarySports"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secondary sports (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. CRICKET, TENNIS"
                value={field.value?.join(", ") ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const parts = raw
                    .split(",")
                    .map((p) => p.trim().toUpperCase())
                    .filter(Boolean) as SportValue[];
                  field.onChange(parts);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function StepExperience({ form }: StepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="experienceYears"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years of coaching/guide experience</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={60}
                placeholder="e.g. 3"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function StepLocation({ form, onUseCurrentLocation }: any) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / Province</FormLabel>
              <FormControl>
                <Input placeholder="State / Province" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onUseCurrentLocation}
          >
            <MapPin className="mr-1 h-4 w-4" />
            Use current
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepReview({ form }: StepProps) {
  const values = form.getValues();

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-gray-50 p-4 text-sm">
        <h2 className="mb-2 font-medium text-gray-900">Review your details</h2>
        <ul className="space-y-1 text-gray-700">
          <li>
            <span className="font-medium">Email:</span> {values.guideEmail}
          </li>
          <li>
            <span className="font-medium">Primary sport:</span>{" "}
            {values.primarySport}
          </li>
          <li>
            <span className="font-medium">Secondary sports:</span>{" "}
            {values.secondarySports?.join(", ") || "None"}
          </li>
          <li>
            <span className="font-medium">Experience:</span>{" "}
            {values.experienceYears != null
              ? `${values.experienceYears} years`
              : "Not provided"}
          </li>
          <li>
            <span className="font-medium">Location:</span> {values.city},{" "}
            {values.state}, {values.country}
          </li>
        </ul>
      </div>

      <FormField
        control={form.control}
        name="acceptTerms"
        render={({ field }) => (
          <FormItem className="flex items-start gap-2 rounded-md border bg-gray-50 p-3 text-xs">
            <FormControl>
              <input
                title="checkbox"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            </FormControl>
            <div>
              <p className="font-medium text-gray-900">Confirm and submit</p>
              <p className="text-gray-600">
                I confirm that the information provided is accurate and I agree
                to be contacted regarding guide opportunities.
              </p>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {Object.keys(form.formState.errors).length > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <p>
            Some fields still need attention. Please review before submitting.
          </p>
        </div>
      )}
    </div>
  );
}
