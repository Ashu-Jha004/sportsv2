"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma"; // Adjust path to your prisma client
import {
  TeamCardData,
  TeamDiscoveryFilters,
  TeamDiscoveryResponse,
} from "@/types/discovery/team-discovery";

const TEAMS_PER_PAGE = 20;

export async function discoverTeams(
  filters: TeamDiscoveryFilters,
  cursor?: string
): Promise<TeamDiscoveryResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized: You must be logged in to discover teams");
    }

    // Get current athlete ID
    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!currentAthlete) {
      throw new Error("Athlete profile not found");
    }

    // Build dynamic where clause
    const whereClause: any = {
      // Show all teams regardless of status
    };

    // Independent filters (OR-like behavior through separate queries if needed)
    // But since user can provide school OR team name OR sport, we use AND
    if (filters.schoolName) {
      whereClause.TeamSchool = {
        contains: filters.schoolName,
        mode: "insensitive",
      };
    }

    if (filters.teamName) {
      whereClause.name = {
        contains: filters.teamName,
        mode: "insensitive",
      };
    }

    if (filters.sport && filters.sport !== "ALL") {
      whereClause.sport = filters.sport;
    }

    // Pagination cursor
    if (cursor) {
      whereClause.id = {
        lt: cursor, // Assuming descending order by createdAt
      };
    }

    // Fetch teams with counters
    const teams = await prisma.team.findMany({
      where: whereClause,
      take: TEAMS_PER_PAGE + 1, // Fetch one extra to check if there's more
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        sport: true,
        TeamSchool: true,
        class: true,
        rank: true,
        city: true,
        state: true,
        country: true,
        teamApplicationId: true,
        counters: {
          select: {
            membersCount: true,
          },
        },
        members: {
          where: {
            athleteId: currentAthlete.id,
          },
          select: {
            id: true,
          },
        },
        joinRequests: {
          where: {
            athleteId: currentAthlete.id,
            status: "PENDING",
          },
          select: {
            id: true,
          },
        },
      },
    });

    const hasMore = teams.length > TEAMS_PER_PAGE;
    const teamsToReturn = hasMore ? teams.slice(0, TEAMS_PER_PAGE) : teams;

    const teamCards: TeamCardData[] = teamsToReturn.map((team) => ({
      id: team.id,
      name: team.name,
      logoUrl: team.logoUrl,
      sport: team.sport,
      TeamSchool: team.TeamSchool,
      class: team.class,
      rank: team.rank,
      city: team.city,
      state: team.state,
      country: team.country,
      membersCount: team.counters?.membersCount || 0,
      isCurrentUserMember: team.members.length > 0,
      hasPendingJoinRequest: team.joinRequests.length > 0,
      teamApplicationId: team.teamApplicationId,
    }));

    return {
      teams: teamCards,
      hasMore,
      nextCursor: hasMore
        ? teamsToReturn[teamsToReturn.length - 1].id
        : undefined,
    };
  } catch (error) {
    console.error("❌ [discoverTeams] Error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch teams. Please try again."
    );
  }
}
