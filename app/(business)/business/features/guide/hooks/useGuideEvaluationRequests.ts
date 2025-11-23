// hooks/guide/useGuideEvaluationRequests.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getGuideEvaluationRequestsAction } from "../dashboard/EvaluationAction/guideEvaluationRequests";

export function useGuideEvaluationRequests() {
  return useQuery({
    queryKey: ["guide-evaluation-requests"],
    queryFn: async () => {
      const res = await getGuideEvaluationRequestsAction();
      if (!res.success) {
        throw new Error(res.message || "Failed to load requests");
      }
      return res.data;
    },
    staleTime: 30_000,
  });
}
