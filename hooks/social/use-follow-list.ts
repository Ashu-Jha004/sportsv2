/**
 * =============================================================================
 * FOLLOW LIST HOOKS
 * =============================================================================
 * React Query hooks for follower/following lists with infinite scroll
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getAthleteFollowers,
  getAthleteFollowing,
  getTeamFollowers,
} from "@/actions/social/follow-list.actions";

// =============================================================================
// ATHLETE FOLLOWERS HOOK
// =============================================================================

export function useAthleteFollowers(username: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["followers", username],
    queryFn: async ({ pageParam }) => {
      return await getAthleteFollowers(username, {
        limit: 20,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// =============================================================================
// ATHLETE FOLLOWING HOOK
// =============================================================================

export function useAthleteFollowing(username: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["following", username],
    queryFn: async ({ pageParam }) => {
      return await getAthleteFollowing(username, {
        limit: 20,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// =============================================================================
// TEAM FOLLOWERS HOOK
// =============================================================================

export function useTeamFollowers(teamId: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["teamFollowers", teamId],
    queryFn: async ({ pageParam }) => {
      return await getTeamFollowers(teamId, {
        limit: 20,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
