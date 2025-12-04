"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createConversation } from "./conversation.actions";

/**
 * Create group chat with multiple participants
 */
export async function createGroupChat(
  name: string,
  participantUsernames: string[],
  description?: string,
  avatarUrl?: string
): Promise<any> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "UNAUTHORIZED" };

  try {
    const currentUser = await prisma.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true, username: true },
    });

    if (!currentUser) return { success: false, error: "USER_NOT_FOUND" };

    // Validate participants (min 2 others + creator = 3 total)
    if (participantUsernames.length < 2) {
      return {
        success: false,
        error: "Group needs at least 3 members (you + 2 others)",
      };
    }

    const participants = await prisma.athlete.findMany({
      where: { username: { in: participantUsernames } },
      select: { id: true },
    });

    if (participants.length !== participantUsernames.length) {
      return { success: false, error: "Some users not found" };
    }

    const allParticipantIds = [
      currentUser.id,
      ...participants.map((p) => p.id),
    ];

    // Check existing group
    const existing = await prisma.conversation.findFirst({
      where: {
        name,
        participants: { every: { id: { in: allParticipantIds } } },
      },
    });

    if (existing) {
      return {
        success: true,
        data: { conversationId: existing.id },
        message: "Group already exists",
      };
    }

    // Create group
    const conversation = await prisma.conversation.create({
      data: {
        name,
        description,
        avatarUrl,
        isGroup: true,
        adminIds: [currentUser.id], // Creator is admin
        participants: {
          connect: allParticipantIds.map((id) => ({ id })),
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        participants: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    return {
      success: true,
      data: { conversationId: conversation.id },
      message: `Created group "${name}"`,
    };
  } catch (error) {
    console.error("[createGroupChat]", error);
    return { success: false, error: "FAILED_TO_CREATE_GROUP" };
  }
}

/**
 * Add participant to group (admin only)
 */
export async function addParticipantToGroup(
  conversationId: string,
  username: string
): Promise<any> {
  // ... implementation similar to createConversation
  // Check admin permissions, mutual follows, etc.
}

/**
 * Remove participant from group (admin only)
 */
export async function removeParticipantFromGroup(
  conversationId: string,
  username: string
): Promise<any> {
  // ... implementation
}

/**
 * Update group info (admin only)
 */
export async function updateGroupInfo(
  conversationId: string,
  data: { name?: string; description?: string; avatarUrl?: string }
) {
  // ... implementation
}
