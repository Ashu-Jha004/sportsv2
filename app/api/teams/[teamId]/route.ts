// app/api/teams/[teamId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTeamData } from "@/app/(protected)/team/lib/actions/team/getTeamData";
import { cookies } from "next/headers";
import { logger } from "@/app/(protected)/team/lib/utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    // ✅ FIXED: Await both cookies() and params
    const cookieStore = await cookies();
    const { teamId } = await params;
    const clerkUserId = cookieStore.get("__clerk_db_user_id")?.value;

    const { searchParams } = new URL(request.url);
    const fullData = searchParams.get("full") === "true";

    logger.team.debug("📡 API Request", {
      method: "GET",
      endpoint: `/api/teams/${teamId}`,
      fullData,
      userId: clerkUserId,
    });

    const teamData = await getTeamData({
      teamId,
      currentUserId: clerkUserId || null,
    });

    if (!teamData) {
      return NextResponse.json(
        {
          success: false,
          error: "Team not found",
          debug: { teamId, status: 404 },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: teamData,
      debug: {
        relationsLoaded: {
          owner: true,
          members: teamData.members.length,
          posts: teamData.recentPosts?.length || 0,
          matches: teamData.upcomingMatches?.length || 0,
        },
      },
    });
  } catch (error) {
    logger.team.error(error as Error, {
      endpoint: "/api/teams/[teamId]",
      method: "GET",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        debug: {
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
