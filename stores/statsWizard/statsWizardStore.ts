"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  BasicPhysicalMeasurements,
  CountermovementJumpTest,
  LoadedSquatJumpTest,
  DepthJumpTest,
  BallisticBenchPressTest,
  BallisticPushUpTest,
  PushUpTest,
  DeadliftVelocityTest,
  BarbellHipThrustTest,
  WeightedPullUpTest,
  BarbellRowTest,
  PlankHoldTest,
  PullUpsTest,
  TenMeterSprintTest,
  FourtyMeterDashTest,
  RepeatedSprintAbilityTest,
  Five05AgilityTest,
  TTestAgility,
  IllinoisAgilityTest,
  VisualReactionSpeedDrill,
  LongJumpTest,
  ReactiveAgilityTTest,
  StandingLongJumpTest,
  BeepTest,
  YoYoTest,
  CooperTest,
  PeakHeartRate,
  RestingHeartRate,
  RestingHeartRateVariability,
  LactateThreshold,
  AnaerobicCapacity,
  PostExerciseHeartRateRecovery,
  SitAndReachTest,
  ActiveStraightLegRaise,
  ShoulderRotation,
  KneeToWallTest,
  VO2Max,
  FlexibilityAssessment,
  AnthropometricData,
  InjuryRecord,
  StrengthAndPowerScores,
  SpeedAndAgilityScores,
  StaminaAndRecoveryScores,
  CompleteStatsPayload,
} from "@/types/stats/athlete-stats.types";

// ============================================
// WIZARD STEP CONFIGURATION
// ============================================

export const WIZARD_STEPS = [
  {
    id: 1,
    name: "Basic Measurements Instructions",
    type: "instruction" as const,
  },
  { id: 2, name: "Basic Physical Measurements", type: "form" as const },
  {
    id: 3,
    name: "Strength & Power Instructions",
    type: "instruction" as const,
  },
  { id: 4, name: "Strength & Power Assessment", type: "form" as const },
  { id: 5, name: "Speed & Agility Instructions", type: "instruction" as const },
  { id: 6, name: "Speed & Agility Assessment", type: "form" as const },
  {
    id: 7,
    name: "Stamina & Recovery Instructions",
    type: "instruction" as const,
  },
  { id: 8, name: "Stamina & Recovery Assessment", type: "form" as const },
  { id: 9, name: "Injury Records", type: "form" as const },
  { id: 10, name: "Review & Submit", type: "review" as const },
] as const;

export type WizardStepType = (typeof WIZARD_STEPS)[number]["type"];

// ============================================
// ATHLETE & GUIDE INFO
// ============================================

export type AthleteInfo = {
  id: string;
  clerkUserId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  primarySport: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null | "PREFER_NOT_TO_SAY";
  rank: string;
  class: string;
  city: string | null;
  state: string | null;
  country: string | null;
  dateOfBirth?: string | null;
  age?: number;
};

export type GuideInfo = {
  id: string;
  userId: string;
  name: string;
};

export type EvaluationMetadata = {
  requestId: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  evaluationDate: string; // ISO timestamp of when evaluation started
  otpVerified: boolean;
  otpVerifiedAt?: string;
};

// ============================================
// WIZARD STATE TYPE
// ============================================

// ============================================
// INITIAL STATE
// ============================================

const initialState: any = {
  athlete: null,
  guide: null,
  evaluation: null,

  currentStep: 1,
  completedSteps: [],
  visitedSteps: [1],

  basicMeasurements: null,

  strengthAndPower: {
    Countermovement_Jump: null,
    Loaded_Squat_Jump: null,
    Depth_Jump: null,
    Ballistic_Bench_Press: null,
    Push_Up: null,
    Ballistic_Push_Up: null,
    Deadlift_Velocity: null,
    Barbell_Hip_Thrust: null,
    Weighted_Pull_up: null,
    Barbell_Row: null,
    Plank_Hold: null,
    pullUps: null,
    Pushups: null,
    scores: null,
  },

  speedAndAgility: {
    Ten_Meter_Sprint: null,
    Fourty_Meter_Dash: null,
    Repeated_Sprint_Ability: null,
    Five_0_Five_Agility_Test: null,
    T_Test: null,
    Illinois_Agility_Test: null,
    Visual_Reaction_Speed_Drill: null,
    Long_Jump: null,
    Reactive_Agility_T_Test: null,
    Standing_Long_Jump: null,
    scores: null,
  },

  staminaAndRecovery: {
    Beep_Test: null,
    Yo_Yo_Test: null,
    Cooper_Test: null,
    Peak_Heart_Rate: null,
    Resting_Heart_Rate: null,
    Resting_Heart_Rate_Variability: null,
    Lactate_Threshold: null,
    Anaerobic_Capacity: null,
    Post_Exercise_Heart_Rate_Recovery: null,
    Sit_and_Reach_Test: null,
    Active_Straight_Leg_Raise: null,
    Shoulder_External_Internal_Rotation: null,
    Knee_to_Wall_Test: null,
    vo2Max: null,
    flexibility: null,
    anthropometricData: null,
    scores: null,
  },

  injuries: [],

  draftSavedAt: null,
  draftVersion: 1,

  isSubmitting: false,
  submissionError: null,
};

