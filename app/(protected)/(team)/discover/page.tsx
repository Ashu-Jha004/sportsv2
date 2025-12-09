"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FilterHeader } from "./components/filter-header";
import { TeamGrid } from "./components/team-grid";
import { useDiscoverStore } from "@/stores/team/disocver/discover-store";

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const initializeFromURL = useDiscoverStore(
    (state) => state.initializeFromURL
  );

  // Initialize filters from URL on mount
  useEffect(() => {
    try {
      initializeFromURL(searchParams);
    } catch (error) {
      console.error("❌ [DiscoverPage] Failed to initialize from URL:", error);
    }
  }, [searchParams, initializeFromURL]);

  return (
    <div className="min-h-screen bg-background">
      <FilterHeader />
      <TeamGrid />
    </div>
  );
}
