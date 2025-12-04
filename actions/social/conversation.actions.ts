"use server";

/**
 * =============================================================================
 * CONVERSATION SERVER ACTIONS
 * =============================================================================
 * Server actions for creating and managing conversations
 * Includes mutual follow gate for direct messages
 */

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  validateParticipants,
  validateMessageContent,
} from "@/lib/validations/message.validation";
import type {
  CreateConversationResponse,
  ConversationListResponse,
  ConversationWithDetails,
  ConversationPaginationParams,
} from "@/types/social/messaging.types";

// =============================================================================
// CREATE CONVERSATION (WITH MUTUAL FOLLOW GATE)
// =============================================================================

/**
 * Create a new conversation or return existing one
 * Enforces mutual follow requirement for direct messages
 * @param participantUsernames - Array of usernames to create conversation with
 * @param initialMessage - Optional first message content
 * @param imageUrl - Optional image URL for first message
 */
export async function createConversation(
  participantUsernames: string[],
  initialMessage?: string,
  imageUrl?: string
): Promise<CreateConversationResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [createConversation] Unauthorized - No clerkUserId");
      return {
        success: false,
        message: "You must be logged in to create conversations",
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
        `❌ [createConversation] User not found - clerkUserId: ${clerkUserId}`
      );
      return {
        success: false,
        message: "User profile not found",
        error: "USER_NOT_FOUND",
      };
    }

    console.log(
      `🔍 [createConversation] Current user: ${currentUser.username} (${currentUser.id})`
    );

    // =========================================================================
    // 3. VALIDATE PARTICIPANTS
    // =========================================================================
    const validation = validateParticipants(participantUsernames);
    if (!validation.valid) {
      console.error(
        `❌ [createConversation] Invalid participants: ${validation.error}`
      );
      return {
        success: false,
        message: validation.error || "Invalid participants",
        error: "INVALID_PARTICIPANTS",
        errorCode: "INVALID_PARTICIPANTS",
      };
    }

    // Ensure current user is not in the participants list
    const filteredUsernames = participantUsernames.filter(
      (username) => username !== currentUser.username
    );

    if (filteredUsernames.length === 0) {
      console.error("❌ [createConversation] No valid participants");
      return {
        success: false,
        message: "Cannot create conversation with yourself",
        error: "INVALID_PARTICIPANTS",
        errorCode: "INVALID_PARTICIPANTS",
      };
    }

    console.log(
      `🎯 [createConversation] Creating conversation with: ${filteredUsernames.join(
        ", "
      )}`
    );

    // =========================================================================
    // 4. FETCH PARTICIPANT USERS
    // =========================================================================
    const participantUsers = await prisma.athlete.findMany({
      where: {
        username: { in: filteredUsernames },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      },
    });

    if (participantUsers.length !== filteredUsernames.length) {
      const foundUsernames = participantUsers.map((u) => u.username);
      const missingUsernames = filteredUsernames.filter(
        (u) => !foundUsernames.includes(u)
      );

      console.error(
        `❌ [createConversation] Users not found: ${missingUsernames.join(
          ", "
        )}`
      );
      return {
        success: false,
        message: `Users not found: ${missingUsernames.join(", ")}`,
        error: "INVALID_PARTICIPANTS",
        errorCode: "INVALID_PARTICIPANTS",
      };
    }

    const participantIds = participantUsers.map((u) => u.id);
    const allParticipantIds = [currentUser.id, ...participantIds].sort();

    // =========================================================================
    // 5. MUTUAL FOLLOW CHECK (FOR DIRECT MESSAGES ONLY)
    // =========================================================================
    if (participantIds.length === 1) {
      // Direct message (1-on-1)
      const targetUserId = participantIds[0];
      const targetUsername = participantUsers[0].username;

      console.log(
        `🔒 [createConversation] Checking mutual follow: ${currentUser.username} ↔️ ${targetUsername}`
      );

      // Check both directions
      const [isFollowing, isFollowedBy] = await Promise.all([
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: targetUserId,
            },
          },
        }),
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: targetUserId,
              followingId: currentUser.id,
            },
          },
        }),
      ]);

      const isMutualFollow = !!isFollowing && !!isFollowedBy;

      if (!isMutualFollow) {
        console.warn(
          `⚠️ [createConversation] Mutual follow required - following: ${!!isFollowing}, followedBy: ${!!isFollowedBy}`
        );
        return {
          success: false,
          message: `You must follow each other to send messages to @${targetUsername}`,
          error: "MUTUAL_FOLLOW_REQUIRED",
          errorCode: "MUTUAL_FOLLOW_REQUIRED",
        };
      }

      console.log(
        `✅ [createConversation] Mutual follow confirmed with @${targetUsername}`
      );
    }

    // =========================================================================
    // 6. CHECK IF CONVERSATION EXISTS
    // =========================================================================
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            id: { in: allParticipantIds },
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // Check if participants match exactly
    if (existingConversation) {
      const existingParticipantIds = existingConversation.participants
        .map((p) => p.id)
        .sort();

      const exactMatch =
        existingParticipantIds.length === allParticipantIds.length &&
        existingParticipantIds.every(
          (id, index) => id === allParticipantIds[index]
        );

      if (exactMatch) {
        console.log(
          `ℹ️ [createConversation] Conversation already exists: ${existingConversation.id}`
        );
        return {
          success: true,
          message: "Conversation already exists",
          data: {
            conversation: existingConversation,
            firstMessage: existingConversation.messages[0],
          },
        };
      }
    }

    // =========================================================================
    // 7. CREATE NEW CONVERSATION (WITH OPTIONAL FIRST MESSAGE)
    // =========================================================================
    const result = await prisma.$transaction(async (tx) => {
      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          participants: {
            connect: allParticipantIds.map((id) => ({ id })),
          },
        },
        include: {
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

      console.log(
        `✅ [createConversation] Conversation created: ${conversation.id}`
      );

      // Create initial message if provided
      let firstMessage = undefined;
      if (initialMessage && initialMessage.trim().length > 0) {
        const contentValidation = validateMessageContent(initialMessage);
        if (contentValidation.valid) {
          firstMessage = await tx.message.create({
            data: {
              conversationId: conversation.id,
              senderId: currentUser.id,
              content: initialMessage.trim(),
              imageUrl: imageUrl || undefined,
            },
            include: {
              sender: {
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

          console.log(
            `✅ [createConversation] Initial message created: ${firstMessage.id}`
          );
        }
      }

      return { conversation, firstMessage };
    });

    // =========================================================================
    // 8. CREATE NOTIFICATIONS FOR PARTICIPANTS
    // =========================================================================
    participantIds.forEach((participantId) => {
      prisma.notification
        .create({
          data: {
            athleteId: participantId,
            actorId: currentUser.id,
            type: "NEW_MESSAGE",
            title: "New Message",
            message: `@${currentUser.username} started a conversation with you`,
            data: {
              conversationId: result.conversation.id,
              senderUsername: currentUser.username,
            },
          },
        })
        .catch((error) => {
          console.error(
            `❌ [createConversation] Failed to create notification for ${participantId}:`,
            error
          );
        });
    });

    // =========================================================================
    // 9. REVALIDATE CACHE
    // =========================================================================
    revalidatePath("/messages");

    const duration = Date.now() - startTime;
    console.log(
      `✅ [createConversation] Success in ${duration}ms - Conversation ID: ${result.conversation.id}`
    );

    return {
      success: true,
      message: "Conversation created successfully",
      data: {
        conversation: result.conversation,
        firstMessage: result.firstMessage,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [createConversation] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Stack trace:", error);

    return {
      success: false,
      message: "Failed to create conversation. Please try again.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      errorCode: "UNKNOWN_ERROR",
    };
  }
}

// =============================================================================
// GET USER CONVERSATIONS (INBOX)
// =============================================================================

/**
 * Get paginated list of user's conversations
 * @param params - Pagination parameters
 */
export async function getUserConversations(
  params: ConversationPaginationParams = {}
): Promise<any> {
  const startTime = Date.now();
  const limit = params.limit || 20;

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [getUserConversations] Unauthorized");
      return {
        conversations: [],
        hasMore: false,
        total: 0,
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
      console.error("❌ [getUserConversations] User not found");
      return {
        conversations: [],
        hasMore: false,
        total: 0,
      };
    }

    console.log(
      `🔍 [getUserConversations] Fetching conversations for ${currentUser.username}`
    );

    // =========================================================================
    // 3. BUILD QUERY WITH CURSOR PAGINATION
    // =========================================================================
    const whereClause: any = {
      participants: {
        some: {
          id: currentUser.id,
        },
      },
    };

    if (params.cursor) {
      whereClause.id = {
        lt: params.cursor,
      };
    }

    // =========================================================================
    // 4. FETCH CONVERSATIONS (limit + 1 to check if more exist)
    // =========================================================================
    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      take: limit + 1,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        participants: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
    });

    // =========================================================================
    // 5. CALCULATE PAGINATION
    // =========================================================================
    const hasMore = conversations.length > limit;
    const displayConversations = hasMore
      ? conversations.slice(0, limit)
      : conversations;
    const nextCursor = hasMore
      ? displayConversations[displayConversations.length - 1]?.id
      : undefined;

    // =========================================================================
    // 6. TRANSFORM TO CONVERSATION LIST ITEMS
    // =========================================================================
    const conversationListItems = displayConversations.map((conv) => ({
      id: conv.id,
      participants: conv.participants,
      lastMessage: conv.messages[0] || null,
      unreadCount: 0, // TODO: Implement unread tracking
      updatedAt: conv.updatedAt,
      createdAt: conv.createdAt,
    }));

    // =========================================================================
    // 7. GET TOTAL COUNT (only on first page)
    // =========================================================================
    let total = 0;
    if (!params.cursor) {
      total = await prisma.conversation.count({
        where: {
          participants: {
            some: {
              id: currentUser.id,
            },
          },
        },
      });
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ [getUserConversations] Fetched ${displayConversations.length} conversations in ${duration}ms (hasMore: ${hasMore})`
    );

    return {
      conversations: conversationListItems,
      hasMore,
      nextCursor,
      total,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [getUserConversations] Error after ${duration}ms:`,
      error
    );

    return {
      conversations: [],
      hasMore: false,
      total: 0,
    };
  }
}

// =============================================================================
// GET CONVERSATION BY ID
// =============================================================================

/**
 * Get single conversation with full details
 * @param conversationId - Conversation ID
 */
export async function getConversationById(
  conversationId: string
): Promise<any | null> {
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

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        messages: {
          take: 20,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    // Check if current user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.id === currentUser.id
    );

    if (!isParticipant) {
      console.warn(
        `⚠️ [getConversationById] User ${currentUser.id} not a participant in ${conversationId}`
      );
      return null;
    }

    return conversation;
  } catch (error) {
    console.error("[getConversationById] Error:", error);
    return null;
  }
}

