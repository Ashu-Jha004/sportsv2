"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TeamData = {
  id: string;
  name: string;
  logoUrl: string | null;
  sport: string;
  class: string | null;
  rank: string | null;
  status: string;
  teamApplicationId: string | null;
  counters: {
    membersCount: number;
    followersCount: number;
    postsCount: number;
    matchesPlayed: number;
  } | null;
  members: Array<{
    id: string;
    role: string;
    athleteId: string;
  }>;
};

export type TeamResponse = {
  success: boolean;
  data?: {
    team: TeamData;
    userRole: string;
    isOwner: boolean;
  };
  error?: string;
  errorCode?:
    | "NO_AUTH"
    | "NO_ATHLETE"
    | "NO_TEAM"
    | "DATABASE_ERROR"
    | "UNKNOWN";
};

// ============================================
// MAIN SERVER ACTION
// ============================================
export async function getUserTeam(athleteId?: string): Promise<TeamResponse> {
  const startTime = Date.now();

  try {
    console.log(
      "🔍 [getUserTeam] Starting team fetch for athleteId:",
      athleteId
    );

    let targetAthleteId = athleteId;

    // If no athleteId provided, get authenticated user's team

    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
        errorCode: "NO_AUTH",
      };
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: athleteId },
      select: { id: true },
    });

    if (!athlete) {
      return {
        success: false,
        error: "Athlete profile not found",
        errorCode: "NO_ATHLETE",
      };
    }

    console.log(`✅ [getUserTeam] Target athlete ID: ${targetAthleteId}`);

    // Find team membership for the target athlete
    const membership = await prisma.teamMembership.findUnique({
      where: { athleteId: athlete.id },
      select: {
        role: true,
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            sport: true,
            class: true,
            rank: true,
            status: true,
            ownerId: true,
            teamApplicationId: true,
            counters: {
              select: {
                membersCount: true,
                followersCount: true,
                postsCount: true,
                matchesPlayed: true,
              },
            },
            members: {
              select: {
                id: true,
                role: true,
                athleteId: true,
              },
              take: 10, // Limit for performance
            },
          },
        },
      },
    });
    if (!membership || !membership.team) {
      return {
        success: false,
        error: "Not a member of any team",
        errorCode: "NO_TEAM",
      };
    }

    const { team, role } = membership;
    const isOwner = team.ownerId === targetAthleteId;

    const executionTime = Date.now() - startTime;
    console.log(
      `✅ [getUserTeam] Team fetched successfully in ${executionTime}ms`
    );

    return {
      success: true,
      data: {
        team: team as TeamData,
        userRole: role,
        isOwner,
      },
    };
  } catch (error) {
    console.error(`❌ [getUserTeam] Error:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
      errorCode: "DATABASE_ERROR",
    };
  }
}



// ============================================
// UTILITY: REVALIDATE TEAM DATA
// ============================================

export async function revalidateTeamData(teamId?: string): Promise<void> {
  try {
    console.log(
      `🔄 [revalidateTeamData] Revalidating team data${
        teamId ? ` for team: ${teamId}` : ""
      }`
    );

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/teams");

    if (teamId) {
      revalidatePath(`/team/${teamId}`);
    }

    console.log("✅ [revalidateTeamData] Revalidation complete");
  } catch (error) {
    console.error("❌ [revalidateTeamData] Revalidation failed:", error);
  }
}
