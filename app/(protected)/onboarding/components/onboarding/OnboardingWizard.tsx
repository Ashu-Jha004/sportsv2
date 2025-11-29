// src/features/onboarding/components/OnboardingWizard.tsx
"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useOnboardingStore } from "@/stores/onboarding/store";
import type { OnboardingRequestDTO } from "@/lib/validations/onboarding/onboarding.dto";
import StepProfile from "./steps/StepProfile";
import StepSports from "./steps/StepSports";
import StepLocation from "./steps/StepLocation";

async function submitOnboarding(payload: OnboardingRequestDTO) {
  const res = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to submit onboarding.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return null;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const {
    currentStep,
    profile,
    sports,
    location,
    nextStep,
    prevStep,
    locationCompleted,
    setSubmitting,
    stepValidations,
  } = useOnboardingStore();

  const [mounted, setMounted] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const validSteps = Object.values(stepValidations).filter(
        (v) => v.isValid
      ).length;
      setCompletionPercentage((validSteps / 3) * 100);
    }
  }, [stepValidations, mounted]);
  const mutation = useMutation({
    mutationFn: submitOnboarding,
    onMutate: () => {
      setSubmitting(true);
    },
    onSuccess: () => {
      setSubmitting(false);
      router.push(`/profile/${profile?.username || ""}`);
    },
    onError: (error: unknown) => {
      setSubmitting(false);
      const msg =
        error instanceof Error
          ? error.message
          : "Unexpected error while completing onboarding.";
      setLocalError(msg);
    },
  });

  const canProceed = useMemo(() => {
    return stepValidations[currentStep]?.isValid && !mutation.isPending;
  }, [stepValidations, currentStep, mutation.isPending]);

  const [localError, setLocalError] = useState<string | null>(null);

  const canGoBack = currentStep > 1;
  const isLastStep = currentStep === 3;

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <StepProfile />;
      case 2:
        return <StepSports />;
      case 3:
        return <StepLocation />;
      default:
        return <StepProfile />;
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    setLocalError(null);

    // Check if current step is valid before proceeding
    if (!canProceed) {
      const errors = stepValidations[currentStep].errors;
      if (errors.length > 0) {
        setLocalError(errors[0]); // Show first validation error
      } else {
        setLocalError("Please complete all required fields before continuing.");
      }
      return;
    }

    nextStep();
  }, [canProceed, nextStep, currentStep, stepValidations]);

  const handleFinalSubmit = useCallback(() => {
    if (mutation.isPending) return;

    setLocalError(null);

    if (!locationCompleted) {
      setLocalError(
        "Please complete your location information before finishing."
      );
      return;
    }

    const payload: OnboardingRequestDTO = {
      profile: profile as any,
      sports: sports as any,
      location: location as any,
    };

    mutation.mutate(payload);
  }, [locationCompleted, mutation, profile, sports, location]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col gap-6 rounded-2xl border bg-linear-to-b from-slate-50 via-white to-slate-100 p-6 shadow-lg">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Athlete Onboarding
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Set up your athlete profile to unlock personalized performance
            insights.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Step {currentStep} of 3
          </p>
          <div className="flex w-40 gap-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          {/* Completion percentage */}
          <p className="text-xs text-slate-400">
            {Math.round(completionPercentage)}% complete
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur">
          {stepContent}
        </div>
      </main>

      <footer className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prevStep}
            disabled={!canGoBack || mutation.isPending}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
        </div>

        <div className="flex gap-2">
          {!isLastStep && (
            <button
              type="button"
              onClick={handleNext}
              disabled={mutation.isPending || !canProceed}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          )}

          {isLastStep && (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={mutation.isPending || !locationCompleted}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "Submitting..." : "Finish"}
            </button>
          )}
        </div>
      </footer>

      {(localError || mutation.isError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">
            {localError ||
              (mutation.error instanceof Error
                ? mutation.error.message
                : "Something went wrong. Please try again.")}
          </p>
        </div>
      )}
    </div>
  );
}
