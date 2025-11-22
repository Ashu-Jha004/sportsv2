// lib/stores/guide-onboarding-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GuideOnboardingInput } from "@/lib/validations/guideOnboarding/guide-onboarding-schema";

export type GuideOnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;
// 0: email, 1: resume, 2: sports, 3: experience, 4: location, 5: review

interface GuideOnboardingState {
  currentStep: GuideOnboardingStep;
  maxStepVisited: GuideOnboardingStep;
  data: Partial<GuideOnboardingInput>;
  isSubmitting: boolean;

  setStep: (step: GuideOnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  markStepVisited: (step: GuideOnboardingStep) => void;
  updateData: (values: Partial<GuideOnboardingInput>) => void;
  setSubmitting: (value: boolean) => void;
  reset: () => void;
}

export const useGuideOnboardingStore = create<GuideOnboardingState>()(
  devtools(
    (set, get) => ({
      currentStep: 0,
      maxStepVisited: 0,
      data: {},
      isSubmitting: false,

      setStep: (step) => {
        const clamped = Math.min(Math.max(step, 0), 5) as GuideOnboardingStep;

        set((state) => ({
          currentStep: clamped,
          maxStepVisited:
            clamped > state.maxStepVisited ? clamped : state.maxStepVisited,
        }));
      },

      nextStep: () => {
        const { currentStep } = get();
        const next = Math.min(currentStep + 1, 5) as GuideOnboardingStep;

        set((state) => ({
          currentStep: next,
          maxStepVisited:
            next > state.maxStepVisited ? next : state.maxStepVisited,
        }));
      },

      prevStep: () => {
        const { currentStep } = get();
        const prev = Math.max(currentStep - 1, 0) as GuideOnboardingStep;
        set({ currentStep: prev });
      },

      markStepVisited: (step) => {
        set((state) => ({
          maxStepVisited:
            step > state.maxStepVisited ? step : state.maxStepVisited,
        }));
      },

      updateData: (values) => {
        set((state) => ({
          data: {
            ...state.data,
            ...values,
          },
        }));
      },

      setSubmitting: (value) => set({ isSubmitting: value }),

      reset: () =>
        set({
          currentStep: 0,
          maxStepVisited: 0,
          data: {},
          isSubmitting: false,
        }),
    }),
    { name: "guide-onboarding-store" }
  )
);
