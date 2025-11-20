// app/api/friends/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestIdLog = Math.random().toString(36).substring(7);

  try {
    const { userId } = await auth();

    if (!userId) {
      console.error(
        `❌ [${requestIdLog}] Unauthorized friends list access attempt`
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      console.error(
        `❌ [${requestIdLog}] Athlete not found for userId:`,
        userId
      );
      return NextResponse.json(
        {
          success: false,
          error: "Athlete not found",
          code: "ATHLETE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Fetch all friendships where user is as userA -- prevent duplicates by design if reciprocal entries exist
    const friendships = await prisma.friendship.findMany({
      where: { userAId: athlete.id },
      select: {
        userB: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            primarySport: true,
            rank: true,
            class: true,
            roles: true,
          },
        },
      },
    });

    const friends = friendships.map((f) => ({
      id: f.userB.id,
      username: f.userB.username,
      fullName: `${f.userB.firstName} ${f.userB.lastName}`,
      profileImage: f.userB.profileImage,
      primarySport: f.userB.primarySport,
      rank: f.userB.rank,
      class: f.userB.class,
      roles: f.userB.roles,
    }));

    const duration = Date.now() - startTime;
    console.log(
      `✅ [${requestIdLog}] Returned friends list, count: ${friends.length}`,
      {
        duration: `${duration}ms`,
      }
    );

    return NextResponse.json({ success: true, friends });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestIdLog}] Error in GET friends:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch friends",
        code: "FETCH_FAILED",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
