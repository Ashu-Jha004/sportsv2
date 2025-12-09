"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ReceivedChallengeFilterHeader } from "../_components/recevied/received-challenge-filter-header";
import { ReceivedChallengeGrid } from "../_components/recevied/received-challenge-grid";
import { ChallengeActionDialog } from "../_components/recevied/challenge-action-dialog";
import { useReceivedChallengeStore } from "@/stores/challenges/recevied/received-challenge-store";

export default function ReceivedChallengesPage() {
  const searchParams = useSearchParams();
  const initializeFromURL = useReceivedChallengeStore(
    (state) => state.initializeFromURL
  );

  // Initialize filters from URL on mount
  useEffect(() => {
    try {
      initializeFromURL(searchParams);
    } catch (error) {
      console.error(
        "❌ [ReceivedChallengesPage] Failed to initialize from URL:",
        error
      );
    }
  }, [searchParams, initializeFromURL]);

  return (
    <div className="min-h-screen bg-background">
      <ReceivedChallengeFilterHeader />
      <ReceivedChallengeGrid />
      <ChallengeActionDialog />
    </div>
  );
}
