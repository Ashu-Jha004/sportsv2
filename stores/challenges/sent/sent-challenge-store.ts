import { create } from "zustand";
import {
  SentChallengeFilters,
  SentChallengeCardData,
} from "@/types/challenges/challenge";

interface SentChallengeStore {
  // Filters
  filters: SentChallengeFilters;
  tempFilters: SentChallengeFilters;
  setTempFilter: (key: keyof SentChallengeFilters, value: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  initializeFromURL: (searchParams: URLSearchParams) => void;

  // Action Dialog
  isActionDialogOpen: boolean;
  selectedMatchId: string | null;
  selectedAction:
    | "ACCEPT_COUNTER"
    | "COUNTER_AGAIN"
    | "CANCEL"
    | "VIEW_DETAILS"
    | null;
  selectedChallenge: SentChallengeCardData | null;

  openActionDialog: (
    matchId: string,
    action: "ACCEPT_COUNTER" | "COUNTER_AGAIN" | "CANCEL" | "VIEW_DETAILS",
    challenge: SentChallengeCardData
  ) => void;
  closeActionDialog: () => void;

  // Submission state
  isSubmitting: boolean;
  setSubmitting: (isSubmitting: boolean) => void;
}

export const useSentChallengeStore = create<SentChallengeStore>((set, get) => ({
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
    const status = searchParams.get("status") as
      | "PENDING"
      | "NEGOTIATING"
      | "ACCEPTED"
      | "REJECTED"
      | "ALL"
      | null;
    const sport = searchParams.get("sport") || undefined;
    const teamName = searchParams.get("team") || undefined;

    const urlFilters: SentChallengeFilters = {
      status: status || undefined,
      sport: sport as any,
      teamName,
    };

    set({
      filters: urlFilters,
      tempFilters: urlFilters,
    });
  },

  // Action Dialog
  isActionDialogOpen: false,
  selectedMatchId: null,
  selectedAction: null,
  selectedChallenge: null,

  openActionDialog: (matchId, action, challenge) => {
    set({
      isActionDialogOpen: true,
      selectedMatchId: matchId,
      selectedAction: action,
      selectedChallenge: challenge,
    });
  },

  closeActionDialog: () => {
    set({
      isActionDialogOpen: false,
      selectedMatchId: null,
      selectedAction: null,
      selectedChallenge: null,
    });
  },

  // Submission
  isSubmitting: false,
  setSubmitting: (isSubmitting) => {
    set({ isSubmitting });
  },
}));
