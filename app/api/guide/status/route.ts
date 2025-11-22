// app/api/guide/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

function generateTraceId() {
  return `guide_status_${Math.random()
    .toString(36)
    .slice(2, 10)}_${Date.now().toString(36)}`;
}

export async function GET(_req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required.",
          },
          metadata: {
            traceId,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Find athlete by Clerk user id
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      return NextResponse.json(
        {
          success: true,
          data: {
            hasAthlete: false,
            hasGuide: false,
            guide: null,
          },
          metadata: {
            traceId,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    const guide = await prisma.guide.findUnique({
      where: { userId: athlete.id },
      select: {
        id: true,
        status: true,
        reviewNote: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          hasAthlete: true,
          hasGuide: !!guide,
          guide,
        },
        metadata: {
          traceId,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/guide/status] Unexpected error", {
      traceId,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to resolve guide status.",
        },
        metadata: {
          traceId,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
