// src/features/onboarding/store.ts
"use client";

import { create } from "zustand";
import type {
  OnboardingProfileDTO,
  OnboardingSportsDTO,
  OnboardingLocationDTO,
} from "@/lib/validations/onboarding/onboarding.dto";

export type OnboardingStep = 1 | 2 | 3;

type OnboardingState = {
  currentStep: OnboardingStep;
  maxStep: OnboardingStep;
  profile: Partial<OnboardingProfileDTO>;
  sports: Partial<OnboardingSportsDTO>;
  location: Partial<OnboardingLocationDTO>;
  locationCompleted: boolean;
};

type OnboardingActions = {
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateProfile: (data: Partial<OnboardingProfileDTO>) => void;
  updateSports: (data: Partial<OnboardingSportsDTO>) => void;
  updateLocation: (data: Partial<OnboardingLocationDTO>) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>(
  (set, get) => ({
    currentStep: 1,
    maxStep: 3,
    profile: {},
    sports: {},
    location: {},
    locationCompleted: false,

    goToStep: (step) => {
      const { maxStep } = get();
      const safeStep = Math.min(Math.max(step, 1), maxStep);
      set({ currentStep: safeStep as OnboardingStep });
    },

    nextStep: () => {
      const { currentStep, maxStep } = get();
      if (currentStep < maxStep) {
        set({ currentStep: (currentStep + 1) as OnboardingStep });
      }
    },

    prevStep: () => {
      const { currentStep } = get();
      if (currentStep > 1) {
        set({ currentStep: (currentStep - 1) as OnboardingStep });
      }
    },

    updateProfile: (data) =>
      set((state) => ({ profile: { ...state.profile, ...data } })),

    updateSports: (data) =>
      set((state) => ({ sports: { ...state.sports, ...data } })),

    updateLocation: (data) =>
      set((state) => ({
        location: { ...state.location, ...data },
        locationCompleted: true,
      })),

    reset: () =>
      set({
        currentStep: 1,
        profile: {},
        sports: {},
        location: {},
        locationCompleted: false,
      }),
  }),
);
