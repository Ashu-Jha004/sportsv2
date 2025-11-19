import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AssociateFormData {
  workEmail: string;
  coverLetter: string;
  primaryExpertise: string;
  secondaryExpertise: string[];
  yearsOfExperience: number | null;
  workCountry: string;
  workState: string;
  workCity: string;
  workLatitude: number | null;
  workLongitude: number | null;
  resumeUrl: string;
  resumePublicId: string;
  resumeFileName: string;
}

interface AssociateStore {
  // Form data (client state only - not persisted)
  formData: Partial<AssociateFormData>;

  // UI states
  currentStep: number;
  isDetectingLocation: boolean;
  locationError: string | null;

  // Preview state
  resumePreview: File | null;

  // Actions
  setFormData: (data: Partial<AssociateFormData>) => void;
  updateField: (field: keyof AssociateFormData, value: any) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setIsDetectingLocation: (value: boolean) => void;
  setLocationError: (error: string | null) => void;
  setResumePreview: (file: File | null) => void;
  resetForm: () => void;
}

const initialFormData: Partial<AssociateFormData> = {
  workEmail: "",
  coverLetter: "",
  primaryExpertise: "",
  secondaryExpertise: [],
  yearsOfExperience: null,
  workCountry: "",
  workState: "",
  workCity: "",
  workLatitude: null,
  workLongitude: null,
  resumeUrl: "",
  resumePublicId: "",
  resumeFileName: "",
};

export const useAssociateStore = create<AssociateStore>()(
  devtools(
    (set) => ({
      // Initial state
      formData: initialFormData,
      currentStep: 0,
      isDetectingLocation: false,
      locationError: null,
      resumePreview: null,

      // Actions
      setFormData: (data) =>
        set(
          (state) => ({
            formData: { ...state.formData, ...data },
          }),
          false,
          "setFormData"
        ),

      updateField: (field, value) =>
        set(
          (state) => ({
            formData: { ...state.formData, [field]: value },
          }),
          false,
          `updateField/${field}`
        ),

      setCurrentStep: (step) =>
        set({ currentStep: step }, false, "setCurrentStep"),

      nextStep: () =>
        set(
          (state) => ({ currentStep: state.currentStep + 1 }),
          false,
          "nextStep"
        ),

      prevStep: () =>
        set(
          (state) => ({
            currentStep: Math.max(0, state.currentStep - 1),
          }),
          false,
          "prevStep"
        ),

      setIsDetectingLocation: (value) =>
        set({ isDetectingLocation: value }, false, "setIsDetectingLocation"),

      setLocationError: (error) =>
        set({ locationError: error }, false, "setLocationError"),

      setResumePreview: (file) =>
        set({ resumePreview: file }, false, "setResumePreview"),

      resetForm: () =>
        set(
          {
            formData: initialFormData,
            currentStep: 0,
            isDetectingLocation: false,
            locationError: null,
            resumePreview: null,
          },
          false,
          "resetForm"
        ),
    }),
    { name: "associate-store" }
  )
);
