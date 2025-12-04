"use client";

/**
 * =============================================================================
 * MESSAGE THREAD COMPONENT
 * =============================================================================
 * Chat window showing messages with infinite scroll and message input
 */

import React, { useEffect, useRef, useState } from "react";
import { useMessages } from "@/hooks/social/use-messages";
import { MessageInput } from "./message-input";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage, deleteMessage } from "@/actions/social/message.actions";
import type { MessageWithSender } from "@/types/social/messaging.types";

// =============================================================================
// TYPES
// =============================================================================

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
}
type OptimisticMessage = {
  id: string;
  content: string;
  imageUrl?: string;
  senderId: string;
  createdAt: Date;
  status: "sending" | "sent" | "failed";
};

// =============================================================================
// COMPONENT
// =============================================================================

export function MessageThread({
  conversationId,
  currentUserId,
}: MessageThreadProps) {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId, !!conversationId);
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);
  const mutation = useMutation({
    mutationFn: ({
      content,
      imageUrl,
    }: {
      content: string;
      imageUrl?: string;
    }) => sendMessage(conversationId, content, imageUrl),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate messages query to refetch
        queryClient.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
      }
    },
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Infinite scroll trigger
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: scrollAreaRef.current, threshold: 0.1 }
    );

    observer.observe(bottomRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current && !hasNextPage) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [data, hasNextPage]);

  // Flatten messages and reverse order (oldest on top)
  const messages: MessageWithSender[] =
    data?.pages.flatMap((page: any) => page.messages).reverse() || [];

  // Handle sending message
  const handleSend = async (content: string, imageUrl?: string) => {
    // Create optimistic message
    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const optimisticMsg: OptimisticMessage = {
      id: tempId,
      content,
      imageUrl,
      senderId: currentUserId,
      createdAt: new Date(),
      status: "sending",
    };

    // Add to optimistic messages
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);

    try {
      await mutation.mutateAsync({ content, imageUrl });

      // Remove optimistic message on success
      setOptimisticMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } catch (error) {
      // Mark as failed
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // TODO: Add message delete handler and optimistic updates later

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      {isLoading ? (
        <div className="grow flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
      ) : isError ? (
        <div className="grow flex items-center justify-center text-red-600">
          Failed to load messages
        </div>
      ) : (
        <div
          ref={scrollAreaRef}
          className="grow overflow-y-auto p-4 space-y-3 bg-white"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Loading older messages */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
            </div>
          )}

          {/* Messages */}
          {/* Optimistic Messages (render first) */}
          {optimisticMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={{
                id: msg.id,
                conversationId: conversationId,
                senderId: msg.senderId,
                sender: {
                  id: msg.senderId,
                  username: "You",
                  firstName: "",
                  lastName: "",
                  profileImage: null,
                },
                content: msg.content,
                imageUrl: msg.imageUrl || null,
                createdAt: msg.createdAt,
              }}
              isOwnMessage={true}
            />
          ))}

          {/* Server Messages */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.sender.id === currentUserId}
            />
          ))}

          {/* Sentinel for infinite scroll */}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Message input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}

// =============================================================================
// MESSAGE BUBBLE COMPONENT
// =============================================================================

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
}

function MessageBubble({ message, isOwnMessage }: any) {
  return (
    <div
      className={`flex items-end gap-2 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* Other user avatar (left side) */}
      {!isOwnMessage && (
        <div className="shrink-0 mb-1">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            {message.sender.firstName?.[0] ||
              message.sender.username[0].toUpperCase()}
          </div>
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-900 rounded-bl-sm"
        }`}
      >
        {/* Sender name (for other users only) */}
        {!isOwnMessage && (
          <p className="text-xs font-semibold text-slate-600 mb-1">
            {message.sender.firstName && message.sender.lastName
              ? `${message.sender.firstName} ${message.sender.lastName}`
              : `@${message.sender.username}`}
          </p>
        )}

        {/* Image */}
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Message Image"
            className="rounded-lg mb-2 max-h-64 object-contain"
            loading="lazy"
          />
        )}

        {/* Message content */}
        {message.content && (
          <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
            {message.content}
          </p>
        )}

        {/* Timestamp */}
        <p
          className={`text-xs mt-1 ${
            isOwnMessage ? "text-blue-100" : "text-slate-400"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Your avatar (right side) */}
      {isOwnMessage && (
        <div className="shrink-0 mb-1">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-semibold">
            You
          </div>
        </div>
      )}
    </div>
  );
}
