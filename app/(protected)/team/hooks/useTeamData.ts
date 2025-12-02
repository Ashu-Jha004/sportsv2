// lib/hooks/useTeamData.ts
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTeamStore } from "@/stores/team/fetching/teamStore";
import { teamQueryKeys } from "../lib/api/teams";
import { getTeamData } from "../lib/actions/team/getTeamData";
import { TeamWithRelations } from "../lib/types/team";
import { logger } from "../lib/utils/logger";

interface UseTeamDataProps {
  teamId: string;
  initialData?: TeamWithRelations;
  currentUserId: string | null;
}

export function useTeamData({
  teamId,
  initialData,
  currentUserId,
}: UseTeamDataProps) {
  const updateCounts = useTeamStore((state) => state.updateCounts);

  const query = useQuery({
    queryKey: teamQueryKeys.team(teamId),
    queryFn: () => getTeamData({ teamId, currentUserId }),
    initialData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // 30s polling
    refetchOnWindowFocus: false,
    placeholderData: initialData,
    // ✅ FIXED: React Query v5 - use useEffect instead of onSuccess
  });

  // ✅ FIXED: Move onSuccess logic to useEffect
  React.useEffect(() => {
    if (query.data) {
      logger.team.debug("🔄 Team data refetched", {
        teamId,
        memberCount: query.data.members.length,
        isStale: query.isStale,
      });

      // ✅ FIXED: Proper typing for updateCounts
      updateCounts({
        memberCount:
          query.data.counters?.membersCount || query.data.members.length || 0,
        postCount:
          query.data.counters?.postsCount ||
          query.data.recentPosts?.length ||
          0,
        matchCount: query.data.upcomingMatches?.length || 0,
      } as any); // Temporary cast until we fix store typing
    }
  }, [query.data, updateCounts, teamId]);

  // ✅ FIXED: Explicit error typing
  React.useEffect(() => {
    if (query.error) {
      logger.team.error(query.error as Error, {
        teamId,
        action: "useTeamData",
      });
    }
  }, [query.error, teamId]);

  return {
    teamData: query.data,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
