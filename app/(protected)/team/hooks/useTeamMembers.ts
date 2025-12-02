"use client";

import { useQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "../lib/api/teams";
import { logger } from "../lib/utils/logger";
import { useConditionalPolling } from "./useConditionalPolling";

export function useTeamMembers(
  teamId: string,
  isOwner: boolean,
  isCaptain: boolean
) {
  const query = useQuery({
    queryKey: teamQueryKeys.teamMembers(teamId),
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/members`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch members`);
      }
      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to fetch members");
      }
      logger.team.debug("✅ useTeamMembers parsed", {
        teamId,
        count: json.data?.length || 0,
        sample: json.data?.[0],
      });
      return json.data || [];
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: false, // Disable default polling
    placeholderData: [],
  });

  // Only poll members if user is owner or captain
  const enabled = isOwner || isCaptain;

  useConditionalPolling({
    queryKey: teamQueryKeys.teamMembers(teamId),
    enabled,
    context: { isOwner, isCaptain },
  });

  return query;
}
