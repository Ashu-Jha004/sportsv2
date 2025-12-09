"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { SentChallengeCard } from "./sent-challenge-card";
import { SentChallengeCardSkeleton } from "./sent-challenge-card-skeleton";
import { SentChallengeEmptyState } from "./sent-challenge-empty-state";
import { SentChallengeErrorState } from "./sent-challenge-error-state";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";
import { checkChallengePermissions } from "@/actions/challenges/send/challenge-actions";
import { SentChallengesResponse } from "@/types/challenges/challenge";
import { getSentChallenges } from "@/actions/challenges/negotition/sent/sent-challenge-actions";

export function SentChallengeGrid() {
  const filters = useSentChallengeStore((state) => state.filters);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [canManage, setCanManage] = useState(false);

  // Check permissions
  useEffect(() => {
    const checkPerms = async () => {
      try {
        const perms = await checkChallengePermissions();
        setCanManage(perms.canChallenge);
      } catch (error) {
        console.error("❌ [SentChallengeGrid] Permission check failed:", error);
        setCanManage(false);
      }
    };

    checkPerms();
  }, []);

  // Infinite query for challenges
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<SentChallengesResponse>({
    queryKey: ["sent-challenges", filters],
    queryFn: async ({ pageParam }) => {
      try {
        console.log(
          "🔍 [SentChallengeGrid] Fetching challenges with filters:",
          filters
        );
        return await getSentChallenges(
          filters,
          pageParam as string | undefined
        );
      } catch (error) {
        console.error("❌ [SentChallengeGrid] Query error:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        try {
          console.log("📜 [SentChallengeGrid] Loading more challenges...");
          fetchNextPage();
        } catch (error) {
          console.error("❌ [SentChallengeGrid] Fetch next page error:", error);
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
  const challenges = data?.pages.flatMap((page) => page.challenges) ?? [];

  // Loading state - Initial load
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SentChallengeCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SentChallengeErrorState
          error={
            error instanceof Error ? error.message : "Failed to load challenges"
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Empty state - No challenges found
  if (challenges.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SentChallengeEmptyState filters={filters} />
      </div>
    );
  }

  // Success state - Display challenges
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <SentChallengeCard
            key={challenge.matchId}
            challenge={challenge}
            canManage={canManage}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={observerTarget} className="w-full py-8 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading more challenges...</span>
          </div>
        )}
      </div>

      {/* End of results indicator */}
      {!hasNextPage && challenges.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            You've reached the end of the list
          </p>
        </div>
      )}
    </div>
  );
}
