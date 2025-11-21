// src/app/api/dev/notifications/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentAthleteOrThrow } from "@/lib/auth/getCurrentAthlete";

// Optional: narrow to dev only
const IS_DEV = process.env.NODE_ENV !== "production";

export async function POST(_req: NextRequest) {
  if (!IS_DEV) {
    return NextResponse.json(
      { error: "Not allowed in production" },
      { status: 403 }
    );
  }

  try {
    const athlete = await getCurrentAthleteOrThrow();

    // Simple random bits for testing
    const randomId = Math.floor(Math.random() * 100000);

    const notification = await prisma.notification.create({
      data: {
        athleteId: athlete.id,
        // optionally set actorId = athlete.id or some other test athlete
        actorId: athlete.id,
        type: "NEW_MESSAGE", // any NotificationType from your enum
        title: `Test notification #${randomId}`,
        message: `This is a fake notification generated for testing (#${randomId}).`,
        isRead: false,
        data: {
          // JSON payload, adjust to match your link builder
          conversationId: `test-conversation-${randomId}`,
          source: "dev-seed",
        },
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("[api/dev/notifications/seed] POST failed", {
      error,
    });

    return NextResponse.json(
      {
        errorCode: "DEV_NOTIFICATION_SEED_FAILED",
        message:
          process.env.NODE_ENV === "development"
            ? error?.message ?? "Failed to create test notification"
            : "Unable to create test notification.",
      },
      { status: 500 }
    );
  }
}
