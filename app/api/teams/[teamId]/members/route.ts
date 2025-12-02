// app/api/teams/[teamId]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/app/(protected)/team/lib/utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    logger.team.debug("📡 Fetching team members", { teamId });

    const members = await prisma.teamMembership.findMany({
      where: { teamId },
      take: 100,
      select: {
        id: true,
        role: true,
        isCaptain: true,
        createdAt: true,
        athlete: {
          select: {
            id: true,
            clerkUserId: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            primarySport: true,
            secondarySport: true,
            rank: true,
            class: true,
          },
        },
      },
      orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    });

    // Transform for frontend
    const transformedMembers = members.map((membership) => ({
      ...membership.athlete,
      TeamMembership: {
        role: membership.role,
        isCaptain: membership.isCaptain,
      },
    }));

    logger.team.debug("✅ Team members API success", {
      teamId,
      count: transformedMembers.length,
    });

    return NextResponse.json({
      success: true,
      data: transformedMembers,
    });
  } catch (error) {
    logger.team.error(error as Error, {
      endpoint: "/api/teams/[teamId]/members",
      method: "GET",
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
