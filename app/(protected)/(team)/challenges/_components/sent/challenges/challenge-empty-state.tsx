"use client";

import { useCallback } from "react";
import { Search, Swords, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChallengeStore } from "@/stores/challenges/challenge-store";
import { ChallengeFilters } from "@/types/challenges/challenge";
import { useRouter } from "next/navigation";

interface ChallengeEmptyStateProps {
  filters: ChallengeFilters;
}

export function ChallengeEmptyState({ filters }: ChallengeEmptyStateProps) {
  const router = useRouter();
  const clearFilters = useChallengeStore((state) => state.clearFilters);

  const hasActiveFilters =
    filters.schoolName ||
    filters.teamName ||
    (filters.sport && filters.sport !== "ALL");

  const handleClearFilters = useCallback(() => {
    try {
      clearFilters();
      router.push("/challenges", { scroll: false });
    } catch (error) {
      console.error("❌ [ChallengeEmptyState] Clear filters error:", error);
    }
  }, [clearFilters, router]);

  // No filters applied - truly empty
  if (!hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Swords className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Teams Available</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          There are currently no teams available to challenge. Make sure you're
          part of an active team to see challengeable opponents.
        </p>
        <Button onClick={() => router.push("/discover")}>
          Discover Teams
        </Button>
      </div>
    );
  }

  // Filters applied but no results
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No Teams Found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        We couldn't find any teams matching your search criteria. Try adjusting
        your filters or search terms.
      </p>

      {/* Active filters display */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Active Filters:
        </div>
        <div className="space-y-2 text-sm">
          {filters.schoolName && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">School:</span>
              <span className="font-medium">{filters.schoolName}</span>
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
