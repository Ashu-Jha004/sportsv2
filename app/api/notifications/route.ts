// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchNotificationsPage } from "@/server/notifications/server/queries";
import type { NotificationsFilter } from "@/types/notifications/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const cursor = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");
  const filterParam = searchParams.get("filter") as NotificationsFilter | null;

  const limit = limitParam ? Number(limitParam) : undefined;
  const filter: NotificationsFilter | undefined =
    filterParam === "all" || filterParam === "unread" ? filterParam : undefined;

  try {
    const page = await fetchNotificationsPage({
      cursor: cursor ?? undefined,
      limit,
      filter,
    });

    return NextResponse.json(page, { status: 200 });
  } catch (error: any) {
    console.error("[api/notifications] GET failed", {
      error,
      cursor,
      limit,
      filter,
    });

    // Basic error mapping; you can extend this later
    const status = error?.code === "AUTH_UNAUTHENTICATED" ? 401 : 500;

    return NextResponse.json(
      {
        errorCode: error?.code ?? "NOTIFICATIONS_FETCH_FAILED",
        message:
          process.env.NODE_ENV === "development"
            ? error?.message ?? "Failed to fetch notifications"
            : "Unable to load notifications right now.",
      },
      { status }
    );
  }
}
