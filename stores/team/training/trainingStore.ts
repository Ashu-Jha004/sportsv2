import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  TrainingPlanWithRelations,
  TrainingFootageWithRelations,
  WeeklyOverview,
} from "@/types/Training/types/training";

// ============================================
// STATE INTERFACE
// ============================================

interface TrainingState {
  // Active plan data
  activePlan: TrainingPlanWithRelations | null;
  isLoadingPlan: boolean;
  planError: string | null;

  // Footage gallery
  footageList: TrainingFootageWithRelations[];
  isLoadingFootage: boolean;
  footageError: string | null;
  footagePage: number;
  hasMoreFootage: boolean;

  // UI state
  selectedWeek: number;
  selectedDay: number | null;
  viewMode: "overview" | "calendar" | "list" | "footage";

  // Modals/dialogs state
  isCreatePlanOpen: boolean;
  isEditPlanOpen: boolean;
  isCreateSessionOpen: boolean;
  isEditSessionOpen: boolean;
  isCreateExerciseOpen: boolean;
  isUploadFootageOpen: boolean;
  editingSessionId: string | null;
  activeSession: any| null;

  // ✅ NEW: Delete states
  isDeleteSessionOpen: boolean;
  deleteSessionId: string;
  deleteSessionTitle: string;
  isDeleteExerciseOpen: boolean;
  deleteExerciseId: string;
  deleteExerciseName: string;

  // Actions - Plan Management
  setActivePlan: (plan: TrainingPlanWithRelations | null) => void;
  setIsLoadingPlan: (loading: boolean) => void;
  setPlanError: (error: string | null) => void;

  // Actions - Footage Management
  setFootageList: (footage: TrainingFootageWithRelations[]) => void;
  addFootage: (footage: TrainingFootageWithRelations) => void;
  removeFootage: (footageId: string) => void;
  setIsLoadingFootage: (loading: boolean) => void;
  setFootageError: (error: string | null) => void;
  setFootagePage: (page: number) => void;
  setHasMoreFootage: (hasMore: boolean) => void;

  // Actions - UI State
  setSelectedWeek: (week: number) => void;
  setSelectedDay: (day: number | null) => void;
  setViewMode: (mode: "overview" | "calendar" | "list" | "footage") => void;

  // Actions - Modals
  openCreatePlan: () => void;
  closeCreatePlan: () => void;
  openEditPlan: () => void;
  closeEditPlan: () => void;
  openCreateSession: (weekNumber?: number) => void;
  closeCreateSession: () => void;
  openEditSession: (session: any) => void;
  closeEditSession: () => void;
  openCreateExercise: (session: any) => void;
  closeCreateExercise: () => void;
  openDeleteSession: (sessionId: string, title: string) => void; // ✅ NEW
  closeDeleteSession: () => void; // ✅ NEW
  openDeleteExercise: (exerciseId: string, name: string) => void; // ✅ NEW
  closeDeleteExercise: () => void; // ✅ NEW
  openUploadFootage: () => void;
  closeUploadFootage: () => void;
  setEditingSession: (sessionId: string | null) => void;

  // Actions - Reset
  resetTrainingState: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  activePlan: null,
  isLoadingPlan: false,
  planError: null,

  footageList: [],
  isLoadingFootage: false,
  footageError: null,
  footagePage: 1,
  hasMoreFootage: true,

  selectedWeek: 1,
  selectedDay: null,
  viewMode: "overview" as const,

  isCreatePlanOpen: false,
  isEditPlanOpen: false,
  isCreateSessionOpen: false,
  isEditSessionOpen: false,
  isCreateExerciseOpen: false,
  isUploadFootageOpen: false,
  editingSessionId: null,
  activeSession: null,

  // ✅ NEW: Delete states
  isDeleteSessionOpen: false,
  deleteSessionId: "",
  deleteSessionTitle: "",
  isDeleteExerciseOpen: false,
  deleteExerciseId: "",
  deleteExerciseName: "",
};

// ============================================
// ZUSTAND STORE
// ============================================

