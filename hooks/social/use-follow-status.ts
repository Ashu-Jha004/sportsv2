/**
 * =============================================================================
 * FOLLOW STATUS HOOK
 * =============================================================================
 * React Query hook for checking follow status
 */

import { useQuery } from "@tanstack/react-query";
import { getFollowStatus } from "@/actions/social/follow-athlete.actions";

/**
 * Hook to check if current user is following a target athlete
 */
export function useFollowStatus(
  targetUsername: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["followStatus", targetUsername],
    queryFn: async () => {
      const status = await getFollowStatus(targetUsername);

      console.log(
        `🔍 [useFollowStatus] Status for @${targetUsername}:`,
        status
      );

      return status;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
