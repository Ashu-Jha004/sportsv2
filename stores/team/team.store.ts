import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { TeamData } from "@/actions/team.actions";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TeamState = {
  team: TeamData | null;
  userRole: string | null;
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  lastFetched: number | null;
};

export type TeamActions = {
  setTeam: (team: TeamData, userRole: string, isOwner: boolean) => void;
  clearTeam: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null, errorCode?: string | null) => void;
  reset: () => void;
  updateTeamCounters: (counters: Partial<TeamData["counters"]>) => void;
  shouldRefetch: () => boolean;
};

export type TeamStore = TeamState & TeamActions;

// ============================================
// INITIAL STATE
// ============================================

const initialState: TeamState = {
  team: null,
  userRole: null,
  isOwner: false,
  isLoading: false,
  error: null,
  errorCode: null,
  lastFetched: null,
};

// ============================================
// ZUSTAND STORE
// ============================================

export const useTeamStore = create<TeamStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Set team data
        setTeam: (team, userRole, isOwner) => {
          console.log("🏪 [TeamStore] Setting team data:", {
            teamName: team.name,
            userRole,
            isOwner,
          });
          set(
            {
              team,
              userRole,
              isOwner,
              error: null,
              errorCode: null,
              isLoading: false,
              lastFetched: Date.now(),
            },
            false,
            "setTeam"
          );
        },

        // Clear team data (user left team or logged out)
        clearTeam: () => {
          console.log("🏪 [TeamStore] Clearing team data");
          set(
            {
              team: null,
              userRole: null,
              isOwner: false,
              error: null,
              errorCode: null,
              lastFetched: null,
            },
            false,
            "clearTeam"
          );
        },

        // Set loading state
        setLoading: (isLoading) => {
          console.log(`🏪 [TeamStore] Setting loading: ${isLoading}`);
          set({ isLoading }, false, "setLoading");
        },

        // Set error state
        setError: (error, errorCode = null) => {
          console.error("🏪 [TeamStore] Setting error:", { error, errorCode });
          set(
            {
              error,
              errorCode,
              isLoading: false,
            },
            false,
            "setError"
          );
        },

        // Reset to initial state
        reset: () => {
          console.log("🏪 [TeamStore] Resetting store to initial state");
          set(initialState, false, "reset");
        },

        // Update team counters (optimistic updates)
        updateTeamCounters: (counters) => {
          const currentTeam = get().team;
          if (!currentTeam || !currentTeam.counters) {
            console.warn("🏪 [TeamStore] Cannot update counters: No team data");
            return;
          }

          console.log("🏪 [TeamStore] Updating team counters:", counters);
          set(
            {
              team: {
                ...currentTeam,
                counters: {
                  ...currentTeam.counters,
                  ...counters,
                },
              },
            },
            false,
            "updateTeamCounters"
          );
        },

        // Check if data should be refetched (stale after 5 minutes)
        shouldRefetch: () => {
          const { lastFetched } = get();
          if (!lastFetched) return true;

          const STALE_TIME = 5 * 60 * 1000; // 5 minutes
          const isStale = Date.now() - lastFetched > STALE_TIME;

          if (isStale) {
            console.log("🏪 [TeamStore] Data is stale, should refetch");
          }

          return isStale;
        },
      }),
      {
        name: "team-storage", // localStorage key
        partialize: (state) => ({
          // Only persist essential data, not loading/error states
          team: state.team,
          userRole: state.userRole,
          isOwner: state.isOwner,
          lastFetched: state.lastFetched,
        }),
      }
    ),
    {
      name: "TeamStore", // DevTools name
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================

export const selectTeam = (state: TeamStore) => state.team;
export const selectUserRole = (state: TeamStore) => state.userRole;
export const selectIsOwner = (state: TeamStore) => state.isOwner;
export const selectIsLoading = (state: TeamStore) => state.isLoading;
export const selectError = (state: TeamStore) => state.error;
export const selectErrorCode = (state: TeamStore) => state.errorCode;
export const selectTeamCounters = (state: TeamStore) => state.team?.counters;
export const selectHasTeam = (state: TeamStore) => state.team !== null;

// ============================================
// UTILITY HOOKS
// ============================================

// Hook to check if user has a team
export const useHasTeam = () => useTeamStore(selectHasTeam);

// Hook to get team counters only
export const useTeamCounters = () => useTeamStore(selectTeamCounters);

// Hook to check if user is team owner
export const useIsTeamOwner = () => useTeamStore(selectIsOwner);
