"use server";

/**
 * =============================================================================
 * FOLLOW LIST SERVER ACTIONS
 * =============================================================================
 * Server actions for fetching follower/following lists with pagination
 */

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  generateNextCursor,
  hasMoreResults,
} from "@/lib/validations/follow.validation";
import type {
  FollowerListResponse,
  FollowingListResponse,
  TeamFollowerListResponse,
  FollowPaginationParams,
} from "@/types/social/follow.types";

// =============================================================================
// GET ATHLETE FOLLOWERS
// =============================================================================

/**
 * Get paginated list of followers for an athlete
 * @param username - Username of athlete
 * @param params - Pagination parameters
 * @returns Paginated follower list
 */
export async function getAthleteFollowers(
  username: string,
  params: FollowPaginationParams = {}
): Promise<any> {
  const startTime = Date.now();
  const limit = params.limit || 20;

  try {
    console.log(
      `🔍 [getAthleteFollowers] Fetching followers for @${username} (limit: ${limit}, cursor: ${
        params.cursor || "none"
      })`
    );

    // =========================================================================
    // 1. GET TARGET ATHLETE
    // =========================================================================
    const athlete = await prisma.athlete.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!athlete) {
      console.error(`❌ [getAthleteFollowers] Athlete not found: @${username}`);
      return {
        followers: [],
        total: 0,
        hasMore: false,
      };
    }

    // =========================================================================
    // 2. BUILD QUERY WITH CURSOR PAGINATION
    // =========================================================================
    const whereClause: any = {
      followingId: athlete.id,
    };

    // Add cursor if provided
    if (params.cursor) {
      whereClause.id = {
        lt: params.cursor, // Get records before this cursor
      };
    }

    // =========================================================================
    // 3. FETCH FOLLOWERS (limit + 1 to check if more exist)
    // =========================================================================
    const followers = await prisma.follow.findMany({
      where: whereClause,
      take: limit + 1,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        follower: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            primarySport: true,
            rank: true,
            class: true,
          },
        },
      },
    });

    // =========================================================================
    // 4. CALCULATE PAGINATION
    // =========================================================================
    const hasMore = followers.length > limit;
    const displayFollowers = hasMore ? followers.slice(0, limit) : followers;
    const nextCursor = hasMore
      ? displayFollowers[displayFollowers.length - 1]?.id
      : undefined;

    // =========================================================================
    // 5. GET TOTAL COUNT (only on first page for performance)
    // =========================================================================
    let total = 0;
    if (!params.cursor) {
      const counters = await prisma.athleteCounters.findUnique({
        where: { athleteId: athlete.id },
        select: { followersCount: true },
      });
      total = counters?.followersCount || 0;
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ [getAthleteFollowers] Fetched ${displayFollowers.length} followers in ${duration}ms (hasMore: ${hasMore})`
    );

    return {
      followers: displayFollowers,
      total,
      hasMore,
      nextCursor,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [getAthleteFollowers] Error after ${duration}ms:`, error);

    return {
      followers: [],
      total: 0,
      hasMore: false,
    };
  }
}

// =============================================================================
// GET ATHLETE FOLLOWING
// =============================================================================

/**
 * Get paginated list of athletes that a user is following
 * @param username - Username of athlete
 * @param params - Pagination parameters
 * @returns Paginated following list
 */
export async function getAthleteFollowing(
  username: string,
  params: FollowPaginationParams = {}
): Promise<any> {
  const startTime = Date.now();
  const limit = params.limit || 20;

  try {
    console.log(
      `🔍 [getAthleteFollowing] Fetching following for @${username} (limit: ${limit}, cursor: ${
        params.cursor || "none"
      })`
    );

    // =========================================================================
    // 1. GET TARGET ATHLETE
    // =========================================================================
    const athlete = await prisma.athlete.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!athlete) {
      console.error(`❌ [getAthleteFollowing] Athlete not found: @${username}`);
      return {
        following: [],
        total: 0,
        hasMore: false,
      };
    }

    // =========================================================================
    // 2. BUILD QUERY WITH CURSOR PAGINATION
    // =========================================================================
    const whereClause: any = {
      followerId: athlete.id,
    };

    if (params.cursor) {
      whereClause.id = {
        lt: params.cursor,
      };
    }

    // =========================================================================
    // 3. FETCH FOLLOWING (limit + 1 to check if more exist)
    // =========================================================================
    const following = await prisma.follow.findMany({
      where: whereClause,
      take: limit + 1,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            primarySport: true,
            rank: true,
            class: true,
          },
        },
      },
    });

    // =========================================================================
    // 4. CALCULATE PAGINATION
    // =========================================================================
    const hasMore = following.length > limit;
    const displayFollowing = hasMore ? following.slice(0, limit) : following;
    const nextCursor = hasMore
      ? displayFollowing[displayFollowing.length - 1]?.id
      : undefined;

    // =========================================================================
    // 5. GET TOTAL COUNT (only on first page)
    // =========================================================================
    let total = 0;
    if (!params.cursor) {
      const counters = await prisma.athleteCounters.findUnique({
        where: { athleteId: athlete.id },
        select: { followingCount: true },
      });
      total = counters?.followingCount || 0;
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ [getAthleteFollowing] Fetched ${displayFollowing.length} following in ${duration}ms (hasMore: ${hasMore})`
    );

    return {
      following: displayFollowing,
      total,
      hasMore,
      nextCursor,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [getAthleteFollowing] Error after ${duration}ms:`, error);

    return {
      following: [],
      total: 0,
      hasMore: false,
    };
  }
}

