import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/app/(protected)/team/lib/utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current athlete
    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!currentAthlete) {
      return NextResponse.json(
        { success: false, error: "Athlete not found" },
        { status: 404 }
      );
    }

    // Check if user is owner or captain
    const team: any = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        ownerId: true,
        members: {
          where: {
            athleteId: currentAthlete.id,
            role: { in: ["OWNER", "CAPTAIN"] },
          },
          select: { role: true },
        },
      },
    });

    if (!team || team.ownerId !== currentAthlete.id) {
      const hasCaptainRole: any = team?.members.length > 0;
      if (!hasCaptainRole) {
        return NextResponse.json(
          { success: false, error: "Not authorized" },
          { status: 403 }
        );
      }
    }

    // Fetch pending join requests
    const joinRequests = await prisma.teamJoinRequest.findMany({
      where: {
        teamId,
        status: "PENDING",
      },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profileImage: true,
            primarySport: true,
            rank: true,
            class: true,
          },
        },
      },
    });

    logger.team.debug("✅ Join requests fetched", {
      teamId,
      count: joinRequests.length,
      currentAthleteId: currentAthlete.id,
    });

    return NextResponse.json({
      success: true,
      data: joinRequests,
      count: joinRequests.length,
    });
  } catch (error) {
    logger.team.error(error as Error, {
      endpoint: "/api/teams/[teamId]/join-requests",
      method: "GET",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch join requests" },
      { status: 500 }
    );
  }
}
