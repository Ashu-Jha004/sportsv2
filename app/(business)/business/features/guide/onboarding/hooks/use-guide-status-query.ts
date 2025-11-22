// lib/queries/use-guide-status-query.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type GuideStatus =
  | "none" // no athlete or guide yet
  | "no_guide" // athlete exists but no guide application
  | "pending_review"
  | "approved"
  | "rejected";

type ApiResponse = {
  success: boolean;
  data?: {
    hasAthlete: boolean;
    hasGuide: boolean;
    guide: {
      id: string;
      status: string;
      reviewNote: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    traceId?: string;
    timestamp?: string;
  };
};

export type GuideStatusData = {
  status: GuideStatus;
  guideId?: string;
  reviewNote?: string | null;
};

async function fetchGuideStatus(): Promise<GuideStatusData> {
  const res = await axios.get<ApiResponse>("/api/guide/status");

  if (!res.data.success || !res.data.data) {
    // treat missing data as unauthenticated / no profile
    return { status: "none" };
  }

  const { hasAthlete, hasGuide, guide } = res.data.data;

  if (!hasAthlete) {
    return { status: "none" };
  }

  if (!hasGuide || !guide) {
    return { status: "no_guide" };
  }

  const rawStatus = guide.status as string;

  if (rawStatus === "pending_review") {
    return {
      status: "pending_review",
      guideId: guide.id,
      reviewNote: guide.reviewNote,
    };
  }

  if (rawStatus === "approved") {
    return {
      status: "approved",
      guideId: guide.id,
      reviewNote: guide.reviewNote,
    };
  }

  if (rawStatus === "rejected") {
    return {
      status: "rejected",
      guideId: guide.id,
      reviewNote: guide.reviewNote,
    };
  }

  // Fallback if a new status is introduced
  return {
    status: "no_guide",
  };
}
export function useGuideStatusQuery(enabled = true) {
  return useQuery<GuideStatusData>({
    queryKey: ["guide", "status"],
    queryFn: fetchGuideStatus,
    enabled,
    staleTime: 30_000, // avoid spamming the API // Optionally poll while pending_review so approval reflects without hard refresh
    refetchInterval: (queryResult) =>
      queryResult?.state?.data?.status === "pending_review" ? 15_000 : false,
  });
}
