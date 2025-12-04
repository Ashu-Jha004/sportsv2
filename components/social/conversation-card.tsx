"use client";

/**
 * =============================================================================
 * CONVERSATION CARD COMPONENT
 * =============================================================================
 * Card for displaying conversation in inbox list
 */

import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Users, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ConversationListItem,
  ConversationParticipant,
} from "@/types/social/messaging.types";

// =============================================================================
// TYPES (✅ FIXED: Proper typing)
interface ConversationCardProps {
  conversation: ConversationListItem;
  currentUserId: string;
  isActive?: boolean;
  onSelect?: (conversationId: string) => void;
}

// =============================================================================
// COMPONENT (✅ FIXED: Proper typing)
export function ConversationCard({
  conversation,
  currentUserId,
  isActive = false,
  onSelect,
}: ConversationCardProps) {
  // =========================================================================
  // COMPUTE OTHER PARTICIPANTS (exclude current user)
  // =========================================================================
  const otherParticipants = useMemo(() => {
    return conversation.participants.filter(
      (p: ConversationParticipant) => p.id !== currentUserId
    ) as ConversationParticipant[];
  }, [conversation.participants, currentUserId]);

  // =========================================================================
  // DETERMINE IF GROUP CHAT
  // =========================================================================
  const isGroupChat = conversation.participants.length > 2;

  // =========================================================================
  // GET DISPLAY NAME
  // =========================================================================
  const displayName = useMemo(() => {
    if (isGroupChat) {
      return otherParticipants.map((p) => p.firstName || p.username).join(", ");
    }

    const otherUser = otherParticipants[0];
    if (!otherUser) return "Unknown";

    return otherUser.firstName && otherUser.lastName
      ? `${otherUser.firstName} ${otherUser.lastName}`.trim()
      : otherUser.username;
  }, [isGroupChat, otherParticipants]);

  // =========================================================================
  // GET AVATAR
  // =========================================================================
  const avatarUrl = useMemo(() => {
    if (isGroupChat) return null;
    return otherParticipants[0]?.profileImage || null;
  }, [isGroupChat, otherParticipants]);

  const avatarFallback = useMemo(() => {
    if (isGroupChat) {
      return <Users className="w-5 h-5 text-slate-500" />;
    }

    const otherUser = otherParticipants[0];
    if (!otherUser) return "?";

    const initials =
      `${otherUser.firstName?.[0] || ""}${
        otherUser.lastName?.[0] || ""
      }`.toUpperCase() ||
      otherUser.username[0]?.toUpperCase() ||
      "?";

    return initials;
  }, [isGroupChat, otherParticipants]);

  // =========================================================================
  // FORMAT LAST MESSAGE
  // =========================================================================
  const lastMessagePreview = useMemo(() => {
    if (!conversation.lastMessage) {
      return "No messages yet";
    }

    const msg = conversation.lastMessage;
    const isOwnMessage = msg.senderId === currentUserId;
    const prefix = isOwnMessage ? "You: " : "";

    if (msg.imageUrl) {
      return (
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3 h-3 shrink-0" />
          {prefix}Photo
        </span>
      );
    }

    const preview = msg.content.substring(0, 50);
    return `${prefix}${preview}${msg.content.length > 50 ? "..." : ""}`;
  }, [conversation.lastMessage, currentUserId]);

  // =========================================================================
  // FORMAT TIMESTAMP
  // =========================================================================
  const timeAgo = useMemo(() => {
    if (!conversation.lastMessage) {
      return formatDistanceToNow(new Date(conversation.createdAt), {
        addSuffix: true,
      });
    }

    return formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
      addSuffix: true,
    });
  }, [conversation.lastMessage, conversation.createdAt]);

  // =========================================================================
  // HANDLE CLICK
  // =========================================================================
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect?.(conversation.id);
  };

  // =========================================================================
  // RENDER (✅ FIXED: Proper accessibility)
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 hover:bg-slate-50 transition-all duration-200 border-l-4 group",
        isActive
          ? "bg-blue-50 border-l-blue-500 shadow-sm"
          : "border-l-transparent hover:border-l-slate-200"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-current={isActive ? "true" : undefined}
      aria-label={`Open conversation with ${displayName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(conversation.id);
        }
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 border-2 border-slate-200 group-hover:border-slate-300 transition-colors">
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback
            className={cn(
              "font-semibold text-sm",
              isGroupChat
                ? "bg-linear-to-br from-purple-500 to-indigo-600 text-white"
                : "bg-linear-to-br from-blue-500 to-blue-600 text-white"
            )}
          >
            {avatarFallback}
          </AvatarFallback>
        </Avatar>

        {/* Unread Badge */}
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3
            className={cn(
              "font-semibold truncate text-base leading-tight",
              conversation.unreadCount > 0
                ? "text-slate-900"
                : "text-slate-700 group-hover:text-slate-900"
            )}
          >
            {displayName}
          </h3>

          {isGroupChat && (
            <Badge
              variant="secondary"
              className="text-xs shrink-0 bg-purple-100 text-purple-700 border-purple-200 px-2 py-0.5"
            >
              <Users className="w-3 h-3 mr-1" />
              {conversation.participants.length}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm truncate leading-tight max-w-[200px]",
              conversation.unreadCount > 0
                ? "text-slate-900 font-medium"
                : "text-slate-500 group-hover:text-slate-700"
            )}
          >
            {lastMessagePreview}
          </p>

          <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
}
