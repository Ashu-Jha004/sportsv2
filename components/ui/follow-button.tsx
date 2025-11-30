"use client";

import React, { useState, useCallback } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FollowButtonProps {
  username: string;
  initialFollowing?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FollowButton({
  username,
  initialFollowing = false,
  size = "md",
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = useCallback(async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsFollowing(!isFollowing);

      if (!isFollowing) {
        toast.success(`Started following ${username}!`, {
          description: "You will see their updates in your feed.",
          duration: 3000,
        });
      } else {
        toast.success(`Unfollowed ${username}`, {
          description: "Stopped following this user.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error("Failed to update follow status", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [username, isFollowing]);

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const Icon = isFollowing ? UserCheck : UserPlus;

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      size="sm"
      className={cn(
        sizeClasses[size],
        "font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
        isFollowing
          ? "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700"
          : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-blue-500/25",
        className
      )}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {isFollowing ? "Unfollowing..." : "Following..."}
        </span>
      ) : (
        <>
          <Icon
            size={size === "lg" ? 20 : 16}
            className="mr-2"
            strokeWidth={2.5}
          />
          {isFollowing ? "Following" : "Follow"}
        </>
      )}
    </Button>
  );
}
