"use server";

/**
 * =============================================================================
 * ATHLETE FOLLOW SERVER ACTIONS
 * =============================================================================
 * Server actions for following/unfollowing athletes
 * Includes optimistic update support and real-time counter updates
 */

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  validateFollowAction,
  validateNotSelfFollow,
} from "@/lib/validations/follow.validation";
import type {
  FollowActionResponse,
  FollowStatus,
} from "@/types/social/follow.types";

// =============================================================================
// FOLLOW ATHLETE
// =============================================================================

/**
 * Follow an athlete by username
 * @param targetUsername - Username of athlete to follow
 * @returns Follow action response with updated counts
 */
export async function followAthlete(
  targetUsername: string
): Promise<FollowActionResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [followAthlete] Unauthorized - No clerkUserId");
      return {
        success: false,
        message: "You must be logged in to follow athletes",
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
        `❌ [followAthlete] User not found - clerkUserId: ${clerkUserId}`
      );
      return {
        success: false,
        message: "User profile not found",
        error: "USER_NOT_FOUND",
      };
    }

    console.log(
      `🔍 [followAthlete] Current user: ${currentUser.username} (${currentUser.id})`
    );

    // =========================================================================
    // 3. GET TARGET USER
    // =========================================================================
    const targetUser = await prisma.athlete.findUnique({
      where: { username: targetUsername },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      console.error(
        `❌ [followAthlete] Target user not found - username: ${targetUsername}`
      );
      return {
        success: false,
        message: `User @${targetUsername} not found`,
        error: "TARGET_NOT_FOUND",
      };
    }

    console.log(
      `🎯 [followAthlete] Target user: ${targetUser.username} (${targetUser.id})`
    );

    // =========================================================================
    // 4. VALIDATION
    // =========================================================================
    const validation = validateNotSelfFollow(currentUser.id, targetUser.id);
    if (!validation.valid) {
      console.error(
        `❌ [followAthlete] Validation failed: ${validation.error}`
      );
      return {
        success: false,
        message: validation.error || "Cannot follow this user",
        error: "VALIDATION_FAILED",
      };
    }

    // =========================================================================
    // 5. CHECK IF ALREADY FOLLOWING
    // =========================================================================
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      console.warn(
        `⚠️ [followAthlete] Already following ${targetUser.username}`
      );
      return {
        success: false,
        message: `You are already following @${targetUser.username}`,
        error: "ALREADY_FOLLOWING",
      };
    }

    // =========================================================================
    // 6. CREATE FOLLOW RELATIONSHIP + UPDATE COUNTERS (TRANSACTION)
    // =========================================================================
    const result = await prisma.$transaction(async (tx) => {
      // Create follow relationship
      const newFollow = await tx.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      });

      console.log(`✅ [followAthlete] Follow created: ${newFollow.id}`);

      // Update follower counters (upsert to handle missing counters)
      const [followerCounters, followingCounters] = await Promise.all([
        // Increment target user's follower count
        tx.athleteCounters.upsert({
          where: { athleteId: targetUser.id },
          create: {
            athleteId: targetUser.id,
            followersCount: 1,
            followingCount: 0,
            postsCount: 0,
          },
          update: {
            followersCount: { increment: 1 },
          },
          select: { followersCount: true },
        }),

        // Increment current user's following count
        tx.athleteCounters.upsert({
          where: { athleteId: currentUser.id },
          create: {
            athleteId: currentUser.id,
            followersCount: 0,
            followingCount: 1,
            postsCount: 0,
          },
          update: {
            followingCount: { increment: 1 },
          },
          select: { followingCount: true },
        }),
      ]);

      console.log(
        `📊 [followAthlete] Counters updated - Target followers: ${followerCounters.followersCount}, Current following: ${followingCounters.followingCount}`
      );

      return {
        newFollow,
        targetFollowerCount: followerCounters.followersCount,
        currentFollowingCount: followingCounters.followingCount,
      };
    });

    // =========================================================================
    // 7. CREATE NOTIFICATION (ASYNC - NON-BLOCKING)
    // =========================================================================
    prisma.notification
      .create({
        data: {
          athleteId: targetUser.id,
          actorId: currentUser.id,
          type: "NEW_FOLLOWER",
          title: "New Follower",
          message: `@${currentUser.username} started following you`,
          data: {
            followerUsername: currentUser.username,
            followerId: currentUser.id,
          },
        },
      })
      .catch((error) => {
        console.error(
          "❌ [followAthlete] Notification creation failed:",
          error
        );
      });

    // =========================================================================
    // 8. REVALIDATE CACHE
    // =========================================================================
    revalidatePath(`/profile/${targetUsername}`);
    revalidatePath(`/profile/${currentUser.username}`);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [followAthlete] Success in ${duration}ms - ${currentUser.username} → ${targetUser.username}`
    );

    return {
      success: true,
      message: `You are now following @${targetUser.username}`,
      data: {
        isFollowing: true,
        followerCount: result.targetFollowerCount,
        followingCount: result.currentFollowingCount,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [followAthlete] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Stack trace:", error);

    return {
      success: false,
      message: "Failed to follow athlete. Please try again.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// =============================================================================
// UNFOLLOW ATHLETE
// =============================================================================

/**
 * Unfollow an athlete by username
 * @param targetUsername - Username of athlete to unfollow
 * @returns Follow action response with updated counts
 */
export async function unfollowAthlete(
  targetUsername: string
): Promise<FollowActionResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [unfollowAthlete] Unauthorized - No clerkUserId");
      return {
        success: false,
        message: "You must be logged in to unfollow athletes",
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
        `❌ [unfollowAthlete] User not found - clerkUserId: ${clerkUserId}`
      );
      return {
        success: false,
        message: "User profile not found",
        error: "USER_NOT_FOUND",
      };
    }

    console.log(
      `🔍 [unfollowAthlete] Current user: ${currentUser.username} (${currentUser.id})`
    );

    // =========================================================================
    // 3. GET TARGET USER
    // =========================================================================
    const targetUser = await prisma.athlete.findUnique({
      where: { username: targetUsername },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      console.error(
        `❌ [unfollowAthlete] Target user not found - username: ${targetUsername}`
      );
      return {
        success: false,
        message: `User @${targetUsername} not found`,
        error: "TARGET_NOT_FOUND",
      };
    }

    console.log(
      `🎯 [unfollowAthlete] Target user: ${targetUser.username} (${targetUser.id})`
    );

    // =========================================================================
    // 4. CHECK IF FOLLOW EXISTS
    // =========================================================================
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    if (!existingFollow) {
      console.warn(`⚠️ [unfollowAthlete] Not following ${targetUser.username}`);
      return {
        success: false,
        message: `You are not following @${targetUser.username}`,
        error: "NOT_FOLLOWING",
      };
    }

    // =========================================================================
    // 5. DELETE FOLLOW RELATIONSHIP + UPDATE COUNTERS (TRANSACTION)
    // =========================================================================
    const result = await prisma.$transaction(async (tx) => {
      // Delete follow relationship
      await tx.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUser.id,
          },
        },
      });

      console.log(`✅ [unfollowAthlete] Follow deleted: ${existingFollow.id}`);

      // Update follower counters
      const [followerCounters, followingCounters] = await Promise.all([
        // Decrement target user's follower count
        tx.athleteCounters.update({
          where: { athleteId: targetUser.id },
          data: {
            followersCount: { decrement: 1 },
          },
          select: { followersCount: true },
        }),

        // Decrement current user's following count
        tx.athleteCounters.update({
          where: { athleteId: currentUser.id },
          data: {
            followingCount: { decrement: 1 },
          },
          select: { followingCount: true },
        }),
      ]);

      console.log(
        `📊 [unfollowAthlete] Counters updated - Target followers: ${followerCounters.followersCount}, Current following: ${followingCounters.followingCount}`
      );

      return {
        targetFollowerCount: followerCounters.followersCount,
        currentFollowingCount: followingCounters.followingCount,
      };
    });

    // =========================================================================
    // 6. REVALIDATE CACHE
    // =========================================================================
    revalidatePath(`/profile/${targetUsername}`);
    revalidatePath(`/profile/${currentUser.username}`);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [unfollowAthlete] Success in ${duration}ms - ${currentUser.username} ⛔ ${targetUser.username}`
    );

    return {
      success: true,
      message: `You unfollowed @${targetUser.username}`,
      data: {
        isFollowing: false,
        followerCount: result.targetFollowerCount,
        followingCount: result.currentFollowingCount,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [unfollowAthlete] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Stack trace:", error);

    return {
      success: false,
      message: "Failed to unfollow athlete. Please try again.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// =============================================================================
// GET FOLLOW STATUS
// =============================================================================

/**
 * Check follow status between current user and target athlete
 * @param targetUsername - Username to check follow status
 * @returns Follow status including mutual follow check
 */
export async function getFollowStatus(
  targetUsername: string
): Promise<FollowStatus | null> {
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

    const targetUser = await prisma.athlete.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    });

    if (!targetUser) {
      return null;
    }

    // Check both directions in parallel
    const [isFollowing, isFollowedBy] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUser.id,
          },
        },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: targetUser.id,
            followingId: currentUser.id,
          },
        },
      }),
    ]);

    const following = !!isFollowing;
    const followedBy = !!isFollowedBy;
    const mutual = following && followedBy;

    return {
      isFollowing: following,
      isFollowedBy: followedBy,
      isMutual: mutual,
      canMessage: mutual, // Mutual follow required for messaging
    };
  } catch (error) {
    console.error("[getFollowStatus] Error:", error);
    return null;
  }
}
