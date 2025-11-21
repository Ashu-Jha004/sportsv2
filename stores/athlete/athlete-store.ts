// stores/athlete-profile-store.ts - FIXED

/**
 * =============================================================================
 * ATHLETE PROFILE STORE (FIXED)
 * =============================================================================
 * Zustand store for managing athlete profile state
 * Includes profile data, stats, matches, and media
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  AthleteProfile,
  AthleteStats,
  MatchHistory,
  MediaItem,
  ProfileStoreState,
} from "@/types/profile/athlete-profile.types";

// =============================================================================
// INITIAL STATE - FIXED (removed 'as const')
// =============================================================================

const INITIAL_STATE = {
  profile: null as AthleteProfile | null,
  stats: null as AthleteStats | null,
  matches: [] as MatchHistory[],
  media: [] as MediaItem[],
  isEditDialogOpen: false,
  isLoadingLocation: false,
};

// =============================================================================
// STORE
// =============================================================================

export const useAthleteProfileStore = create<ProfileStoreState>()(
  devtools(
    (set) => ({
      // State
      ...INITIAL_STATE,

      // =============================================================================
      // PROFILE ACTIONS
      // =============================================================================

      /**
       * Set athlete profile data
       */
      setProfile: (profile) => {
        set({ profile }, false, "profile/set");
      },

      /**
       * Set athlete stats
       */
      setStats: (stats) => {
        set({ stats }, false, "stats/set");
      },

      /**
       * Set match history
       */
      setMatches: (matches) => {
        set({ matches }, false, "matches/set");
      },

      /**
       * Set media gallery
       */
      setMedia: (media) => {
        set({ media }, false, "media/set");
      },

      // =============================================================================
      // UI ACTIONS
      // =============================================================================

      /**
       * Open edit profile dialog
       */
      openEditDialog: () => {
        set({ isEditDialogOpen: true }, false, "dialog/open");
      },

      /**
       * Close edit profile dialog
       */
      closeEditDialog: () => {
        set({ isEditDialogOpen: false }, false, "dialog/close");
      },

      /**
       * Set location loading state
       */
      setLoadingLocation: (loading) => {
        set({ isLoadingLocation: loading }, false, "location/loading");
      },

      // =============================================================================
      // RESET
      // =============================================================================

      /**
       * Reset entire store to initial state
       */
      resetStore: () => {
        set({ ...INITIAL_STATE }, false, "store/reset");
      },
    }),
    {
      name: "athlete-profile-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

// =============================================================================
// SELECTORS (Optimized)
// =============================================================================

/**
 * Get profile data
 */
export const useProfile = () =>
  useAthleteProfileStore((state) => state.profile);

/**
 * Get stats data
 */
export const useStats = () => useAthleteProfileStore((state) => state.stats);

/**
 * Get matches data
 */
export const useMatches = () =>
  useAthleteProfileStore((state) => state.matches);

/**
 * Get media data
 */
export const useMedia = () => useAthleteProfileStore((state) => state.media);

/**
 * Get edit dialog state
 */
export const useEditDialogState = () =>
  useAthleteProfileStore((state) => state.isEditDialogOpen);

/**
 * Get location loading state
 */
export const useLocationLoading = () =>
  useAthleteProfileStore((state) => state.isLoadingLocation);

/**
 * Get all actions
 */
export const useProfileActions = () =>
  useAthleteProfileStore((state) => ({
    setProfile: state.setProfile,
    setStats: state.setStats,
    setMatches: state.setMatches,
    setMedia: state.setMedia,
    openEditDialog: state.openEditDialog,
    closeEditDialog: state.closeEditDialog,
    setLoadingLocation: state.setLoadingLocation,
    resetStore: state.resetStore,
  }));

// =============================================================================
// COMPUTED SELECTORS
// =============================================================================

/**
 * Get profile display name
 */
export const useProfileDisplayName = () =>
  useAthleteProfileStore((state) => {
    if (!state.profile) return "Anonymous";
    return `${state.profile.firstName} ${state.profile.lastName}`;
  });

/**
 * Get profile location string
 */
export const useProfileLocation = () =>
  useAthleteProfileStore((state) => {
    if (!state.profile) return "";
    const { city, state: st, country } = state.profile;
    return [city, st, country].filter(Boolean).join(", ");
  });

/**
 * Get match statistics summary
 */
export const useMatchStatistics = () =>
  useAthleteProfileStore((state) => {
    const matches = state.matches;

    return {
      total: matches.length,
      wins: matches.filter((m) => m.result === "WIN").length,
      losses: matches.filter((m) => m.result === "LOSS").length,
      draws: matches.filter((m) => m.result === "DRAW").length,
      winRate:
        matches.length > 0
          ? Math.round(
              (matches.filter((m) => m.result === "WIN").length /
                matches.length) *
                100
            )
          : 0,
    };
  });

/**
 * Check if profile is complete
 */
export const useIsProfileComplete = () =>
  useAthleteProfileStore((state) => {
    const profile = state.profile;
    if (!profile) return false;

    return !!(
      profile.username &&
      profile.firstName &&
      profile.lastName &&
      profile.bio &&
      profile.primarySport &&
      profile.city &&
      profile.country
    );
  });
