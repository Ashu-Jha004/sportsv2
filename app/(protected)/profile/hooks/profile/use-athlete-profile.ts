// hooks/use-athlete-profile.ts - COMPLETE FIXED VERSION

/**
 * =============================================================================
 * ATHLETE PROFILE REACT QUERY HOOKS (React Query v5)
 * =============================================================================
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import type {
  AthleteProfile,
  EditProfileFormData,
  ApiResponse,
} from "@/types/profile/athlete-profile.types";
import { useProfileActions } from "@/stores/athlete/athlete-store";

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
// API FUNCTIONS
// =============================================================================

async function fetchAthleteProfile(username: string): Promise<AthleteProfile> {
  const response = await fetch(`/api/user/${encodeURIComponent(username)}`);

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

async function fetchOwnProfile(): Promise<AthleteProfile> {
  const response = await fetch("/api/user/current");

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
  const response = await fetch("/api/user/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
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
// HOOKS
// =============================================================================

export function useAthleteProfile(username: string, enabled = true) {
  const { setProfile }: any = useProfileActions();

  const query = useQuery({
    queryKey: PROFILE_KEYS.byUsername(username),
    queryFn: () => fetchAthleteProfile(username),
    enabled: enabled && !!username,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  return query;
}

export function useOwnProfile(enabled = true) {
  const { setProfile } = useProfileActions();

  const query = useQuery({
    queryKey: PROFILE_KEYS.own(),
    queryFn: fetchOwnProfile,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  return query;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setProfile } = useProfileActions();

  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (newData: EditProfileFormData) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_KEYS.own() });

      const previousProfile = queryClient.getQueryData<AthleteProfile>(
        PROFILE_KEYS.own()
      );

      if (previousProfile) {
        queryClient.setQueryData<AthleteProfile>(PROFILE_KEYS.own(), {
          ...previousProfile,
          ...newData,
        });
      }

      return { previousProfile: previousProfile ?? null };
    },
    onError: (
      err: Error,
      newData: EditProfileFormData,
      context: { previousProfile: AthleteProfile | null } | undefined
    ) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_KEYS.own(), context.previousProfile);
      }
      console.error("Profile update error:", err);
    },
    onSuccess: (data: AthleteProfile) => {
      queryClient.setQueryData(PROFILE_KEYS.own(), data);
      queryClient.setQueryData(PROFILE_KEYS.byUsername(data.username), data);
      setProfile(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.own() });
    },
  });
}

export function usePrefetchProfile() {
  const queryClient = useQueryClient();

  return useCallback(
    (username: string) => {
      queryClient.prefetchQuery({
        queryKey: PROFILE_KEYS.byUsername(username),
        queryFn: () => fetchAthleteProfile(username),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

export function useCachedProfile(username: string) {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.getQueryData<AthleteProfile>(
      PROFILE_KEYS.byUsername(username)
    );
  }, [queryClient, username]);
}

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
