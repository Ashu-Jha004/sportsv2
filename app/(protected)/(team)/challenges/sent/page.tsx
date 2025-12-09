"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SentChallengeFilterHeader } from "../_components/sent/challenges/sent-challenge-filter-header";
import { SentChallengeGrid } from "../_components/sent/challenges/sent-challenge-grid";
import { SentChallengeActionDialog } from "../_components/sent/challenges/sent-challenge-action-dialog";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";

export default function SentChallengesPage() {
  const searchParams = useSearchParams();
  const initializeFromURL = useSentChallengeStore(
    (state) => state.initializeFromURL
  );

  // Initialize filters from URL on mount
  useEffect(() => {
    try {
      initializeFromURL(searchParams);
    } catch (error) {
      console.error(
        "❌ [SentChallengesPage] Failed to initialize from URL:",
        error
      );
    }
  }, [searchParams, initializeFromURL]);

  return (
    <div className="min-h-screen bg-background">
      <SentChallengeFilterHeader />
      <SentChallengeGrid />
      <SentChallengeActionDialog />
    </div>
  );
}
