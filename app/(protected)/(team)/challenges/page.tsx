"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChallengeFilterHeader } from "./_components/sent/challenges/challenge-filter-header";
import { ChallengeGrid } from "./_components/sent/challenges/challenge-grid";
import { ChallengeWizard } from "./_components/sent/challenges/challenge-wizard/challenge-wizard";
import { useChallengeStore } from "@/stores/challenges/challenge-store";

export default function ChallengePage() {
  const searchParams = useSearchParams();
  const initializeFromURL = useChallengeStore(
    (state) => state.initializeFromURL
  );

  // Initialize filters from URL on mount
  useEffect(() => {
    try {
      initializeFromURL(searchParams);
    } catch (error) {
      console.error("❌ [ChallengePage] Failed to initialize from URL:", error);
    }
  }, [searchParams, initializeFromURL]);

  return (
    <div className="min-h-screen bg-background">
      <ChallengeFilterHeader />
      <ChallengeGrid />
      <ChallengeWizard />
    </div>
  );
}
