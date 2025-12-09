"use client";

import { useCallback } from "react";
import { Send, Filter, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";
import { SentChallengeFilters } from "@/types/challenges/challenge";
import { useRouter } from "next/navigation";

interface SentChallengeEmptyStateProps {
  filters: SentChallengeFilters;
}

export function SentChallengeEmptyState({
  filters,
}: SentChallengeEmptyStateProps) {
  const router = useRouter();
  const clearFilters = useSentChallengeStore((state) => state.clearFilters);

  const hasActiveFilters =
    filters.teamName ||
    (filters.sport && filters.sport !== "ALL") ||
    (filters.status && filters.status !== "ALL");

  const handleClearFilters = useCallback(() => {
    try {
      clearFilters();
      router.push("/challenges/sent", { scroll: false });
    } catch (error) {
      console.error("❌ [SentChallengeEmptyState] Clear filters error:", error);
    }
  }, [clearFilters, router]);

  // No filters applied - truly empty
  if (!hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Inbox className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Sent Challenges Yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          You haven't sent any match challenges yet. Start by challenging other
          teams to matches!
        </p>
        <Button onClick={() => router.push("/challenges")} variant="default">
          <Send className="h-4 w-4 mr-2" />
          Send a Challenge
        </Button>
      </div>
    );
  }

  // Filters applied but no results
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Filter className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No Challenges Found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        We couldn't find any challenges matching your filters. Try adjusting
        your search criteria.
      </p>

      {/* Active filters display */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Active Filters:
        </div>
        <div className="space-y-2 text-sm">
          {filters.status && filters.status !== "ALL" && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">
                {filters.status.toLowerCase().replace("_", " ")}
              </span>
            </div>
          )}
          {filters.teamName && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Team:</span>
              <span className="font-medium">{filters.teamName}</span>
            </div>
          )}
          {filters.sport && filters.sport !== "ALL" && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sport:</span>
              <span className="font-medium">{filters.sport}</span>
            </div>
          )}
        </div>
      </div>

      <Button onClick={handleClearFilters} variant="outline">
        Clear All Filters
      </Button>
    </div>
  );
}
