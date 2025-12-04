"use server";

/**
 * =============================================================================
 * TEAM FOLLOW SERVER ACTIONS
 * =============================================================================
 * Server actions for following/unfollowing teams
 * Includes optimistic update support and real-time counter updates
 */

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateTeamFollowAction } from "@/lib/validations/follow.validation";
import type {
  TeamFollowActionResponse,
  TeamFollowStatus,
} from "@/types/social/follow.types";

// =============================================================================
// FOLLOW TEAM
// =============================================================================

/**
 * Follow a team by team ID
 * @param teamId - ID of team to follow
 * @returns Team follow action response with updated counts
 */
export async function followTeam(
  teamId: string
): Promise<TeamFollowActionResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [followTeam] Unauthorized - No clerkUserId");
      return {
        success: false,
        message: "You must be logged in to follow teams",
        error: "UNAUTHORIZED",
      };
    }

    // =========================================================================
    // 2. GET CURRENT USER
    // =========================================================================
    const currentUser = await prisma.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true, username: true },
    });

    if (!currentUser) {
      console.error(
        `❌ [followTeam] User not found - clerkUserId: ${clerkUserId}`
      );
      return {
        success: false,
        message: "User profile not found",
        error: "USER_NOT_FOUND",
      };
    }

    console.log(
      `🔍 [followTeam] Current user: ${currentUser.username} (${currentUser.id})`
    );

    // =========================================================================
    // 3. VALIDATE TEAM ID
    // =========================================================================
    const validation = validateTeamFollowAction(currentUser.id, teamId);
    if (!validation.valid) {
      console.error(`❌ [followTeam] Validation failed: ${validation.error}`);
      return {
        success: false,
        message: validation.error || "Invalid team",
        error: "VALIDATION_FAILED",
      };
    }

    // =========================================================================
    // 4. GET TARGET TEAM
    // =========================================================================
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!team) {
      console.error(`❌ [followTeam] Team not found - teamId: ${teamId}`);
      return {
        success: false,
        message: "Team not found",
        error: "TEAM_NOT_FOUND",
      };
    }

    console.log(`🎯 [followTeam] Target team: ${team.name} (${team.id})`);

    // =========================================================================
    // 5. CHECK TEAM STATUS
    // =========================================================================
    if (team.status === "REVOKED" || team.status === "EXPIRED") {
      console.warn(`⚠️ [followTeam] Team is ${team.status}: ${team.name}`);
      return {
        success: false,
        message: `Cannot follow ${team.status.toLowerCase()} team`,
        error: "TEAM_INACTIVE",
      };
    }

    // =========================================================================
    // 6. CHECK IF ALREADY FOLLOWING
    // =========================================================================
    const existingFollow = await prisma.teamFollow.findUnique({
      where: {
        followerId_teamId: {
          followerId: currentUser.id,
          teamId: team.id,
        },
      },
    });

    if (existingFollow) {
      console.warn(`⚠️ [followTeam] Already following ${team.name}`);
      return {
        success: false,
        message: `You are already following ${team.name}`,
        error: "ALREADY_FOLLOWING",
      };
    }

    // =========================================================================
    // 7. CREATE FOLLOW RELATIONSHIP + UPDATE COUNTERS (TRANSACTION)
    // =========================================================================
    const result = await prisma.$transaction(async (tx) => {
      // Create team follow relationship
      const newFollow = await tx.teamFollow.create({
        data: {
          followerId: currentUser.id,
          teamId: team.id,
        },
      });

      console.log(`✅ [followTeam] Team follow created: ${newFollow.id}`);

      // Update team follower counter (upsert to handle missing counters)
      const teamCounters = await tx.teamCounters.upsert({
        where: { teamId: team.id },
        create: {
          teamId: team.id,
          followersCount: 1,
          membersCount: 0,
          postsCount: 0,
          matchesPlayed: 0,
        },
        update: {
          followersCount: { increment: 1 },
        },
        select: { followersCount: true },
      });

      console.log(
        `📊 [followTeam] Team counters updated - Followers: ${teamCounters.followersCount}`
      );

      return {
        newFollow,
        followerCount: teamCounters.followersCount,
      };
    });

    // =========================================================================
    // 8. CREATE NOTIFICATION FOR TEAM OWNER (ASYNC - NON-BLOCKING)
    // =========================================================================
    prisma.notification
      .create({
        data: {
          athleteId: (await prisma.team.findUnique({
            where: { id: team.id },
            select: { ownerId: true },
          }))!.ownerId,
          actorId: currentUser.id,
          type: "FOLLOW",
          title: "New Team Follower",
          message: `@${currentUser.username} started following ${team.name}`,
          data: {
            followerUsername: currentUser.username,
            followerId: currentUser.id,
            teamId: team.id,
            teamName: team.name,
          },
        },
      })
      .catch((error) => {
        console.error("❌ [followTeam] Notification creation failed:", error);
      });

    // =========================================================================
    // 9. REVALIDATE CACHE
    // =========================================================================
    revalidatePath(`/team/${teamId}`);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [followTeam] Success in ${duration}ms - ${currentUser.username} → ${team.name}`
    );

    return {
      success: true,
      message: `You are now following ${team.name}`,
      data: {
        isFollowing: true,
        followerCount: result.followerCount,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [followTeam] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Stack trace:", error);

    return {
      success: false,
      message: "Failed to follow team. Please try again.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// =============================================================================
// UNFOLLOW TEAM
// =============================================================================

/**
 * Unfollow a team by team ID
 * @param teamId - ID of team to unfollow
 * @returns Team follow action response with updated counts
 */
export async function unfollowTeam(
  teamId: string
): Promise<TeamFollowActionResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [unfollowTeam] Unauthorized - No clerkUserId");
      return {
        success: false,
        message: "You must be logged in to unfollow teams",
        error: "UNAUTHORIZED",
      };
    }

    // =========================================================================
    // 2. GET CURRENT USER
    // =========================================================================
    const currentUser = await prisma.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true, username: true },
    });

    if (!currentUser) {
      console.error(
        `❌ [unfollowTeam] User not found - clerkUserId: ${clerkUserId}`
      );
      return {
        success: false,
        message: "User profile not found",
        error: "USER_NOT_FOUND",
      };
    }

    console.log(
      `🔍 [unfollowTeam] Current user: ${currentUser.username} (${currentUser.id})`
    );

    // =========================================================================
    // 3. GET TARGET TEAM
    // =========================================================================
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, name: true },
    });

    if (!team) {
      console.error(`❌ [unfollowTeam] Team not found - teamId: ${teamId}`);
      return {
        success: false,
        message: "Team not found",
        error: "TEAM_NOT_FOUND",
      };
    }

    console.log(`🎯 [unfollowTeam] Target team: ${team.name} (${team.id})`);

    // =========================================================================
    // 4. CHECK IF FOLLOW EXISTS
    // =========================================================================
    const existingFollow = await prisma.teamFollow.findUnique({
      where: {
        followerId_teamId: {
          followerId: currentUser.id,
          teamId: team.id,
        },
      },
    });

    if (!existingFollow) {
      console.warn(`⚠️ [unfollowTeam] Not following ${team.name}`);
      return {
        success: false,
        message: `You are not following ${team.name}`,
        error: "NOT_FOLLOWING",
      };
    }

    // =========================================================================
    // 5. DELETE FOLLOW RELATIONSHIP + UPDATE COUNTERS (TRANSACTION)
    // =========================================================================
    const result = await prisma.$transaction(async (tx) => {
      // Delete team follow relationship
      await tx.teamFollow.delete({
        where: {
          followerId_teamId: {
            followerId: currentUser.id,
            teamId: team.id,
          },
        },
      });

      console.log(
        `✅ [unfollowTeam] Team follow deleted: ${existingFollow.id}`
      );

      // Update team follower counter
      const teamCounters = await tx.teamCounters.update({
        where: { teamId: team.id },
        data: {
          followersCount: { decrement: 1 },
        },
        select: { followersCount: true },
      });

      console.log(
        `📊 [unfollowTeam] Team counters updated - Followers: ${teamCounters.followersCount}`
      );

      return {
        followerCount: teamCounters.followersCount,
      };
    });

    // =========================================================================
    // 6. REVALIDATE CACHE
    // =========================================================================
    revalidatePath(`/team/${teamId}`);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [unfollowTeam] Success in ${duration}ms - ${currentUser.username} ⛔ ${team.name}`
    );

    return {
      success: true,
      message: `You unfollowed ${team.name}`,
      data: {
        isFollowing: false,
        followerCount: result.followerCount,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [unfollowTeam] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Stack trace:", error);

    return {
      success: false,
      message: "Failed to unfollow team. Please try again.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// =============================================================================
// GET TEAM FOLLOW STATUS
// =============================================================================

/**
 * Check if current user is following a team
 * @param teamId - Team ID to check follow status
 * @returns Team follow status with follower count
 */
export async function getTeamFollowStatus(
  teamId: string
): Promise<TeamFollowStatus | null> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return null;
    }

    const currentUser = await prisma.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!currentUser) {
      return null;
    }

    // Check if following and get follower count in parallel
    const [isFollowing, teamCounters] = await Promise.all([
      prisma.teamFollow.findUnique({
        where: {
          followerId_teamId: {
            followerId: currentUser.id,
            teamId: teamId,
          },
        },
      }),
      prisma.teamCounters.findUnique({
        where: { teamId },
        select: { followersCount: true },
      }),
    ]);

    return {
      isFollowing: !!isFollowing,
      followerCount: teamCounters?.followersCount || 0,
    };
  } catch (error) {
    console.error("[getTeamFollowStatus] Error:", error);
    return null;
  }
}

// =============================================================================
// GET TEAM FOLLOWERS COUNT
// =============================================================================

/**
 * Get follower count for a team (public endpoint)
 * @param teamId - Team ID
 * @returns Follower count
 */
export async function getTeamFollowerCount(teamId: string): Promise<number> {
  try {
    const counters = await prisma.teamCounters.findUnique({
      where: { teamId },
      select: { followersCount: true },
    });

    return counters?.followersCount || 0;
  } catch (error) {
    console.error("[getTeamFollowerCount] Error:", error);
    return 0;
  }
}
