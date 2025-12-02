"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { pollingConfig, shouldPoll } from "../lib/api/teams";

interface UseConditionalPollingProps {
  queryKey: string[];
  enabled?: boolean;
  context?: {
    isOwner?: boolean;
    isCaptain?: boolean;
    dialogOpen?: boolean;
  };
}

export function useConditionalPolling({
  queryKey,
  enabled = true,
  context,
}: any) {
  const queryClient = useQueryClient();

  // Memoize queryKey array to avoid new references each render
  const queryKeyString = JSON.stringify(queryKey);
  const stableQueryKey = useMemo(() => queryKey, [queryKeyString]);

  useEffect(() => {
    if (!enabled) return;

    const interval = shouldPoll(queryKey[0] as any, context);
    if (interval === false) return;

    const id = setInterval(() => {
      queryClient.refetchQueries({ queryKey: stableQueryKey });
    }, interval);

    return () => clearInterval(id);
  }, [stableQueryKey, enabled, context, queryClient]);
}
