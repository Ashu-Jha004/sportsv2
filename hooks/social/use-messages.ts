import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversationMessages } from "@/actions/social/message.actions";
import type { MessageListResponse } from "@/types/social/messaging.types";

export function useMessages(conversationId: string, enabled: boolean = true) {
  return useInfiniteQuery<MessageListResponse, Error>({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam }) => {
      // Explicitly cast pageParam to string or undefined
      const cursor = pageParam as string | undefined;
      return await getConversationMessages(conversationId, {
        limit: 20,
        cursor,
      });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // Type-safe access to hasMore and nextCursor
      if (!lastPage) return undefined;
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled,
    staleTime: 1000 * 60, // 1 minute
  });
}
