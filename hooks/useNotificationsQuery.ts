// hooks/useNotificationsQuery.ts (or your feature path)
"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/server/notifications/server/queryKeys";
import { fetchNotificationsClient } from "@/server/notifications/client/api";
import type {
  NotificationDto,
  NotificationsFilter,
  NotificationsPageDto,
} from "../types/notifications/types";

const PAGE_SIZE = 20;

export function useNotificationsQuery(options?: {
  filter?: NotificationsFilter;
  enabled?: boolean;
}) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const filter: NotificationsFilter = options?.filter ?? "all";
  const enabled: boolean = options?.enabled ?? true;

  const queryClient = useQueryClient();

  const query = useQuery<NotificationsPageDto, Error>({
    queryKey: notificationKeys.list(filter),
    queryFn: () =>
      fetchNotificationsClient({
        cursor,
        limit: PAGE_SIZE,
        filter,
      }),
    enabled,
    // Poll only when dialog is open (controlled via `enabled`)
    refetchInterval: enabled ? 15000 : false,
    refetchOnWindowFocus: true,
  });

  // v5: callbacks like onSuccess were removed, so react via useEffect instead
  useEffect(() => {
    const data: NotificationsPageDto | undefined = query.data;
    if (!data) return;

    setHasMore(data.hasMore);

    if (!cursor) {
      // First page or refresh: replace list
      setItems(data.notifications);
    } else {
      // "Load more": append older items, avoid duplicates
      setItems((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const merged = [
          ...prev,
          ...data.notifications.filter(
            (n: NotificationDto) => !existingIds.has(n.id)
          ),
        ];
        return merged;
      });
    }

    // Keep unreadCount cache synced for the bell badge
    if (typeof data.unreadCount === "number") {
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        data.unreadCount
      );
    }
  }, [query.data, cursor, queryClient]);

  const loadMore = async () => {
    if (!hasMore || query.isFetching) return;

    const last = items[items.length - 1];
    if (!last) return;

    setCursor(last.id);
    // Query will refetch automatically because cursor is part of queryFn
  };

  const resetList = () => {
    setCursor(undefined);
    setItems([]);
  };

  const state = useMemo(
    () => ({
      items,
      hasMore,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      error: (query.error as Error) ?? null,
    }),
    [
      items,
      hasMore,
      query.isLoading,
      query.isFetching,
      query.isError,
      query.error,
    ]
  );

  return {
    ...state,
    refetch: query.refetch,
    loadMore,
    resetList,
  };
}
