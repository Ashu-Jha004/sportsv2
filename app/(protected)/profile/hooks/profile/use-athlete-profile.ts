// hooks/use-athlete-profile.ts - OPTIMIZED VERSION

/**
 * =============================================================================
 * ATHLETE PROFILE REACT QUERY HOOKS (OPTIMIZED)
 * =============================================================================
 * React Query v5 | Production-ready | Resource-optimized
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type {
  AthleteProfile,
  EditProfileFormData,
  ApiResponse,
} from "@/types/profile/athlete-profile.types";

// =============================================================================
// QUERY KEYS
// =============================================================================

export const PROFILE_KEYS = {
  all: ["athlete-profiles"] as const,
  byUsername: (username: string) =>
    ["athlete-profiles", "username", username] as const,
  own: () => ["athlete-profiles", "own"] as const,
};

// =============================================================================
// API FUNCTIONS (Optimized with AbortController)
// =============================================================================

async function fetchAthleteProfile(
  username: string,
  signal?: AbortSignal
): Promise<AthleteProfile> {
  const response = await fetch(`/api/user/${encodeURIComponent(username)}`, {
    signal, // ✅ Allows request cancellation
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to fetch profile" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data: ApiResponse<AthleteProfile> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "No profile data returned");
  }

  return data.data;
}

async function fetchOwnProfile(signal?: AbortSignal): Promise<AthleteProfile> {
  const response = await fetch("/api/user/current", {
    signal, // ✅ Allows request cancellation
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to fetch profile" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data: ApiResponse<AthleteProfile> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "No profile data returned");
  }

  return data.data;
}

async function updateProfile(
  formData: EditProfileFormData
): Promise<AthleteProfile> {
  const response = await fetch("/api/profile/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to update profile" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data: ApiResponse<AthleteProfile> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Update failed");
  }

  return data.data;
}

// =============================================================================
// HOOKS (OPTIMIZED)
// =============================================================================

/**
 * Fetch athlete profile by username (public profiles)
 *
 * ✅ Optimized cache strategy
 * ✅ Request cancellation on unmount
 * ✅ Automatic refetch on window focus
 */
export function useAthleteProfile(username: string, enabled = true) {
  return useQuery({
    queryKey: PROFILE_KEYS.byUsername(username),
    queryFn: ({ signal }) => fetchAthleteProfile(username, signal),
    enabled: enabled && !!username,

    // ✅ OPTIMIZED CACHE SETTINGS
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced from 5min for fresher data)
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection

    // ✅ SMART REFETCHING
    refetchOnWindowFocus: true, // Auto-refresh when user returns to tab
    refetchOnMount: "always", // Always fetch on mount to ensure fresh data
    refetchOnReconnect: true, // Refetch when internet reconnects

    // ✅ ERROR HANDLING
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

    // ✅ PERFORMANCE
    notifyOnChangeProps: ["data", "error", "isLoading"], // Only re-render on these changes
  });
}

/**
 * Fetch own profile (current user)
 *
 * ✅ Longer cache time (own profile changes less frequently)
 * ✅ Request cancellation
 */
export function useOwnProfile(enabled = true) {
  return useQuery({
    queryKey: PROFILE_KEYS.own(),
    queryFn: ({ signal }) => fetchOwnProfile(signal),
    enabled,

    // ✅ OPTIMIZED FOR OWN PROFILE
    staleTime: 5 * 60 * 1000, // 5 minutes (own profile changes less)
    gcTime: 10 * 60 * 1000, // 10 minutes

    refetchOnWindowFocus: false, // No need to refetch own profile on focus
    refetchOnMount: false, // Cache is sufficient
    refetchOnReconnect: true,

    retry: 1,
    retryDelay: 1000,

    notifyOnChangeProps: ["data", "error", "isLoading"],
  });
}

/**
 * Update profile mutation with optimistic updates
 *
 * ✅ Optimistic UI updates
 * ✅ Automatic rollback on error
 * ✅ Cache invalidation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,

    // ✅ OPTIMISTIC UPDATE
    onMutate: async (newData: EditProfileFormData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: PROFILE_KEYS.own() });

      // Snapshot current data
      const previousProfile = queryClient.getQueryData<any>(PROFILE_KEYS.own());

      // Optimistically update cache
      if (previousProfile) {
        queryClient.setQueryData<any>(PROFILE_KEYS.own(), {
          ...previousProfile,
          ...newData,
          // Preserve fields not in update
          id: previousProfile.id,
          clerkUserId: previousProfile.clerkUserId,
          createdAt: previousProfile.createdAt,
          updatedAt: new Date().toISOString(), // Update timestamp optimistically
        });
      }

      return { previousProfile: previousProfile ?? null };
    },

    // ✅ ERROR ROLLBACK
    onError: (
      err: Error,
      newData: EditProfileFormData,
      context: { previousProfile: AthleteProfile | null } | undefined
    ) => {
      // Rollback to previous state
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_KEYS.own(), context.previousProfile);
      }
      console.error("❌ Profile update error:", err);
    },

    // ✅ SUCCESS HANDLING
    onSuccess: (data: AthleteProfile) => {
      // Update own profile cache
      queryClient.setQueryData(PROFILE_KEYS.own(), data);

      // Update public profile cache (if exists)
      queryClient.setQueryData(PROFILE_KEYS.byUsername(data.username), data);

      console.log("✅ Profile updated successfully");
    },

    // ✅ FINAL CLEANUP
    onSettled: () => {
      // Invalidate to ensure sync with server
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.own() });
    },
  });
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Prefetch profile (for hover cards, links, etc.)
 * ✅ Prevents loading states when navigating
 */
export function usePrefetchProfile() {
  const queryClient = useQueryClient();

  return useCallback(
    (username: string) => {
      queryClient.prefetchQuery({
        queryKey: PROFILE_KEYS.byUsername(username),
        queryFn: () => fetchAthleteProfile(username),
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Get cached profile without triggering fetch
 * ✅ Useful for optimistic UI
 */
export function useCachedProfile(username: string) {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.getQueryData<AthleteProfile>(
      PROFILE_KEYS.byUsername(username)
    );
  }, [queryClient, username]);
}

/**
 * Invalidate profile cache (force refetch)
 * ✅ Use after actions that affect profile (follow, unfollow, etc.)
 */
export function useInvalidateProfile() {
  const queryClient = useQueryClient();

  return useCallback(
    (username?: string) => {
      if (username) {
        queryClient.invalidateQueries({
          queryKey: PROFILE_KEYS.byUsername(username),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: PROFILE_KEYS.all,
        });
      }
    },
    [queryClient]
  );
}

/**
 * Optimistic counter update (for follow/unfollow)
 * ✅ Instantly updates follower counts without waiting for API
 */
export function useOptimisticCounterUpdate() {
  const queryClient = useQueryClient();

  return useCallback(
    (username: string, change: { followers?: number; following?: number }) => {
      queryClient.setQueryData<AthleteProfile>(
        PROFILE_KEYS.byUsername(username),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            followersCount: old.followersCount
              ? old.followersCount + (change.followers || 0)
              : change.followers || 0,
            followingCount: old.followingCount
              ? old.followingCount + (change.following || 0)
              : change.following || 0,
          };
        }
      );
    },
    [queryClient]
  );
}