// =============================================================================
// CHECK IF CONVERSATION EXISTS
// =============================================================================

/**
 * Check if conversation exists between users
 * @param participantUsernames - Array of usernames
 */
export async function findExistingConversation(
  participantUsernames: string[]
): Promise<any | null> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return null;
    }

    const currentUser = await prisma.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true, username: true },
    });

    if (!currentUser) {
      return null;
    }

    // Get participant IDs
    const participants = await prisma.athlete.findMany({
      where: {
        username: { in: participantUsernames },
      },
      select: { id: true },
    });

    if (participants.length !== participantUsernames.length) {
      return null;
    }

    const allParticipantIds = [
      currentUser.id,
      ...participants.map((p) => p.id),
    ].sort();

    // Find conversation with exact participants
    const conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            id: { in: allParticipantIds },
          },
        },
      },
      select: { id: true, participants: true },
    });

    if (!conversation) {
      return null;
    }

    // Verify exact match
    const existingParticipantIds = conversation.participants
      .map((p) => p.id)
      .sort();

    const exactMatch =
      existingParticipantIds.length === allParticipantIds.length &&
      existingParticipantIds.every(
        (id, index) => id === allParticipantIds[index]
      );

    return exactMatch ? conversation.id : null;
  } catch (error) {
    console.error("[findExistingConversation] Error:", error);
    return null;
  }
}
