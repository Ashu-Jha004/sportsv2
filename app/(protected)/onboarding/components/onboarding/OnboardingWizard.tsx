// src/features/onboarding/components/OnboardingWizard.tsx
"use client";

import { useMemo } from "react";
import { useRouter, redirect } from "next/navigation";
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
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to submit onboarding.");
  }
  if (res.ok) {
    redirect("/profile");
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
  } = useOnboardingStore();

  const mutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: () => {
      router.push("/profile");
    },
  });

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

  const handleFinalSubmit = () => {
    if (mutation.isPending) return;

    // Guard: ensure location was saved at least once
    if (!locationCompleted) {
      // Optional: show a nicer UI message instead of alert
      alert("Please save your location before finishing onboarding.");
      return;
    }

    const payload: OnboardingRequestDTO = {
      profile: profile as any,
      sports: sports as any,
      location: location as any,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Athlete onboarding</h1>
        <p className="text-sm text-muted-foreground">Step {currentStep} of 3</p>
      </header>

      <main>{stepContent}</main>

      <footer className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={!canGoBack}
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
        >
          Back
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={mutation.isPending || !locationCompleted}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {mutation.isPending ? "Submitting..." : "Finish"}
          </button>
        ) : (
          <button
            type="button"
            onClick={nextStep}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Next
          </button>
        )}
      </footer>

      {mutation.isError && (
        <p className="text-sm text-red-600">
          {(mutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
