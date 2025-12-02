// lib/hooks/usePendingInvites.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "../lib/api/teams";

export function usePendingInvites(teamId: string) {
  return useQuery({
    queryKey: teamQueryKeys.pendingInvites(teamId),
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/invitations`);
      if (!response.ok) throw new Error("Failed to fetch invites");

      const json = await response.json();
      return json.data || [];
    },
    staleTime: 30 * 1000, // 30s
    refetchInterval: 10 * 1000, // 10s polling
  });
}
