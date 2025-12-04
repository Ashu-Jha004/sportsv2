/**
 * =============================================================================
 * FOLLOW COUNTERS HOOKS
 * =============================================================================
 * React Query hooks for real-time follower/following count updates
 */

import { useQuery } from "@tanstack/react-query";
import {
  getAthleteCounters,
  getTeamCounters,
} from "@/actions/social/follow-counters.actions";

// =============================================================================
// ATHLETE COUNTERS HOOK (WITH POLLING)
// =============================================================================

/**
 * Hook for athlete follower/following counts with real-time polling
 * @param username - Athlete username
 * @param pollingInterval - Polling interval in milliseconds (default: 10 seconds)
 * @param enabled - Whether to enable the query
 */
export function useAthleteCounters(
  username: string,
  pollingInterval: number = 10000,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["athleteCounters", username],
    queryFn: async () => {
      const counters = await getAthleteCounters(username);

      if (!counters) {
        throw new Error("Failed to fetch athlete counters");
      }

      console.log(
        `📊 [useAthleteCounters] Updated for @${username}:`,
        counters
      );

      return counters;
    },
    enabled,
    staleTime: 5000, // Consider data stale after 5 seconds
    refetchInterval: pollingInterval, // Poll every 10 seconds
    refetchIntervalInBackground: false, // Don't poll when tab is hidden
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

// =============================================================================
// TEAM COUNTERS HOOK (WITH POLLING)
// =============================================================================

/**
 * Hook for team follower count with real-time polling
 * @param teamId - Team ID
 * @param pollingInterval - Polling interval in milliseconds (default: 10 seconds)
 * @param enabled - Whether to enable the query
 */
export function useTeamCounters(
  teamId: string,
  pollingInterval: number = 10000,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["teamCounters", teamId],
    queryFn: async () => {
      const counters = await getTeamCounters(teamId);

      if (!counters) {
        throw new Error("Failed to fetch team counters");
      }

      console.log(`📊 [useTeamCounters] Updated for team ${teamId}:`, counters);

      return counters;
    },
    enabled,
    staleTime: 5000,
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// =============================================================================
// OPTIMISTIC COUNTER UPDATE HELPER
// =============================================================================

/**
 * Helper to optimistically update counter in React Query cache
 * Use this after follow/unfollow actions for instant UI feedback
 */
export function updateAthleteCountersCache(
  queryClient: any,
  username: string,
  update: {
    followersCount?: number;
    followingCount?: number;
  }
) {
  queryClient.setQueryData(
    ["athleteCounters", username],
    (old: { followersCount: number; followingCount: number } | undefined) => {
      if (!old) return old;

      return {
        followersCount: update.followersCount ?? old.followersCount,
        followingCount: update.followingCount ?? old.followingCount,
      };
    }
  );
}

/**
 * Helper to optimistically update team counter in React Query cache
 */
export function updateTeamCountersCache(
  queryClient: any,
  teamId: string,
  update: {
    followersCount?: number;
    membersCount?: number;
    postsCount?: number;
    matchesPlayed?: number;
  }
) {
  queryClient.setQueryData(
    ["teamCounters", teamId],
    (
      old:
        | {
            followersCount: number;
            membersCount: number;
            postsCount: number;
            matchesPlayed: number;
          }
        | undefined
    ) => {
      if (!old) return old;

      return {
        followersCount: update.followersCount ?? old.followersCount,
        membersCount: update.membersCount ?? old.membersCount,
        postsCount: update.postsCount ?? old.postsCount,
        matchesPlayed: update.matchesPlayed ?? old.matchesPlayed,
      };
    }
  );
}
