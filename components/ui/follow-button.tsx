"use client";

/**
 * =============================================================================
 * FOLLOW BUTTON COMPONENT (PRODUCTION)
 * =============================================================================
 * Integrated with server actions and React Query for optimistic updates
 * Supports both athlete and team follows
 */

import React, { useState, useCallback } from "react";
import { useEffect } from "react";

import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  followAthlete,
  unfollowAthlete,
} from "@/actions/social/follow-athlete.actions";
import {
  updateAthleteCountersCache,
  updateTeamCountersCache,
} from "@/hooks/social/use-follow-counters";
import { followTeam, unfollowTeam } from "@/actions/social/follow-team.actions";

// =============================================================================
// TYPES
// =============================================================================

type FollowType = "athlete" | "team";

interface FollowButtonProps {
  // For athlete: username, for team: teamId
  targetId: string;

  // Specify if following athlete or team
  type: FollowType;

  // Initial follow state
  initialFollowing?: boolean;

  // Display name for toast messages
  displayName?: string;

  // Button size
  size?: "sm" | "md" | "lg";

  // Custom className
  className?: string;

  // Callback after successful follow/unfollow
  onFollowChange?: (isFollowing: boolean) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FollowButton({
  targetId,
  type,
  initialFollowing = false,
  displayName,
  size = "md",
  className,
  onFollowChange,
}: FollowButtonProps) {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  useEffect(() => {
    setIsFollowing(initialFollowing);
    console.log(
      `🔄 [FollowButton] Initial state synced for ${targetId}: ${initialFollowing}`
    );
  }, [initialFollowing, targetId]);

  // =========================================================================
  // SIZE CLASSES
  // =========================================================================
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const iconSize = size === "lg" ? 20 : 16;
  const Icon = isFollowing ? UserCheck : UserPlus;

  // =========================================================================
  // FOLLOW MUTATION
  // =========================================================================
  const followMutation = useMutation({
    mutationFn: async () => {
      console.log(
        `🔄 [FollowButton] Initiating follow - type: ${type}, target: ${targetId}`
      );

      if (type === "athlete") {
        return await followAthlete(targetId);
      } else {
        return await followTeam(targetId);
      }
    },

    // Optimistic update
    onMutate: async () => {
      console.log(`⚡ [FollowButton] Optimistic update - Setting to following`);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [
          type === "athlete" ? "followStatus" : "teamFollowStatus",
          targetId,
        ],
      });

      // Snapshot previous value
      const previousFollowing = isFollowing;

      // Optimistically update UI
      setIsFollowing(true);

      return { previousFollowing };
    },

    onSuccess: (data) => {
      if (data.success) {
        console.log(`✅ [FollowButton] Follow success:`, data.message);

        setIsFollowing(true);
        onFollowChange?.(true);

        toast.success(data.message, {
          description:
            type === "athlete"
              ? "You will see their updates in your feed."
              : "You'll get notified about team updates.",
          duration: 3000,
        });
        if (type === "athlete" && data.data) {
          updateAthleteCountersCache(queryClient, targetId, {
            followersCount: data.data.followerCount,
          });
        } else if (type === "team" && data.data) {
          updateTeamCountersCache(queryClient, targetId, {
            followersCount: data.data.followerCount,
          });
        }

        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [
            type === "athlete" ? "followStatus" : "teamFollowStatus",
            targetId,
          ],
        });
        queryClient.invalidateQueries({ queryKey: ["followers"] });
        queryClient.invalidateQueries({ queryKey: ["following"] });
      } else {
        console.error(`❌ [FollowButton] Follow failed:`, data.message);

        // Revert optimistic update
        setIsFollowing(false);

        toast.error(data.message || "Failed to follow", {
          description: data.error || "Please try again.",
        });
      }
    },

    onError: (error, variables, context) => {
      console.error(`❌ [FollowButton] Follow error:`, error);

      // Revert to previous state
      if (context?.previousFollowing !== undefined) {
        setIsFollowing(context.previousFollowing);
      }

      toast.error("Failed to follow", {
        description: "Something went wrong. Please try again.",
      });
    },
  });

  // =========================================================================
  // UNFOLLOW MUTATION
  // =========================================================================
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      console.log(
        `🔄 [FollowButton] Initiating unfollow - type: ${type}, target: ${targetId}`
      );

      if (type === "athlete") {
        return await unfollowAthlete(targetId);
      } else {
        return await unfollowTeam(targetId);
      }
    },

    // Optimistic update
    onMutate: async () => {
      console.log(
        `⚡ [FollowButton] Optimistic update - Setting to not following`
      );

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [
          type === "athlete" ? "followStatus" : "teamFollowStatus",
          targetId,
        ],
      });

      // Snapshot previous value
      const previousFollowing = isFollowing;

      // Optimistically update UI
      setIsFollowing(false);

      return { previousFollowing };
    },

    onSuccess: (data) => {
      if (data.success) {
        console.log(`✅ [FollowButton] Unfollow success:`, data.message);

        setIsFollowing(false);
        onFollowChange?.(false);

        toast.success(data.message, {
          duration: 3000,
        });
        // Update counters in cache optimistically
        if (type === "athlete" && data.data) {
          updateAthleteCountersCache(queryClient, targetId, {
            followersCount: data.data.followerCount,
          });
        } else if (type === "team" && data.data) {
          updateTeamCountersCache(queryClient, targetId, {
            followersCount: data.data.followerCount,
          });
        }

        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [
            type === "athlete" ? "followStatus" : "teamFollowStatus",
            targetId,
          ],
        });
        queryClient.invalidateQueries({ queryKey: ["followers"] });
        queryClient.invalidateQueries({ queryKey: ["following"] });
      } else {
        console.error(`❌ [FollowButton] Unfollow failed:`, data.message);

        // Revert optimistic update
        setIsFollowing(true);

        toast.error(data.message || "Failed to unfollow", {
          description: data.error || "Please try again.",
        });
      }
    },

    onError: (error, variables, context) => {
      console.error(`❌ [FollowButton] Unfollow error:`, error);

      // Revert to previous state
      if (context?.previousFollowing !== undefined) {
        setIsFollowing(context.previousFollowing);
      }

      toast.error("Failed to unfollow", {
        description: "Something went wrong. Please try again.",
      });
    },
  });

  // =========================================================================
  // HANDLE CLICK
  // =========================================================================
  const handleClick = useCallback(async () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [isFollowing, followMutation, unfollowMutation]);

  // =========================================================================
  // LOADING STATE
  // =========================================================================
  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size="sm"
      className={cn(
        sizeClasses[size],
        "font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
        isFollowing
          ? "bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 text-gray-700"
          : "bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 shadow-blue-500/25",
        className
      )}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {isFollowing ? "Unfollowing..." : "Following..."}
        </span>
      ) : (
        <>
          <Icon size={iconSize} className="mr-2" strokeWidth={2.5} />
          {isFollowing ? "Following" : "Follow"}
        </>
      )}
    </Button>
  );
}
