// types/social/messaging.types.ts
/**
 * =============================================================================
 * MESSAGING SYSTEM TYPES
 * =============================================================================
 * Type definitions for conversations and messages
 */

import { Athlete, Conversation, Message } from "@prisma/client";

// =============================================================================
// BASIC MESSAGE TYPES
// =============================================================================

/**
 * Message with sender details
 */
export type MessageWithSender = Message & {
  sender: Pick<
    Athlete,
    "id" | "username" | "firstName" | "lastName" | "profileImage"
  >;
};

/**
 * Message with full conversation context
 */
export type MessageWithConversation = Message & {
  sender: Pick<
    Athlete,
    "id" | "username" | "firstName" | "lastName" | "profileImage"
  >;
  conversation: {
    id: string;
    participants: Pick<
      Athlete,
      "id" | "username" | "firstName" | "lastName" | "profileImage"
    >[];
  };
};

// =============================================================================
// CONVERSATION TYPES
// =============================================================================

/**
 * Conversation with participants
 */
export type ConversationWithParticipants = Conversation & {
  participants: Pick<
    Athlete,
    "id" | "username" | "firstName" | "lastName" | "profileImage"
  >[];
};

/**
 * Conversation with participants and last message
 */
export type ConversationWithDetails = Conversation & {
  participants: Pick<
    Athlete,
    "id" | "username" | "firstName" | "lastName" | "profileImage"
  >[];
  messages: MessageWithSender[];
  _count?: {
    messages: number;
  };
};

/**
 * Conversation list item (for inbox)
 */
export interface ConversationListItem {
  id: string;
  participants: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  }[];
  lastMessage: {
    id: string;
    content: string;
    imageUrl: string | null;
    createdAt: Date;
    senderId: string;
  } | null;
  unreadCount: number;
  updatedAt: Date;
  createdAt: Date;
}

// =============================================================================
// MESSAGE CREATION TYPES
// =============================================================================

/**
 * Create message input
 */
export interface CreateMessageInput {
  conversationId: string;
  content: string;
  imageUrl?: string;
}

/**
 * Create conversation input (for direct messages)
 */
export interface CreateConversationInput {
  participantUsernames: string[]; // Array of usernames to start conversation with
  initialMessage?: string; // Optional first message
  imageUrl?: string; // Optional image in first message
}

// =============================================================================
// PAGINATION TYPES
// =============================================================================

/**
 * Message pagination params
 */
export interface MessagePaginationParams {
  limit?: number;
  cursor?: string; // Message ID to paginate from
}

/**
 * Conversation pagination params
 */
export interface ConversationPaginationParams {
  limit?: number;
  cursor?: string; // Conversation ID to paginate from
}

/**
 * Paginated message list response
 */
export interface MessageListResponse {
  messages: MessageWithSender[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

/**
 * Paginated conversation list response
 */
export interface ConversationListResponse {
  conversations: ConversationListItem[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

// =============================================================================
// ACTION RESPONSE TYPES
// =============================================================================

/**
 * Send message response
 */
export interface SendMessageResponse {
  success: boolean;
  message: string;
  data?: {
    message: MessageWithSender;
    conversationId: string;
  };
  error?: string;
}

/**
 * Create conversation response
 */
export interface CreateConversationResponse {
  success: boolean;
  message: string;
  data?: {
    conversation: ConversationWithParticipants;
    firstMessage?: MessageWithSender;
  };
  error?: string;
  errorCode?:
    | "MUTUAL_FOLLOW_REQUIRED"
    | "CONVERSATION_EXISTS"
    | "INVALID_PARTICIPANTS"
    | "UNKNOWN_ERROR";
}

/**
 * Delete message response
 */
export interface DeleteMessageResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Delete conversation response
 */
export interface DeleteConversationResponse {
  success: boolean;
  message: string;
  error?: string;
}

// =============================================================================
// CONVERSATION METADATA
// =============================================================================

/**
 * Conversation participant info
 */
export interface ConversationParticipant {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  isOnline?: boolean; // For future real-time status
}

/**
 * Conversation type classification
 */
export enum ConversationType {
  DIRECT = "DIRECT", // 1-on-1
  GROUP = "GROUP", // 3+ participants
}

/**
 * Conversation metadata
 */
export interface ConversationMetadata {
  id: string;
  type: ConversationType;
  participantCount: number;
  participants: ConversationParticipant[];
  currentUserIsMember: boolean;
  canSendMessages: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// MESSAGE STATUS & METADATA
// =============================================================================

/**
 * Message delivery status (for future use)
 */
export enum MessageStatus {
  SENDING = "SENDING", // Optimistic, not yet confirmed
  SENT = "SENT", // Confirmed by server
  FAILED = "FAILED", // Failed to send
}

/**
 * Message metadata for optimistic updates
 */
export interface OptimisticMessage {
  id: string; // Temporary ID (client-generated)
  conversationId: string;
  content: string;
  imageUrl?: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  };
  createdAt: Date;
  status: MessageStatus;
  isOptimistic: true;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Message validation result
 */
export interface MessageValidation {
  valid: boolean;
  error?: string;
  errorCode?:
    | "EMPTY_CONTENT"
    | "TOO_LONG"
    | "INVALID_CONVERSATION"
    | "NOT_PARTICIPANT";
}

/**
 * Conversation access validation
 */
export interface ConversationAccessValidation {
  canAccess: boolean;
  canSendMessages: boolean;
  error?: string;
  errorCode?:
    | "NOT_PARTICIPANT"
    | "MUTUAL_FOLLOW_REQUIRED"
    | "CONVERSATION_NOT_FOUND";
}

// =============================================================================
// SEARCH & FILTER TYPES
// =============================================================================

/**
 * Conversation search params
 */
export interface ConversationSearchParams {
  query?: string; // Search by participant name
  hasUnread?: boolean; // Filter unread conversations
}

/**
 * Message search params
 */
export interface MessageSearchParams {
  conversationId: string;
  query?: string; // Search message content
  hasMedia?: boolean; // Filter messages with media
}

// =============================================================================
// GROUP CHAT TYPES (FOR FUTURE USE)
// =============================================================================

/**
 * Group chat metadata (future feature)
 */
export interface GroupChatMetadata {
  name?: string;
  description?: string;
  avatarUrl?: string;
  adminIds: string[];
}

/**
 * Add participant to group input
 */
export interface AddParticipantInput {
  conversationId: string;
  username: string;
}

/**
 * Remove participant from group input
 */
export interface RemoveParticipantInput {
  conversationId: string;
  username: string;
}

// =============================================================================
// TYPING INDICATOR TYPES (FOR FUTURE REAL-TIME)
// =============================================================================

/**
 * Typing indicator event
 */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
  timestamp: Date;
}

// =============================================================================
// UNREAD COUNT TYPES
// =============================================================================

/**
 * Unread messages count per conversation
 */
export interface UnreadCount {
  conversationId: string;
  count: number;
}

/**
 * Total unread messages across all conversations
 */
export interface TotalUnreadCount {
  total: number;
  conversationCounts: UnreadCount[];
}
