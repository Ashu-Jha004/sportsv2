// lib/validations/message.validation.ts
/**
 * =============================================================================
 * MESSAGE VALIDATION UTILITIES
 * =============================================================================
 * Business logic validation for messaging operations
 */

import { z } from "zod";
import type { MessageValidation } from "@/types/social/messaging.types";

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/**
 * Send message schema
 */
export const sendMessageSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message too long (max 5000 characters)"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

/**
 * Create conversation schema
 */
export const createConversationSchema = z.object({
  participantUsernames: z
    .array(z.string().min(1, "Username cannot be empty"))
    .min(1, "At least one participant required")
    .max(50, "Too many participants (max 50)"),
  initialMessage: z
    .string()
    .max(5000, "Message too long (max 5000 characters)")
    .optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

/**
 * Message pagination schema
 */
export const messagePaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate message content
 */
export function validateMessageContent(content: string): MessageValidation {
  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      error: "Message cannot be empty",
      errorCode: "EMPTY_CONTENT",
    };
  }

  if (content.length > 5000) {
    return {
      valid: false,
      error: "Message too long (max 5000 characters)",
      errorCode: "TOO_LONG",
    };
  }

  return { valid: true };
}

/**
 * Validate conversation ID format
 */
export function validateConversationId(conversationId: string): boolean {
  // Check if valid CUID format
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(conversationId);
}

/**
 * Validate participant usernames
 */
export function validateParticipants(usernames: string[]): {
  valid: boolean;
  error?: string;
} {
  if (usernames.length === 0) {
    return {
      valid: false,
      error: "At least one participant required",
    };
  }

  if (usernames.length > 50) {
    return {
      valid: false,
      error: "Too many participants (max 50)",
    };
  }

  // Check for duplicates
  const uniqueUsernames = new Set(usernames);
  if (uniqueUsernames.size !== usernames.length) {
    return {
      valid: false,
      error: "Duplicate participants not allowed",
    };
  }

  // Check username format (alphanumeric, underscore, hyphen)
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  for (const username of usernames) {
    if (!usernameRegex.test(username)) {
      return {
        valid: false,
        error: `Invalid username format: ${username}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate image URL
 */
export function validateImageUrl(url?: string): {
  valid: boolean;
  error?: string;
} {
  if (!url) {
    return { valid: true };
  }

  try {
    const parsedUrl = new URL(url);

    // Check if URL is HTTPS
    if (parsedUrl.protocol !== "https:") {
      return {
        valid: false,
        error: "Image URL must use HTTPS",
      };
    }

    // Check if URL points to allowed domains (Cloudinary, etc.)
    const allowedDomains = [
      "res.cloudinary.com",
      "cloudinary.com",
      // Add your other allowed image hosting domains
    ];

    const isAllowedDomain = allowedDomains.some((domain) =>
      parsedUrl.hostname.includes(domain)
    );

    if (!isAllowedDomain) {
      return {
        valid: false,
        error: "Image URL must be from an allowed domain",
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Invalid URL format",
    };
  }
}

/**
 * Check if user can access conversation
 */
export function canAccessConversation(
  conversationParticipantIds: string[],
  currentUserId: string
): boolean {
  return conversationParticipantIds.includes(currentUserId);
}

/**
 * Generate temporary message ID for optimistic updates
 */
export function generateTempMessageId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if message ID is temporary (optimistic)
 */
export function isTempMessageId(messageId: string): boolean {
  return messageId.startsWith("temp_");
}
