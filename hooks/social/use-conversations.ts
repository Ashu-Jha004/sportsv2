/**
 * =============================================================================
 * CONVERSATION HOOKS
 * =============================================================================
 * React Query hooks for conversation management
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getUserConversations,
  getConversationById,
  findExistingConversation,
} from "@/actions/social/conversation.actions";

// =============================================================================
// USER CONVERSATIONS HOOK (INBOX)
// =============================================================================

/**
 * Hook for fetching user's conversations with infinite scroll
 */
export function useUserConversations(enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["conversations"],
    queryFn: async ({ pageParam }) => {
      return await getUserConversations({
        limit: 20,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 10, // Poll every 10 seconds for new messages
  });
}

// =============================================================================
// SINGLE CONVERSATION HOOK
// =============================================================================

/**
 * Hook for fetching a single conversation by ID
 */
export function useConversation(
  conversationId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      return await getConversationById(conversationId);
    },
    enabled: enabled && !!conversationId,
    staleTime: 1000 * 60, // 1 minute
  });
}

// =============================================================================
// CHECK EXISTING CONVERSATION HOOK
// =============================================================================

/**
 * Hook to check if conversation exists with users
 */
export function useExistingConversation(
  participantUsernames: string[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["existingConversation", ...participantUsernames.sort()],
    queryFn: async () => {
      if (participantUsernames.length === 0) return null;
      return await findExistingConversation(participantUsernames);
    },
    enabled: enabled && participantUsernames.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