export const useTrainingStore = create<TrainingState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Plan Management
      setActivePlan: (plan) =>
        set({ activePlan: plan, planError: null }, false, "setActivePlan"),

      setIsLoadingPlan: (loading) =>
        set({ isLoadingPlan: loading }, false, "setIsLoadingPlan"),

      setPlanError: (error) =>
        set({ planError: error, isLoadingPlan: false }, false, "setPlanError"),

      // Footage Management
      setFootageList: (footage) =>
        set(
          { footageList: footage, footageError: null },
          false,
          "setFootageList"
        ),

      addFootage: (footage) =>
        set(
          (state) => ({
            footageList: [footage, ...state.footageList],
          }),
          false,
          "addFootage"
        ),

      removeFootage: (footageId) =>
        set(
          (state) => ({
            footageList: state.footageList.filter((f) => f.id !== footageId),
          }),
          false,
          "removeFootage"
        ),

      setIsLoadingFootage: (loading) =>
        set({ isLoadingFootage: loading }, false, "setIsLoadingFootage"),

      setFootageError: (error) =>
        set(
          { footageError: error, isLoadingFootage: false },
          false,
          "setFootageError"
        ),

      setFootagePage: (page) =>
        set({ footagePage: page }, false, "setFootagePage"),

      setHasMoreFootage: (hasMore) =>
        set({ hasMoreFootage: hasMore }, false, "setHasMoreFootage"),

      // UI State
      setSelectedWeek: (week) =>
        set({ selectedWeek: week }, false, "setSelectedWeek"),

      setSelectedDay: (day) =>
        set({ selectedDay: day }, false, "setSelectedDay"),

      setViewMode: (mode) => set({ viewMode: mode }, false, "setViewMode"),

      // Modals
      openCreatePlan: () =>
        set({ isCreatePlanOpen: true }, false, "openCreatePlan"),

      closeCreatePlan: () =>
        set({ isCreatePlanOpen: false }, false, "closeCreatePlan"),

      openEditPlan: () => set({ isEditPlanOpen: true }, false, "openEditPlan"),

      closeEditPlan: () =>
        set({ isEditPlanOpen: false }, false, "closeEditPlan"),

      openCreateSession: (weekNumber) =>
        set(
          (state) => ({
            isCreateSessionOpen: true,
            selectedWeek: weekNumber ?? state.selectedWeek,
          }),
          false,
          "openCreateSession"
        ),

      closeCreateSession: () =>
        set(
          { isCreateSessionOpen: false, editingSessionId: null },
          false,
          "closeCreateSession"
        ),

      openEditSession: (session) =>
        set(
          {
            isEditSessionOpen: true,
            activeSession: session,
          },
          false,
          "openEditSession"
        ),

      closeEditSession: () =>
        set(
          {
            isEditSessionOpen: false,
            activeSession: null,
          },
          false,
          "closeEditSession"
        ),

      openCreateExercise: (session) =>
        set(
          {
            isCreateExerciseOpen: true,
            activeSession: session,
          },
          false,
          "openCreateExercise"
        ),

      closeCreateExercise: () =>
        set(
          {
            isCreateExerciseOpen: false,
            activeSession: null,
          },
          false,
          "closeCreateExercise"
        ),

      // ✅ NEW: Delete Session Actions
      openDeleteSession: (sessionId: string, title: string) =>
        set(
          {
            isDeleteSessionOpen: true,
            deleteSessionId: sessionId,
            deleteSessionTitle: title,
          },
          false,
          "openDeleteSession"
        ),

      closeDeleteSession: () =>
        set(
          {
            isDeleteSessionOpen: false,
            deleteSessionId: "",
            deleteSessionTitle: "",
          },
          false,
          "closeDeleteSession"
        ),

      // ✅ NEW: Delete Exercise Actions
      openDeleteExercise: (exerciseId: string, name: string) =>
        set(
          {
            isDeleteExerciseOpen: true,
            deleteExerciseId: exerciseId,
            deleteExerciseName: name,
          },
          false,
          "openDeleteExercise"
        ),

      closeDeleteExercise: () =>
        set(
          {
            isDeleteExerciseOpen: false,
            deleteExerciseId: "",
            deleteExerciseName: "",
          },
          false,
          "closeDeleteExercise"
        ),

      openUploadFootage: () =>
        set({ isUploadFootageOpen: true }, false, "openUploadFootage"),

      closeUploadFootage: () =>
        set({ isUploadFootageOpen: false }, false, "closeUploadFootage"),

      setEditingSession: (sessionId) =>
        set({ editingSessionId: sessionId }, false, "setEditingSession"),

      // Reset
      resetTrainingState: () => set(initialState, false, "resetTrainingState"),
    }),
    { name: "TrainingStore" }
  )
);

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================

export const selectActivePlan = (state: TrainingState) => state.activePlan;
export const selectIsLoadingPlan = (state: TrainingState) =>
  state.isLoadingPlan;
export const selectSelectedWeek = (state: TrainingState) => state.selectedWeek;
export const selectViewMode = (state: TrainingState) => state.viewMode;
export const selectFootageList = (state: TrainingState) => state.footageList;
export const selectIsLoadingFootage = (state: TrainingState) =>
  state.isLoadingFootage;
