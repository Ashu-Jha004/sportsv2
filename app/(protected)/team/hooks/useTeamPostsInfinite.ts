"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "../lib/api/teams";

export function useTeamPostsInfinite(teamId: string) {
  return useInfiniteQuery({
    queryKey: teamQueryKeys.teamPosts(teamId),
    queryFn: async ({ pageParam = 0 }) => {
      const url = new URL(
        `/api/teams/${teamId}/posts?page=${pageParam}&limit=10`,
        location.origin
      );

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");

      const json = await response.json();
      return {
        posts: json.data || [],
        nextCursor: json.nextCursor || null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: false,
  });
}
