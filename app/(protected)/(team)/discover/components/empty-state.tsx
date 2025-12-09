"use client";

import { useCallback } from "react";
import { Search, Users, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiscoverStore } from "@/stores/team/disocver/discover-store";
import { TeamDiscoveryFilters } from "@/types/discovery/team-discovery";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  filters: TeamDiscoveryFilters;
}

export function EmptyState({ filters }: EmptyStateProps) {
  const router = useRouter();
  const clearFilters = useDiscoverStore((state) => state.clearFilters);

  const hasActiveFilters =
    filters.schoolName ||
    filters.teamName ||
    (filters.sport && filters.sport !== "ALL");

  const handleClearFilters = useCallback(() => {
    try {
      clearFilters();
      router.push("/discover", { scroll: false });
    } catch (error) {
      console.error("❌ [EmptyState] Clear filters error:", error);
    }
  }, [clearFilters, router]);

  // No filters applied - truly empty database
  if (!hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Teams Yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Be the first to create a team! Start building your squad and compete
          with others.
        </p>
        <Button onClick={() => router.push("/teams/create")}>
          Create Your Team
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
