"use client";

/**
 * =============================================================================
 * INBOX LIST COMPONENT
 * =============================================================================
 * Main inbox showing all conversations with infinite scroll
 */

import React, { useEffect } from "react";
import { ConversationCard } from "./conversation-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Search, RefreshCw } from "lucide-react";
import { useUserConversations } from "@/hooks/social/use-conversations";
import { useInView } from "react-intersection-observer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPE (✅ FIXED: Proper typing)
interface InboxListProps {
  currentUserId: string;
  activeConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
}

// =============================================================================
// COMPONENT (✅ FIXED: Proper destructuring)
export function InboxList({
  currentUserId,
  activeConversationId,
  onConversationSelect,
}: InboxListProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserConversations(true);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
  });

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("📥 [InboxList] Loading more conversations...");
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages
  const allConversations =
    data?.pages.flatMap((page) => page.conversations) || [];
  const totalCount = data?.pages[0]?.total || 0;

  console.log(
    `🔍 [InboxList] Displaying ${allConversations.length} conversations (total: ${totalCount})`
  );

  // =========================================================================
  // RENDER: LOADING STATE
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: ERROR STATE (✅ FIXED: Better error handling)
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium mb-4 text-center">
          Failed to load conversations
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-6 text-center max-w-sm">
            {error.message}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetchingNextPage}
          >
            <RefreshCw
              className={cn(
                "w-4 h-4 mr-1",
                isFetchingNextPage && "animate-spin"
              )}
            />
            Try Again
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: EMPTY STATE
  if (allConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <div className="text-center max-w-sm">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            No conversations yet
          </h3>
          <p className="text-slate-500 mb-6">
            Start a conversation by visiting a user's profile and clicking the
            message button
          </p>
          <div className="text-xs text-slate-400 space-y-1">
            <p>💡 You must follow each other to send direct messages</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => refetch()}
              className="h-auto p-0 text-slate-600 hover:text-slate-900"
            >
              Refresh to check for new messages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: CONVERSATION LIST
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-slate-900">Messages</h2>
          {totalCount > 0 && (
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {totalCount}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500"
            disabled
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-slate-100">
          {allConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              currentUserId={currentUserId}
              isActive={conversation.id === activeConversationId}
              onSelect={onConversationSelect}
            />
          ))}

          {/* Load More Trigger */}
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-8"
            >
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-slate-500">Loading more...</span>
            </div>
          )}

          {/* End of List */}
          {!hasNextPage && allConversations.length > 0 && (
            <div className="text-center py-8 text-slate-500 text-sm border-t border-slate-100">
              💬 You've reached the end of your conversations
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
