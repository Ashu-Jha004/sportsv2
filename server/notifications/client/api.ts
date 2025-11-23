// src/features/notifications/client/api.ts
import type {
  NotificationsFilter,
  NotificationsPageDto,
} from "../../../types/notifications/types";
import type { PhysicalEvaluationRequestDetailsDto } from "@/types/notifications/evaluations/types";
type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
};
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

export async function fetchEvaluationRequestDetails(
  requestId: string
): Promise<ApiResponse<PhysicalEvaluationRequestDetailsDto>> {
  try {
    const res = await fetch(`/api/notifications/evaluations/${requestId}`, {
      method: "GET",
      credentials: "include",
    });

    const json = await res.json();

    if (!res.ok || !json.ok) {
      return {
        ok: false,
        errorCode: json.errorCode ?? "EVAL_DETAILS_FETCH_FAILED",
        errorMessage:
          json.errorMessage ??
          `Failed to fetch evaluation details (status ${res.status})`,
      };
    }

    return {
      ok: true,
      data: json.data as PhysicalEvaluationRequestDetailsDto,
    };
  } catch (error) {
    console.error("[fetchEvaluationRequestDetails] network error", error);
    return {
      ok: false,
      errorCode: "NETWORK_ERROR",
      errorMessage:
        process.env.NODE_ENV === "development"
          ? String(error)
          : "Network error while loading evaluation details.",
    };
  }
}
