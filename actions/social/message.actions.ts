"use server";

/**
 * =============================================================================
 * MESSAGE SERVER ACTIONS
 * =============================================================================
 * Server actions for sending, fetching, and managing messages
 */

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  validateMessageContent,
  validateConversationId,
  canAccessConversation,
} from "@/lib/validations/message.validation";
import type {
  SendMessageResponse,
  DeleteMessageResponse,
  MessageListResponse,
  MessagePaginationParams,
} from "@/types/social/messaging.types";

// =============================================================================
// SEND MESSAGE
// =============================================================================

/**
 * Send a message to a conversation
 * @param conversationId - Conversation ID
 * @param content - Message content
 * @param imageUrl - Optional image URL
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  imageUrl?: string
): Promise<SendMessageResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [sendMessage] Unauthorized - No clerkUserId");
      return {
        success: false,
        message: "You must be logged in to send messages",
        error: "UNAUTHORIZED",
      };
    }

    // =========================================================================
    // 2. GET CURRENT USER
    // =========================================================================
    const currentUser = await prisma.athlete.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      },
    });

    if (!currentUser) {
      console.error(
        `❌ [sendMessage] User not found - clerkUserId: ${clerkUserId}`
      );
      return {
        success: false,
        message: "User profile not found",
        error: "USER_NOT_FOUND",
      };
    }

    console.log(
      `🔍 [sendMessage] User: ${currentUser.username} (${currentUser.id})`
    );

    // =========================================================================
    // 3. VALIDATE MESSAGE CONTENT
    // =========================================================================
    const contentValidation = validateMessageContent(content);
    if (!contentValidation.valid) {
      console.error(
        `❌ [sendMessage] Invalid content: ${contentValidation.error}`
      );
      return {
        success: false,
        message: contentValidation.error || "Invalid message content",
        error: contentValidation.errorCode || "INVALID_CONTENT",
      };
    }

    // =========================================================================
    // 4. VALIDATE CONVERSATION ID
    // =========================================================================
    if (!validateConversationId(conversationId)) {
      console.error(
        `❌ [sendMessage] Invalid conversation ID: ${conversationId}`
      );
      return {
        success: false,
        message: "Invalid conversation ID",
        error: "INVALID_CONVERSATION_ID",
      };
    }

    // =========================================================================
    // 5. GET CONVERSATION & CHECK ACCESS
    // =========================================================================
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        participants: {
          select: { id: true },
        },
      },
    });

    if (!conversation) {
      console.error(
        `❌ [sendMessage] Conversation not found: ${conversationId}`
      );
      return {
        success: false,
        message: "Conversation not found",
        error: "CONVERSATION_NOT_FOUND",
      };
    }

    // Check if user is a participant
    const participantIds = conversation.participants.map((p) => p.id);
    if (!canAccessConversation(participantIds, currentUser.id)) {
      console.error(
        `❌ [sendMessage] User ${currentUser.id} not a participant in ${conversationId}`
      );
      return {
        success: false,
        message: "You are not a participant in this conversation",
        error: "NOT_PARTICIPANT",
      };
    }

    console.log(
      `✅ [sendMessage] Access granted to conversation ${conversationId}`
    );

    // =========================================================================
    // 6. CREATE MESSAGE & UPDATE CONVERSATION TIMESTAMP (TRANSACTION)
    // =========================================================================
    const result = await prisma.$transaction(async (tx) => {
      // Create message
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: currentUser.id,
          content: content.trim(),
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

      console.log(`✅ [sendMessage] Message created: ${message.id}`);

      // Update conversation's updatedAt timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });

    // =========================================================================
    // 7. CREATE NOTIFICATIONS FOR OTHER PARTICIPANTS (ASYNC)
    // =========================================================================
    const otherParticipantIds = participantIds.filter(
      (id) => id !== currentUser.id
    );

    otherParticipantIds.forEach((participantId) => {
      prisma.notification
        .create({
          data: {
            athleteId: participantId,
            actorId: currentUser.id,
            type: "NEW_MESSAGE",
            title: "New Message",
            message: `@${currentUser.username}: ${content.substring(0, 50)}${
              content.length > 50 ? "..." : ""
            }`,
            data: {
              conversationId,
              messageId: result.id,
              senderUsername: currentUser.username,
            },
          },
        })
        .catch((error) => {
          console.error(
            `❌ [sendMessage] Failed to create notification for ${participantId}:`,
            error
          );
        });
    });

    // =========================================================================
    // 8. REVALIDATE CACHE
    // =========================================================================
    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [sendMessage] Success in ${duration}ms - Message ID: ${result.id}`
    );

    return {
      success: true,
      message: "Message sent successfully",
      data: {
        message: result,
        conversationId,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [sendMessage] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Stack trace:", error);

    return {
      success: false,
      message: "Failed to send message. Please try again.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// =============================================================================
// GET CONVERSATION MESSAGES (PAGINATED)
// =============================================================================

/**
 * Get paginated messages for a conversation
 * @param conversationId - Conversation ID
 * @param params - Pagination parameters
 */
