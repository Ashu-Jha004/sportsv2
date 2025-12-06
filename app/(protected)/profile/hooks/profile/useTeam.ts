"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTeamStore } from "@/stores/team/team.store";
import { TeamData } from "@/actions/team.actions";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

// ============================================
// TYPE DEFINITIONS
// ============================================

type TeamAPIResponse = {
  success: boolean;
  data?: {
    team: TeamData;
    userRole: string;
    isOwner: boolean;
  };
  message?: string;
  error?: string;
  errorCode?: string;
  timestamp: string;
  executionTime?: string;
};

// ============================================
// API FETCHER FUNCTION
// ============================================

// ============================================
// MAIN REACT QUERY HOOK
// ============================================

export const useTeam = (athleteId?: string) => {
  const queryClient = useQueryClient();
  const {
    setTeam,
    clearTeam,
    setLoading,
    setError,
    shouldRefetch,
    team: cachedTeam,
    isOwner,
    userRole,
  } = useTeamStore();
  useEffect(() => {
    console.log("🔄 [useTeam] athleteId changed, clearing store:", athleteId);
    clearTeam(); // Clear previous team data
  }, [athleteId, clearTeam]);
  const isOwnProfile = !athleteId;
  const fetchTeamDataWithId =
    useCallback(async (): Promise<TeamAPIResponse> => {
      console.log(
        "🔄 [useTeam] Fetching team data for athleteId:",
        athleteId || "authenticated user"
      );

      const url = athleteId ? `/api/Team?athleteId=${athleteId}` : "/api/Team";

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: Failed to fetch team data`
        );
      }

      return data;
    }, [athleteId]);

  // React Query for fetching team data
  const { data, error, isLoading, isFetching, isError, refetch, isRefetching } =
    useQuery({
      queryKey: ["team", athleteId || "authenticated-user"],
      queryFn: fetchTeamDataWithId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: shouldRefetch(),
      enabled: true,
    });

  // Sync React Query data to Zustand store
  useEffect(() => {
    if (isLoading || isFetching) {
      setLoading(true);
      return;
    }

    if (isError && error) {
      console.error("❌ [useTeam] Query error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch team data"
      );
      setLoading(false);
      return;
    }

    if (data) {
      setLoading(false);

      // Handle "no team" case
      if (!data.success && data.errorCode === "NO_TEAM") {
        console.log("ℹ️ [useTeam] User has no team");
        clearTeam();
        setError(null);
        return;
      }

      // Handle other errors
      if (!data.success) {
        console.error("❌ [useTeam] API returned error:", data.error);
        setError(data.error || "Failed to load team data", data.errorCode);
        return;
      }

      // Success: update store
      if (data.data) {
        console.log("✅ [useTeam] Syncing data to Zustand store");
        setTeam(data.data.team, data.data.userRole, data.data.isOwner);
      }
    }
  }, [
    data,
    isLoading,
    isFetching,
    isError,
    error,
    setTeam,
    clearTeam,
    setLoading,
    setError,
  ]);

  // Manual retry with toast feedback
  const handleRetry = useCallback(() => {
    console.log("🔄 [useTeam] Manual retry triggered");
    toast.loading("Retrying...", { id: "team-retry" });

    refetch().then(() => {
      toast.dismiss("team-retry");
    });
  }, [refetch]);

  // Invalidate and refetch team data
  const invalidateTeam = useCallback(() => {
    console.log("🔄 [useTeam] Invalidating team cache");
    queryClient.invalidateQueries({ queryKey: ["team"] });
  }, [queryClient]);

  // Prefetch team data (useful for navigation)
  const prefetchTeam = useCallback(() => {
    console.log("🔄 [useTeam] Prefetching team data");
    queryClient.prefetchQuery({
      queryKey: ["team", "authenticated-user"],
      queryFn: fetchTeamDataWithId,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    // Data
    team: cachedTeam,
    userRole,
    isOwner,
    hasTeam: cachedTeam !== null,

    // Loading states
    isLoading: isLoading || isFetching,
    isRefetching,
    isFetching,

    // Error states
    isError,
    error: data?.error || (error instanceof Error ? error.message : null),
    errorCode: data?.errorCode || null,

    // Actions
    refetch,
    retry: handleRetry,
    invalidate: invalidateTeam,
    prefetch: prefetchTeam,

    // Metadata
    lastFetched: data?.timestamp,
    executionTime: data?.executionTime,
  };
};

// ============================================
// MUTATION HOOK FOR OPTIMISTIC UPDATES
// ============================================

export const useUpdateTeamCounters = () => {
  const queryClient = useQueryClient();
  const { updateTeamCounters } = useTeamStore();

  return useMutation({
    mutationFn: async (counters: Partial<TeamData["counters"]>) => {
      // This would be your actual API call to update counters
      console.log("🔄 [useUpdateTeamCounters] Updating counters:", counters);
      return counters;
    },
    onMutate: async (newCounters) => {
      // Optimistic update
      console.log("⚡ [useUpdateTeamCounters] Optimistic update");
      updateTeamCounters(newCounters);
    },
    onError: (error, variables, context) => {
      console.error("❌ [useUpdateTeamCounters] Update failed:", error);
      toast.error("Failed to update team data");
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onSuccess: () => {
      console.log("✅ [useUpdateTeamCounters] Update successful");
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });
};
