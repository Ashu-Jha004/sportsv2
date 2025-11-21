// src/features/notifications/hooks/useUnreadCountQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationKeys } from "@/server/notifications/server/queryKeys";
import { fetchUnreadCountClient } from "@/server/notifications/client/api";

export function useUnreadCountQuery(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  const query = useQuery<number, Error>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => fetchUnreadCountClient(),
    enabled,
    refetchInterval: enabled ? 10000 : false, // poll every 10s
    refetchOnWindowFocus: true,
  });

  return {
    unreadCount: query.data ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