export async function getConversationMessages(
  conversationId: string,
  params: MessagePaginationParams = {}
): Promise<MessageListResponse> {
  const startTime = Date.now();
  const limit = params.limit || 20;

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [getConversationMessages] Unauthorized");
      return {
        messages: [],
        hasMore: false,
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
      console.error("❌ [getConversationMessages] User not found");
      return {
        messages: [],
        hasMore: false,
      };
    }

    console.log(
      `🔍 [getConversationMessages] Fetching messages for conversation ${conversationId}`
    );

    // =========================================================================
    // 3. VALIDATE CONVERSATION ID
    // =========================================================================
    if (!validateConversationId(conversationId)) {
      console.error(
        `❌ [getConversationMessages] Invalid conversation ID: ${conversationId}`
      );
      return {
        messages: [],
        hasMore: false,
      };
    }

    // =========================================================================
    // 4. GET CONVERSATION & CHECK ACCESS
    // =========================================================================
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participants: {
          select: { id: true },
        },
      },
    });

    if (!conversation) {
      console.error(
        `❌ [getConversationMessages] Conversation not found: ${conversationId}`
      );
      return {
        messages: [],
        hasMore: false,
      };
    }

    // Check access
    const participantIds = conversation.participants.map((p) => p.id);
    if (!canAccessConversation(participantIds, currentUser.id)) {
      console.error(
        `❌ [getConversationMessages] User ${currentUser.id} not a participant`
      );
      return {
        messages: [],
        hasMore: false,
      };
    }

    // =========================================================================
    // 5. BUILD QUERY WITH CURSOR PAGINATION
    // =========================================================================
    const whereClause: any = {
      conversationId,
    };

    if (params.cursor) {
      whereClause.id = {
        lt: params.cursor, // Get messages before this cursor (older messages)
      };
    }

    // =========================================================================
    // 6. FETCH MESSAGES (limit + 1 to check if more exist)
    // =========================================================================
    const messages = await prisma.message.findMany({
      where: whereClause,
      take: limit + 1,
      orderBy: {
        createdAt: "desc", // Newest first
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

    // =========================================================================
    // 7. CALCULATE PAGINATION
    // =========================================================================
    const hasMore = messages.length > limit;
    const displayMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore
      ? displayMessages[displayMessages.length - 1]?.id
      : undefined;

    // =========================================================================
    // 8. GET TOTAL COUNT (only on first page)
    // =========================================================================
    let total = undefined;
    if (!params.cursor) {
      total = await prisma.message.count({
        where: { conversationId },
      });
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ [getConversationMessages] Fetched ${displayMessages.length} messages in ${duration}ms (hasMore: ${hasMore})`
    );

    return {
      messages: displayMessages,
      hasMore,
      nextCursor,
      total,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [getConversationMessages] Error after ${duration}ms:`,
      error
    );

    return {
      messages: [],
      hasMore: false,
    };
  }
}

// =============================================================================
// DELETE MESSAGE
// =============================================================================

/**
 * Delete a message (only sender can delete)
 * @param messageId - Message ID to delete
 */
export async function deleteMessage(
  messageId: string
): Promise<DeleteMessageResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // 1. AUTHENTICATION CHECK
    // =========================================================================
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ [deleteMessage] Unauthorized - No clerkUserId");
      return {
        success: false,
        message: "You must be logged in to delete messages",
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
        `❌ [deleteMessage] User not found - clerkUserId: ${clerkUserId}`
      );
      return {
        success: false,
        message: "User profile not found",
        error: "USER_NOT_FOUND",
      };
    }

    console.log(
      `🔍 [deleteMessage] User: ${currentUser.username} attempting to delete message ${messageId}`
    );

    // =========================================================================
    // 3. GET MESSAGE & CHECK OWNERSHIP
    // =========================================================================
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        conversationId: true,
      },
    });

    if (!message) {
      console.error(`❌ [deleteMessage] Message not found: ${messageId}`);
      return {
        success: false,
        message: "Message not found",
        error: "MESSAGE_NOT_FOUND",
      };
    }

    // Check if user is the sender
    if (message.senderId !== currentUser.id) {
      console.error(
        `❌ [deleteMessage] User ${currentUser.id} is not the sender of message ${messageId}`
      );
      return {
        success: false,
        message: "You can only delete your own messages",
        error: "NOT_MESSAGE_OWNER",
      };
    }

    // =========================================================================
    // 4. DELETE MESSAGE
    // =========================================================================
    await prisma.message.delete({
      where: { id: messageId },
    });

    console.log(`✅ [deleteMessage] Message deleted: ${messageId}`);

    // =========================================================================
    // 5. REVALIDATE CACHE
    // =========================================================================
    revalidatePath("/messages");
    revalidatePath(`/messages/${message.conversationId}`);

    const duration = Date.now() - startTime;
    console.log(`✅ [deleteMessage] Success in ${duration}ms`);

    return {
      success: true,
      message: "Message deleted successfully",
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [deleteMessage] Error after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Stack trace:", error);

    return {
      success: false,
      message: "Failed to delete message. Please try again.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// =============================================================================
// GET LATEST MESSAGE FOR CONVERSATION
// =============================================================================

/**
 * Get the most recent message in a conversation (for inbox preview)
 * @param conversationId - Conversation ID
 */
export async function getLatestMessage(conversationId: string) {
  try {
    const message = await prisma.message.findFirst({
      where: { conversationId },
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
    });

    return message;
  } catch (error) {
    console.error("[getLatestMessage] Error:", error);
    return null;
  }
}

// =============================================================================
// MARK MESSAGES AS READ (FOR FUTURE USE)
// =============================================================================

/**
 * Mark all messages in a conversation as read
 * @param conversationId - Conversation ID
 */
export async function markMessagesAsRead(
  conversationId: string
): Promise<boolean> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return false;
    }

    const currentUser = await prisma.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!currentUser) {
      return false;
    }

    // Verify access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participants: {
          select: { id: true },
        },
      },
    });

    if (!conversation) {
      return false;
    }

    const participantIds = conversation.participants.map((p) => p.id);
    if (!canAccessConversation(participantIds, currentUser.id)) {
      return false;
    }

    // TODO: Implement read receipts tracking in a separate table
    // For now, just return true as placeholder
    console.log(
      `📬 [markMessagesAsRead] Marked messages as read in ${conversationId} for user ${currentUser.id}`
    );

    return true;
  } catch (error) {
    console.error("[markMessagesAsRead] Error:", error);
    return false;
  }
}
