// src/features/onboarding/store.ts
"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { type ZodSchema, type ZodError } from "zod";
// Remove "type" from these imports - we need runtime values
import {
  type OnboardingProfileDTO,
  type OnboardingSportsDTO,
  type OnboardingLocationDTO,
  OnboardingProfileSchema,
  OnboardingSportsSchema,
  OnboardingLocationSchema,
} from "@/lib/validations/onboarding/onboarding.dto";

export type OnboardingStep = 1 | 2 | 3;

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

type OnboardingState = {
  currentStep: OnboardingStep;
  profile: Partial<OnboardingProfileDTO>;
  sports: Partial<OnboardingSportsDTO>;
  location: Partial<OnboardingLocationDTO>;
  locationCompleted: boolean;
  stepValidations: Record<OnboardingStep, ValidationResult>;
  isDirty: boolean;
  isSubmitting: boolean;
};

type OnboardingActions = {
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateProfile: (data: Partial<OnboardingProfileDTO>) => void;
  updateSports: (data: Partial<OnboardingSportsDTO>) => void;
  updateLocation: (data: Partial<OnboardingLocationDTO>) => void;
  reset: () => void;
  setSubmitting: (submitting: boolean) => void;
  validateStep: (step: OnboardingStep) => ValidationResult;
  canProceed: () => boolean;
  getCompletionPercentage: () => number;
};

const validateWithSchema = <T>(
  schema: ZodSchema<T>,
  data: Partial<T>
): ValidationResult => {
  const result = schema.safeParse(data as T);
  if (result.success) {
    return { isValid: true, errors: [] };
  }
  // ZodError has 'issues' not 'errors'
  return {
    isValid: false,
    errors: result.error.issues.map((issue) => issue.message).slice(0, 3),
  };
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  devtools(
    persist(
      (set, get) => ({
        currentStep: 1,
        profile: {},
        sports: {},
        location: {},
        locationCompleted: false,
        stepValidations: {
          1: { isValid: false, errors: [] },
          2: { isValid: false, errors: [] },
          3: { isValid: false, errors: [] },
        },
        isDirty: false,
        isSubmitting: false,

        goToStep: (step) => {
          const safeStep = Math.min(Math.max(step, 1), 3) as OnboardingStep;
          set({ currentStep: safeStep });
        },

        nextStep: () => {
          const state = get();
          if (
            state.currentStep < 3 &&
            state.stepValidations[state.currentStep].isValid
          ) {
            set({ currentStep: (state.currentStep + 1) as OnboardingStep });
          }
        },

        prevStep: () => {
          const state = get();
          if (state.currentStep > 1) {
            set({ currentStep: (state.currentStep - 1) as OnboardingStep });
          }
        },

        updateProfile: (data) =>
          set((state) => {
            const updatedProfile = { ...state.profile, ...data };
            const validation = validateWithSchema(
              OnboardingProfileSchema,
              updatedProfile
            );

            return {
              profile: updatedProfile,
              stepValidations: {
                ...state.stepValidations,
                1: validation,
              },
              isDirty: true,
            };
          }),

        updateSports: (data) =>
          set((state) => {
            const updatedSports = { ...state.sports, ...data };
            const validation = validateWithSchema(
              OnboardingSportsSchema,
              updatedSports
            );

            return {
              sports: updatedSports,
              stepValidations: {
                ...state.stepValidations,
                2: validation,
              },
              isDirty: true,
            };
          }),

        updateLocation: (data) =>
          set((state) => {
            const updatedLocation = { ...state.location, ...data };
            const validation = validateWithSchema(
              OnboardingLocationSchema,
              updatedLocation
            );

            return {
              location: updatedLocation,
              locationCompleted: validation.isValid,
              stepValidations: {
                ...state.stepValidations,
                3: validation,
              },
              isDirty: true,
            };
          }),

        setSubmitting: (submitting) => set({ isSubmitting: submitting }),

        validateStep: (step) => {
          const state = get();
          const data =
            step === 1
              ? state.profile
              : step === 2
              ? state.sports
              : state.location;

          let schema: ZodSchema<any>;
          switch (step) {
            case 1:
              schema = OnboardingProfileSchema;
              break;
            case 2:
              schema = OnboardingSportsSchema;
              break;
            case 3:
            default:
              schema = OnboardingLocationSchema;
              break;
          }

          return validateWithSchema(schema, data as any);
        },

        canProceed: () => {
          const state = get();
          return (
            state.stepValidations[state.currentStep].isValid &&
            !state.isSubmitting
          );
        },

        getCompletionPercentage: () => {
          const state = get();
          const validSteps = Object.values(state.stepValidations).filter(
            (v) => v.isValid
          ).length;
          return (validSteps / 3) * 100;
        },

        reset: () =>
          set({
            currentStep: 1,
            profile: {},
            sports: {},
            location: {},
            locationCompleted: false,
            stepValidations: {
              1: { isValid: false, errors: [] },
              2: { isValid: false, errors: [] },
              3: { isValid: false, errors: [] },
            },
            isDirty: false,
            isSubmitting: false,
          }),
      }),
      {
        name: "onboarding-storage",
        // Persist everything except isSubmitting (transient)
        partialize: (state) => ({
          currentStep: state.currentStep,
          profile: state.profile,
          sports: state.sports,
          location: state.location,
          locationCompleted: state.locationCompleted,
          stepValidations: state.stepValidations,
          isDirty: state.isDirty,
        }),
        // Correct property name
        skipHydration: false,
      }
    ),
    { name: "OnboardingStore" }
  )
);
