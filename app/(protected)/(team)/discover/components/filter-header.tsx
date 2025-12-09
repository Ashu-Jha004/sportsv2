"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiscoverStore } from "@/stores/team/disocver/discover-store";
import { Sport } from "@prisma/client";

const SPORTS_OPTIONS = [
  { value: "ALL", label: "All Sports" },
  { value: "FOOTBALL", label: "Football" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "CRICKET", label: "Cricket" },
  { value: "TENNIS", label: "Tennis" },
  { value: "RUNNING", label: "Running" },
  { value: "SWIMMING", label: "Swimming" },
  { value: "BADMINTON", label: "Badminton" },
  { value: "VOLLEYBALL", label: "Volleyball" },
  { value: "HOCKEY", label: "Hockey" },
  { value: "ATHLETICS", label: "Athletics" },
  { value: "WRESTLING", label: "Wrestling" },
  { value: "BOXING", label: "Boxing" },
  { value: "MARTIAL_ARTS", label: "Martial Arts" },
  { value: "CYCLING", label: "Cycling" },
  { value: "GOLF", label: "Golf" },
  { value: "OTHER", label: "Other" },
];

export function FilterHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tempFilters, setTempFilter, applyFilters, clearFilters } =
    useDiscoverStore();

  const updateURLParams = useCallback(
    (filters: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove params based on filter values
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "ALL") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`/discover?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(() => {
    try {
      applyFilters();

      // Update URL with current filters
      updateURLParams({
        school: tempFilters.schoolName,
        team: tempFilters.teamName,
        sport: tempFilters.sport,
      });
    } catch (error) {
      console.error("❌ [FilterHeader] Search error:", error);
    }
  }, [applyFilters, tempFilters, updateURLParams]);

  const handleClearFilters = useCallback(() => {
    try {
      clearFilters();
      router.push("/discover", { scroll: false });
    } catch (error) {
      console.error("❌ [FilterHeader] Clear filters error:", error);
    }
  }, [clearFilters, router]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const hasActiveFilters =
    tempFilters.schoolName ||
    tempFilters.teamName ||
    (tempFilters.sport && tempFilters.sport !== "ALL");

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Header Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Discover Teams
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Find and join teams that match your interests
              </p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* School Name Input */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by school name..."
                value={tempFilters.schoolName || ""}
                onChange={(e) => setTempFilter("schoolName", e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-10"
              />
            </div>

            {/* Team Name Input */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by team name..."
                value={tempFilters.teamName || ""}
                onChange={(e) => setTempFilter("teamName", e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-10"
              />
            </div>

            {/* Sport Select */}
            <div className="w-full sm:w-[200px]">
              <Select
                value={tempFilters.sport || "ALL"}
                onValueChange={(value) => setTempFilter("sport", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS_OPTIONS.map((sport) => (
                    <SelectItem key={sport.value} value={sport.value}>
                      {sport.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                size="default"
                className="h-10 px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
