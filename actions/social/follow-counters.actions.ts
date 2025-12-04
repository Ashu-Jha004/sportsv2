"use server";

/**
 * =============================================================================
 * FOLLOW COUNTERS SERVER ACTIONS
 * =============================================================================
 * Server actions for fetching real-time follower/following counts
 */

import prisma from "@/lib/prisma";

// =============================================================================
// GET ATHLETE COUNTERS
// =============================================================================

/**
 * Get follower/following counts for an athlete
 * @param username - Athlete username
 * @returns Follower and following counts
 */
export async function getAthleteCounters(username: string): Promise<{
  followersCount: number;
  followingCount: number;
} | null> {
  try {
    const athlete = await prisma.athlete.findUnique({
      where: { username },
      select: {
        id: true,
        counters: {
          select: {
            followersCount: true,
            followingCount: true,
          },
        },
      },
    });

    if (!athlete) {
      return null;
    }

    return {
      followersCount: athlete.counters?.followersCount || 0,
      followingCount: athlete.counters?.followingCount || 0,
    };
  } catch (error) {
    console.error("[getAthleteCounters] Error:", error);
    return null;
  }
}

// =============================================================================
// GET TEAM COUNTERS
// =============================================================================

/**
 * Get follower count for a team
 * @param teamId - Team ID
 * @returns Follower count and other team stats
 */
export async function getTeamCounters(teamId: string): Promise<{
  followersCount: number;
  membersCount: number;
  postsCount: number;
  matchesPlayed: number;
} | null> {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        counters: {
          select: {
            followersCount: true,
            membersCount: true,
            postsCount: true,
            matchesPlayed: true,
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    return {
      followersCount: team.counters?.followersCount || 0,
      membersCount: team.counters?.membersCount || 0,
      postsCount: team.counters?.postsCount || 0,
      matchesPlayed: team.counters?.matchesPlayed || 0,
    };
  } catch (error) {
    console.error("[getTeamCounters] Error:", error);
    return null;
  }
}

// =============================================================================
// BATCH GET ATHLETE COUNTERS
// =============================================================================

/**
 * Get follower counts for multiple athletes (bulk operation)
 * @param usernames - Array of usernames
 * @returns Map of username -> counters
 */
export async function getBatchAthleteCounters(
  usernames: string[]
): Promise<Record<string, { followersCount: number; followingCount: number }>> {
  try {
    if (usernames.length === 0) {
      return {};
    }

    const athletes = await prisma.athlete.findMany({
      where: {
        username: { in: usernames },
      },
      select: {
        username: true,
        counters: {
          select: {
            followersCount: true,
            followingCount: true,
          },
        },
      },
    });

    const result: Record<
      string,
      { followersCount: number; followingCount: number }
    > = {};

    athletes.forEach((athlete:any) => {
      result[athlete.username] = {
        followersCount: athlete.counters?.followersCount || 0,
        followingCount: athlete.counters?.followingCount || 0,
      };
    });

    return result;
  } catch (error) {
    console.error("[getBatchAthleteCounters] Error:", error);
    return {};
  }
}
