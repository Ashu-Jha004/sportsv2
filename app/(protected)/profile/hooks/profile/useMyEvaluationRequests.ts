// hooks/useMyEvaluationRequests.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyEvaluationRequestsAction } from "../../actions/getMyEvaluationRequests";

export function useMyEvaluationRequests() {
  return useQuery({
    queryKey: ["my-evaluation-requests"],
    queryFn: async () => {
      return await getMyEvaluationRequestsAction();
    },
  });
}