// =============================================================================
// GET TEAM FOLLOWERS
// =============================================================================

/**
 * Get paginated list of followers for a team
 * @param teamId - Team ID
 * @param params - Pagination parameters
 * @returns Paginated team follower list
 */
export async function getTeamFollowers(
  teamId: string,
  params: FollowPaginationParams = {}
): Promise<any> {
  const startTime = Date.now();
  const limit = params.limit || 20;

  try {
    console.log(
      `🔍 [getTeamFollowers] Fetching followers for team ${teamId} (limit: ${limit}, cursor: ${
        params.cursor || "none"
      })`
    );

    // =========================================================================
    // 1. VERIFY TEAM EXISTS
    // =========================================================================
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, name: true },
    });

    if (!team) {
      console.error(`❌ [getTeamFollowers] Team not found: ${teamId}`);
      return {
        followers: [],
        total: 0,
        hasMore: false,
      };
    }

    // =========================================================================
    // 2. BUILD QUERY WITH CURSOR PAGINATION
    // =========================================================================
    const whereClause: any = {
      teamId: teamId,
    };

    if (params.cursor) {
      whereClause.id = {
        lt: params.cursor,
      };
    }

    // =========================================================================
    // 3. FETCH TEAM FOLLOWERS
    // =========================================================================
    const followers = await prisma.teamFollow.findMany({
      where: whereClause,
      take: limit + 1,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        follower: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            primarySport: true,
            rank: true,
            class: true,
          },
        },
      },
    });

    // =========================================================================
    // 4. CALCULATE PAGINATION
    // =========================================================================
    const hasMore = followers.length > limit;
    const displayFollowers = hasMore ? followers.slice(0, limit) : followers;
    const nextCursor = hasMore
      ? displayFollowers[displayFollowers.length - 1]?.id
      : undefined;

    // =========================================================================
    // 5. GET TOTAL COUNT (only on first page)
    // =========================================================================
    let total = 0;
    if (!params.cursor) {
      const counters = await prisma.teamCounters.findUnique({
        where: { teamId },
        select: { followersCount: true },
      });
      total = counters?.followersCount || 0;
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ [getTeamFollowers] Fetched ${displayFollowers.length} followers for ${team.name} in ${duration}ms`
    );

    return {
      followers: displayFollowers,
      total,
      hasMore,
      nextCursor,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [getTeamFollowers] Error after ${duration}ms:`, error);

    return {
      followers: [],
      total: 0,
      hasMore: false,
    };
  }
}

// =============================================================================
// CHECK MUTUAL FOLLOW (BULK)
// =============================================================================

/**
 * Check if current user follows a list of athletes (for bulk checking)
 * @param targetIds - Array of athlete IDs to check
 * @returns Map of athleteId -> isFollowing
 */
export async function checkBulkFollowStatus(
  targetIds: string[]
): Promise<Record<any, any>> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId || targetIds.length === 0) {
      return {};
    }

    const currentUser = await prisma.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!currentUser) {
      return {};
    }

    // Fetch all follows in one query
    const follows = await prisma.follow.findMany({
      where: {
        followerId: currentUser.id,
        followingId: { in: targetIds },
      },
      select: {
        followingId: true,
      },
    });

    // Convert to map
    const followMap: Record<string, boolean> = {};
    targetIds.forEach((id) => {
      followMap[id] = false;
    });
    follows.forEach((follow) => {
      followMap[follow.followingId] = true;
    });

    return followMap;
  } catch (error) {
    console.error("[checkBulkFollowStatus] Error:", error);
    return {};
  }
}
