import { create } from "zustand";
import {
  ReceivedChallengeFilters,
  ReceivedChallengeCardData,
} from "@/types/challenges/challenge";

interface ReceivedChallengeStore {
  // Filters
  filters: ReceivedChallengeFilters;
  tempFilters: ReceivedChallengeFilters;
  setTempFilter: (key: keyof ReceivedChallengeFilters, value: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  initializeFromURL: (searchParams: URLSearchParams) => void;

  // Action Dialog
  isActionDialogOpen: boolean;
  selectedMatchId: string | null;
  selectedAction: "ACCEPT" | "REJECT" | "COUNTER" | "DELETE" | null;
  selectedChallenge: ReceivedChallengeCardData | null; // ✅ ADD THIS

  openActionDialog: (
    matchId: string,
    action: "ACCEPT" | "REJECT" | "COUNTER" | "DELETE",
    challenge: ReceivedChallengeCardData // ✅ ADD THIS PARAMETER
  ) => void;
  closeActionDialog: () => void;

  // Submission state
  isSubmitting: boolean;
  setSubmitting: (isSubmitting: boolean) => void;
}

export const useReceivedChallengeStore = create<ReceivedChallengeStore>(
  (set, get) => ({
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
        | "ALL"
        | null;
      const sport = searchParams.get("sport") || undefined;
      const teamName = searchParams.get("team") || undefined;

      const urlFilters: ReceivedChallengeFilters = {
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
    selectedChallenge: null, // ✅ ADD THIS

    openActionDialog: (matchId, action, challenge) => {
      // ✅ UPDATE THIS
      set({
        isActionDialogOpen: true,
        selectedMatchId: matchId,
        selectedAction: action,
        selectedChallenge: challenge, // ✅ ADD THIS
      });
    },

    closeActionDialog: () => {
      set({
        isActionDialogOpen: false,
        selectedMatchId: null,
        selectedAction: null,
        selectedChallenge: null, // ✅ ADD THIS
      });
    },

    // Submission
    isSubmitting: false,
    setSubmitting: (isSubmitting) => {
      set({ isSubmitting });
    },
  })
);
