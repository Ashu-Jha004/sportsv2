// src/app/api/notifications/unread-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchUnreadCount } from "@/server/notifications/server/queries";

export async function GET(_request: NextRequest) {
  try {
    const unreadCount = await fetchUnreadCount();

    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error: any) {
    console.error("[api/notifications/unread-count] GET failed", {
      error,
    });

    const status = error?.code === "AUTH_UNAUTHENTICATED" ? 401 : 500;

    return NextResponse.json(
      {
        errorCode: error?.code ?? "UNREAD_COUNT_FETCH_FAILED",
        message:
          process.env.NODE_ENV === "development"
            ? error?.message ?? "Failed to fetch unread count"
            : "Unable to load notifications right now.",
      },
      { status }
    );
  }
}