// ============================================
// ZUSTAND STORE
// ============================================

export const useStatsWizardStore = create<any>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // INITIALIZATION
      // ============================================
      initializeWizard: (athlete: any, guide: any, evaluation: any) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("[StatsWizardStore] initializeWizard", {
            athleteId: athlete.id,
            guideId: guide.id,
            evaluationDate: evaluation.evaluationDate,
          });
        }

        set({
          athlete,
          guide,
          evaluation,
          currentStep: 1,
          visitedSteps: [1],
        });
      },

      // ============================================
      // NAVIGATION
      // ============================================
      goToStep: (step: any) => {
        const totalSteps = WIZARD_STEPS.length;
        if (step < 1 || step > totalSteps) {
          console.warn(`[StatsWizardStore] Invalid step: ${step}`);
          return;
        }

        set((state: any) => ({
          currentStep: step,
          visitedSteps: state.visitedSteps.includes(step)
            ? state.visitedSteps
            : [...state.visitedSteps, step].sort((a, b) => a - b),
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug(`[StatsWizardStore] navigated to step ${step}`);
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        const totalSteps = WIZARD_STEPS.length;

        if (currentStep < totalSteps) {
          get().goToStep(currentStep + 1);
        } else {
          console.warn("[StatsWizardStore] Already at final step");
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          get().goToStep(currentStep - 1);
        } else {
          console.warn("[StatsWizardStore] Already at first step");
        }
      },

      markStepComplete: (step: any) => {
        set((state: any) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step].sort((a, b) => a - b),
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug(`[StatsWizardStore] marked step ${step} as complete`);
        }
      },

      markStepVisited: (step: any) => {
        set((state: any) => ({
          visitedSteps: state.visitedSteps.includes(step)
            ? state.visitedSteps
            : [...state.visitedSteps, step].sort((a, b) => a - b),
        }));
      },

      // ============================================
      // BASIC MEASUREMENTS
      // ============================================
      updateBasicMeasurements: (data: any) => {
        set((state: any) => ({
          basicMeasurements: state.basicMeasurements
            ? { ...state.basicMeasurements, ...data }
            : data,
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug("[StatsWizardStore] updated basic measurements", data);
        }
      }, // ============================================
      // STRENGTH & POWER
      // ============================================
      updateStrengthTest: (testName: any, data: any) => {
        set((state: any) => {
          const currentTest = state.strengthAndPower[testName];
          return {
            strengthAndPower: {
              ...state.strengthAndPower,
              [testName]: currentTest ? { ...currentTest, ...data } : data,
            },
          };
        });

        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[StatsWizardStore] updated strength test: ${testName}`,
            data
          );
        }
      },

      updateStrengthScores: (scores: any) => {
        set((state: any) => ({
          strengthAndPower: {
            ...state.strengthAndPower,
            scores,
          },
        }));
      },

      // ============================================
      // SPEED & AGILITY
      // ============================================
      updateSpeedTest: (testName: any, data: any) => {
        set((state: any) => {
          const currentTest = state.speedAndAgility[testName];
          return {
            speedAndAgility: {
              ...state.speedAndAgility,
              [testName]: currentTest ? { ...currentTest, ...data } : data,
            },
          };
        });

        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[StatsWizardStore] updated speed test: ${testName}`,
            data
          );
        }
      },

      updateSpeedScores: (scores: any) => {
        set((state: any) => ({
          speedAndAgility: {
            ...state.speedAndAgility,
            scores,
          },
        }));
      },

      // ============================================
      // STAMINA & RECOVERY
      // ============================================
      updateStaminaTest: (testName: any, data: any) => {
        set((state: any) => {
          const currentTest = state.staminaAndRecovery[testName];
          return {
            staminaAndRecovery: {
              ...state.staminaAndRecovery,
              [testName]: currentTest ? { ...currentTest, ...data } : data,
            },
          };
        });

        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[StatsWizardStore] updated stamina test: ${testName}`,
            data
          );
        }
      },

      updateStaminaScores: (scores: any) => {
        set((state: any) => ({
          staminaAndRecovery: {
            ...state.staminaAndRecovery,
            scores,
          },
        }));
      },

      // ============================================
      // INJURIES
      // ============================================
      addInjury: (injury: any) => {
        set((state: any) => ({
          injuries: [...state.injuries, injury],
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug("[StatsWizardStore] added injury", injury);
        }
      },

      updateInjury: (id: any, data: any) => {
        set((state: any) => ({
          injuries: state.injuries.map((injury: any) =>
            injury.id === id ? { ...injury, ...data } : injury
          ),
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug(`[StatsWizardStore] updated injury ${id}`, data);
        }
      },

      removeInjury: (id: any) => {
        set((state: any) => ({
          injuries: state.injuries.filter((injury: any) => injury.id !== id),
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug(`[StatsWizardStore] removed injury ${id}`);
        }
      },

      // ============================================
      // DRAFT MANAGEMENT
      // ============================================
      saveDraft: () => {
        set({
          draftSavedAt: new Date().toISOString(),
        });

        if (process.env.NODE_ENV === "development") {
          console.info("[StatsWizardStore] draft saved to localStorage");
        }
      },

      loadDraft: () => {
        const state = get();
        const hasDraft = state.draftSavedAt !== null;

        if (process.env.NODE_ENV === "development") {
          console.debug("[StatsWizardStore] loadDraft called", { hasDraft });
        }

        return hasDraft;
      },

      clearDraft: () => {
        set({
          ...initialState,
          draftSavedAt: null,
        });

        if (process.env.NODE_ENV === "development") {
          console.info("[StatsWizardStore] draft cleared");
        }
      },

      // ============================================
      // SUBMISSION
      // ============================================
      setSubmitting: (isSubmitting: any) => {
        set({ isSubmitting });
      },

      setSubmissionError: (error: any) => {
        set({ submissionError: error });
      },

      // ============================================
      // RESET
      // ============================================
      resetWizard: () => {
        set(initialState);

        if (process.env.NODE_ENV === "development") {
          console.info("[StatsWizardStore] wizard reset");
        }
      },

      // ============================================
      // GETTERS
      // ============================================
      getCompletePayload: () => {
        const state = get();

        if (!state.athlete || !state.guide || !state.evaluation) {
          console.error(
            "[StatsWizardStore] Cannot generate payload: missing required metadata"
          );
          return {};
        }

        const payload: Partial<any> = {
          athleteId: state.athlete.id,
          guideId: state.guide.id,
          evaluationDate: state.evaluation.evaluationDate,
          basicMeasurements: state.basicMeasurements as any,
          strengthAndPower: {
            ...state.strengthAndPower,
            scores: state.strengthAndPower.scores || {
              muscleMass: 0,
              enduranceStrength: 0,
              explosivePower: 0,
            },
          },
          speedAndAgility: {
            ...state.speedAndAgility,
            scores: state.speedAndAgility.scores || {
              sprintSpeed: 0,
              acceleration: 0,
              agility: 0,
              reactionTime: 0,
            },
          },
          staminaAndRecovery: {
            ...state.staminaAndRecovery,
            scores: state.staminaAndRecovery.scores || {
              cardiovascularFitness: 0,
              recoveryEfficiency: 0,
              overallFlexibility: 0,
              vo2MaxScore: 0,
            },
          },
          injuries: state.injuries,
          lastUpdatedBy: state.guide.id,
          lastUpdatedByName: state.guide.name,
          submittedAt: new Date().toISOString(),
        };

        return payload;
      },

      getProgressPercentage: () => {
        const { completedSteps } = get();
        const totalSteps = WIZARD_STEPS.filter(
          (s) => s.type !== "instruction"
        ).length;
        return Math.round((completedSteps.length / totalSteps) * 100);
      },

      canProceedToNextStep: () => {
        const { currentStep, completedSteps } = get();
        const currentStepConfig = WIZARD_STEPS.find(
          (s) => s.id === currentStep
        );

        // Instruction steps can always proceed
        if (currentStepConfig?.type === "instruction") {
          return true;
        }

        // Form steps must be marked complete to proceed
        return completedSteps.includes(currentStep);
      },
    }),
    {
      name: "stats-wizard-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist everything except submission state
        athlete: state.athlete,
        guide: state.guide,
        evaluation: state.evaluation,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        visitedSteps: state.visitedSteps,
        basicMeasurements: state.basicMeasurements,
        strengthAndPower: state.strengthAndPower,
        speedAndAgility: state.speedAndAgility,
        staminaAndRecovery: state.staminaAndRecovery,
        injuries: state.injuries,
        draftSavedAt: state.draftSavedAt,
        draftVersion: state.draftVersion,
      }),
      version: 1,
      // ADDED: Migration function to handle version changes
      migrate: (persistedState: any, version: number) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("[StatsWizardStore] Migrating from version", version);
        }

        // If version is 0 or undefined, it's the first time or corrupted data
        if (!version || version < 1) {
          // Return initial state or try to preserve what we can
          return persistedState || initialState;
        }

        // For future versions, add migration logic here
        // Example:
        // if (version === 1) {
        //   // Migrate from v1 to v2
        //   persistedState.newField = "default value";
        // }

        return persistedState;
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("[StatsWizardStore] hydration error:", error);
            // Clear corrupted data
            if (typeof window !== "undefined") {
              localStorage.removeItem("stats-wizard-storage");
            }
          } else if (process.env.NODE_ENV === "development") {
            console.debug("[StatsWizardStore] hydration successful", {
              hasDraft: state?.draftSavedAt !== null,
              currentStep: state?.currentStep,
            });
          }
        };
      },
    }
  )
);
