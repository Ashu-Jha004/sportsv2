// hooks/useCreateEvaluationRequest.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { createEvaluationRequestAction } from "../../actions/createEvaluationRequest";

type CreateEvaluationVars = {
  guideId: string;
  message?: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
};

export function useCreateEvaluationRequest() {
  return useMutation({
    mutationKey: ["create-evaluation-request"],
    mutationFn: async (vars: CreateEvaluationVars) => {
      const res = await createEvaluationRequestAction(vars);
      return res; // CreateEvaluationRequestResult
    },
  });
}
