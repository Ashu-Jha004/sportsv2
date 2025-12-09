"use client";

import { useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { TeamCard } from "./team-card";
import { TeamCardSkeleton } from "./team-card-skeleton";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { useDiscoverStore } from "@/stores/team/disocver/discover-store";
import { discoverTeams } from "@/actions/discover/team-discovery-actions";
import { TeamDiscoveryResponse } from "@/types/discovery/team-discovery";

export function TeamGrid() {
  const filters = useDiscoverStore((state) => state.filters);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite query for teams
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<TeamDiscoveryResponse>({
    queryKey: ["discover-teams", filters],
    queryFn: async ({ pageParam }) => {
      try {
        return await discoverTeams(filters, pageParam as string | undefined);
      } catch (error) {
        console.error("❌ [TeamGrid] Query error:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        try {
          fetchNextPage();
        } catch (error) {
          console.error("❌ [TeamGrid] Fetch next page error:", error);
        }
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  // Flatten all pages into single array
  const teams = data?.pages.flatMap((page) => page.teams) ?? [];

  // Loading state - Initial load
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <TeamCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          error={
            error instanceof Error ? error.message : "Failed to load teams"
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Empty state - No teams found
  if (teams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState filters={filters} />
      </div>
    );
  }

  // Success state - Display teams
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={observerTarget} className="w-full py-8 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading more teams...</span>
          </div>
        )}
      </div>

      {/* End of results indicator */}
      {!hasNextPage && teams.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            You've reached the end of the list
          </p>
        </div>
      )}
    </div>
  );
}
