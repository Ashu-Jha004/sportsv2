// stores/use-team-application-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TeamApplicationFormData } from "@/app/(protected)/team/lib/validations/team";

interface TeamApplicationStore {
  // Form data
  formData: Partial<TeamApplicationFormData>;
  currentStep: number;

  // Actions
  setFormData: (data: Partial<TeamApplicationFormData>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;

  // Metadata
  lastSavedAt: number | null;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const TOTAL_STEPS = 3;

export const useTeamApplicationStore = create<TeamApplicationStore>()(
  persist(
    (set, get) => ({
      formData: {},
      currentStep: 1,
      lastSavedAt: null,
      isSubmitting: false,

      setFormData: (data) => {
        console.log("[TEAM_APP_STORE] Updating form data:", data);
        set((state) => ({
          formData: { ...state.formData, ...data },
          lastSavedAt: Date.now(),
        }));
      },

      setStep: (step) => {
        if (step >= 1 && step <= TOTAL_STEPS) {
          console.log("[TEAM_APP_STORE] Setting step:", step);
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < TOTAL_STEPS) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      resetForm: () => {
        console.log("[TEAM_APP_STORE] Resetting form");
        set({
          formData: {},
          currentStep: 1,
          lastSavedAt: null,
          isSubmitting: false,
        });
      },

      setIsSubmitting: (value) => set({ isSubmitting: value }),
    }),
    {
      name: "team-application-storage",
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
