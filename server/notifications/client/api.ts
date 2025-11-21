// src/features/notifications/client/api.ts
import type {
  NotificationsFilter,
  NotificationsPageDto,
} from "../../../types/notifications/types";
export async function fetchNotificationsClient(params: {
  cursor?: string;
  limit?: number;
  filter?: NotificationsFilter;
}): Promise<NotificationsPageDto> {
  const searchParams = new URLSearchParams();

  if (params.cursor) searchParams.set("cursor", params.cursor);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.filter) searchParams.set("filter", params.filter);

  const queryString = searchParams.toString();
  const url =
    queryString.length > 0
      ? `/api/notifications?${queryString}`
      : `/api/notifications`;

  // In the browser, relative URLs are resolved against window.location
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const error = new Error(
      body?.message ?? "Failed to fetch notifications"
    ) as Error & { code?: string };
    if (body?.errorCode) error.code = body.errorCode;
    throw error;
  }

  return res.json();
}

export async function fetchUnreadCountClient(): Promise<number> {
  const res = await fetch("/api/notifications/unread-count", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const error = new Error(
      body?.message ?? "Failed to fetch unread count"
    ) as Error & { code?: string };
    if (body?.errorCode) error.code = body.errorCode;
    throw error;
  }

  const data = await res.json();
  return data.unreadCount as number;
}
