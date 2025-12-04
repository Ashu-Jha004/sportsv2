"use client";

/**
 * =============================================================================
 * FOLLOWER LIST MODAL
 * =============================================================================
 * Modal displaying followers with infinite scroll
 */

import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCard } from "./user-card";
import { Loader2, Users } from "lucide-react";
import { useAthleteFollowers } from "@/hooks/social/use-follow-list";
import { useInView } from "react-intersection-observer";

// =============================================================================
// TYPES
// =============================================================================

interface FollowerListModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FollowerListModal({
  username,
  isOpen,
  onClose,
  currentUserId,
}: FollowerListModalProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAthleteFollowers(username, isOpen);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
  });

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("📥 [FollowerListModal] Loading more followers...");
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages
  const allFollowers = data?.pages.flatMap((page) => page.followers) || [];
  const totalCount = data?.pages[0]?.total || 0;

  console.log(
    `🔍 [FollowerListModal] Displaying ${allFollowers.length} followers (total: ${totalCount})`
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>
              Followers
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
                <p className="text-slate-600 mb-2">Failed to load followers</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && allFollowers.length === 0 && (
              <div className="text-center py-12 px-4">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No followers yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Be the first to follow!
                </p>
              </div>
            )}

            {/* Follower List */}
            {allFollowers.map((follow) => (
              <UserCard
                key={follow.id}
                user={follow.follower}
                showFollowButton={true}
                isCurrentUser={follow.follower.id === currentUserId}
                initialFollowing={false} // TODO: Add bulk follow status check
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
            {!hasNextPage && allFollowers.length > 0 && (
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
