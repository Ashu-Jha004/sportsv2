"use client";

/**
 * =============================================================================
 * FOLLOWING LIST MODAL
 * =============================================================================
 * Modal displaying following list with infinite scroll
 */

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCard } from "./user-card";
import { Loader2, UserPlus } from "lucide-react";
import { useAthleteFollowing } from "@/hooks/social/use-follow-list";
import { useInView } from "react-intersection-observer";

// =============================================================================
// TYPES
// =============================================================================

interface FollowingListModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FollowingListModal({
  username,
  isOpen,
  onClose,
  currentUserId,
}: FollowingListModalProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAthleteFollowing(username, isOpen);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
  });

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("📥 [FollowingListModal] Loading more following...");
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages
  const allFollowing = data?.pages.flatMap((page) => page.following) || [];
  const totalCount = data?.pages[0]?.total || 0;

  console.log(
    `🔍 [FollowingListModal] Displaying ${allFollowing.length} following (total: ${totalCount})`
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>
              Following
              {totalCount > 0 && (
                <span className="ml-2 text-slate-500 font-normal">
                  ({totalCount.toLocaleString()})
                </span>
              )}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          <div className="px-2 py-2">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="text-center py-12 px-4">
                <p className="text-slate-600 mb-2">Failed to load following</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && allFollowing.length === 0 && (
              <div className="text-center py-12 px-4">
                <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  Not following anyone yet
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Start following athletes to see their updates
                </p>
              </div>
            )}

            {/* Following List */}
            {allFollowing.map((follow) => (
              <UserCard
                key={follow.id}
                user={follow.following}
                showFollowButton={true}
                isCurrentUser={follow.following.id === currentUserId}
                initialFollowing={true}
              />
            ))}

            {/* Load More Trigger */}
            {hasNextPage && (
              <div
                ref={loadMoreRef}
                className="flex items-center justify-center py-4"
              >
                {isFetchingNextPage && (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                )}
              </div>
            )}

            {/* End of List */}
            {!hasNextPage && allFollowing.length > 0 && (
              <div className="text-center py-4 text-slate-500 text-sm">
                You've reached the end
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
