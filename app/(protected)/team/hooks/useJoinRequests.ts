"use client";

import { useQuery } from "@tanstack/react-query";
import { teamQueryKeys, pollingConfig } from "../lib/api/teams";

export function useJoinRequests(teamId: string) {
  return useQuery({
    queryKey: teamQueryKeys.joinRequests(teamId),
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/join-requests`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to fetch join requests");
      }
      return json.data || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: pollingConfig["join-requests"], // Conditional polling
    placeholderData: [],
  });
}
