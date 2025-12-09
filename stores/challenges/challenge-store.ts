import { create } from "zustand";
import {
  ChallengeFilters,
  ChallengeWizardData,
  TeamMemberForSelection,
} from "@/types/challenges/challenge";
import { Sport } from "@prisma/client";

interface ChallengeStore {
  // Filters
  filters: ChallengeFilters;
  tempFilters: ChallengeFilters;
  setTempFilter: (key: keyof ChallengeFilters, value: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  initializeFromURL: (searchParams: URLSearchParams) => void;

  // Wizard
  wizardData: ChallengeWizardData | null;
  isWizardOpen: boolean;

  openWizard: (
    teamId: string,
    teamName: string,
    teamLogo: string | null,
    teamSport: Sport
  ) => void;
  closeWizard: () => void;
  goToStep: (step: 1 | 2 | 3 | 4) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 2 - Match Details
  updateMatchDetails: (details: Partial<ChallengeWizardData>) => void;

  // Step 3 - Participants
  setParticipants: (participants: TeamMemberForSelection[]) => void;
  toggleParticipant: (athleteId: string) => void;
  toggleStarter: (athleteId: string) => void;

  // Submission
  setSubmitting: (isSubmitting: boolean) => void;
  resetWizard: () => void;
}

const initialWizardData: ChallengeWizardData = {
  targetTeamId: "",
  targetTeamName: "",
  targetTeamLogo: null,
  targetTeamSport: "FOOTBALL",
  proposedDate: null,
  proposedTime: "",
  proposedLocation: "",
  proposedLatitude: null,
  proposedLongitude: null,
  matchDurationMinutes: 90,
  messageToOpponent: "",
  selectedParticipants: [],
  currentStep: 1,
  isSubmitting: false,
};

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  // Filters
  filters: {},
  tempFilters: {},

  setTempFilter: (key, value) => {
    set((state) => ({
      tempFilters: {
        ...state.tempFilters,
        [key]: value || undefined,
      },
    }));
  },

  applyFilters: () => {
    const { tempFilters } = get();
    set({ filters: { ...tempFilters } });
  },

  clearFilters: () => {
    set({ filters: {}, tempFilters: {} });
  },

  initializeFromURL: (searchParams) => {
    const schoolName = searchParams.get("school") || undefined;
    const teamName = searchParams.get("team") || undefined;
    const sport = (searchParams.get("sport") as Sport) || undefined;

    const urlFilters: ChallengeFilters = {
      schoolName,
      teamName,
      sport,
    };

    set({
      filters: urlFilters,
      tempFilters: urlFilters,
    });
  },

  // Wizard
  wizardData: null,
  isWizardOpen: false,

  openWizard: (teamId, teamName, teamLogo, teamSport) => {
    set({
      isWizardOpen: true,
      wizardData: {
        ...initialWizardData,
        targetTeamId: teamId,
        targetTeamName: teamName,
        targetTeamLogo: teamLogo,
        targetTeamSport: teamSport,
      },
    });
  },

  closeWizard: () => {
    set({
      isWizardOpen: false,
      wizardData: null,
    });
  },

  goToStep: (step) => {
    set((state) => ({
      wizardData: state.wizardData
        ? { ...state.wizardData, currentStep: step }
        : null,
    }));
  },

  nextStep: () => {
    const { wizardData } = get();
    if (!wizardData) return;

    const nextStep = Math.min(4, wizardData.currentStep + 1) as 1 | 2 | 3 | 4;
    set({
      wizardData: { ...wizardData, currentStep: nextStep },
    });
  },

  prevStep: () => {
    const { wizardData } = get();
    if (!wizardData) return;

    const prevStep = Math.max(1, wizardData.currentStep - 1) as 1 | 2 | 3 | 4;
    set({
      wizardData: { ...wizardData, currentStep: prevStep },
    });
  },

  updateMatchDetails: (details) => {
    set((state) => ({
      wizardData: state.wizardData ? { ...state.wizardData, ...details } : null,
    }));
  },

  setParticipants: (participants) => {
    set((state) => ({
      wizardData: state.wizardData
        ? { ...state.wizardData, selectedParticipants: participants }
        : null,
    }));
  },

  toggleParticipant: (athleteId) => {
    set((state) => {
      if (!state.wizardData) return state;

      const participants = state.wizardData.selectedParticipants.map((p) =>
        p.athleteId === athleteId ? { ...p, isSelected: !p.isSelected } : p
      );

      return {
        wizardData: { ...state.wizardData, selectedParticipants: participants },
      };
    });
  },

  toggleStarter: (athleteId) => {
    set((state) => {
      if (!state.wizardData) return state;

      const participants = state.wizardData.selectedParticipants.map((p) =>
        p.athleteId === athleteId ? { ...p, isStarter: !p.isStarter } : p
      );

      return {
        wizardData: { ...state.wizardData, selectedParticipants: participants },
      };
    });
  },

  setSubmitting: (isSubmitting) => {
    set((state) => ({
      wizardData: state.wizardData
        ? { ...state.wizardData, isSubmitting }
        : null,
    }));
  },

  resetWizard: () => {
    set({
      isWizardOpen: false,
      wizardData: null,
    });
  },
}));
