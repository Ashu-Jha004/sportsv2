"use client";

/**
 * =============================================================================
 * USER CARD COMPONENT
 * =============================================================================
 * Reusable card for displaying user info in follower/following lists
 */

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/ui/follow-button";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface UserCardProps {
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    primarySport: string | null;
    rank?: string | null;
    class?: string | null;
  };
  showFollowButton?: boolean;
  isCurrentUser?: boolean;
  initialFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function UserCard({
  user,
  showFollowButton = true,
  isCurrentUser = false,
  initialFollowing = false,
  onFollowChange,
}: UserCardProps) {
  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;
  const initials = `${user.firstName?.[0] || ""}${
    user.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors">
      {/* Left: Avatar + Info */}
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar className="h-12 w-12 border-2 border-slate-200">
          <AvatarImage
            src={user.profileImage || undefined}
            alt={fullName}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
            {initials || user.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">
              {fullName}
            </h3>
            {user.rank && (
              <Badge
                variant="secondary"
                className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
              >
                <Trophy size={10} className="mr-1" />
                {user.rank}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>@{user.username}</span>
            {user.primarySport && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{user.primarySport}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Right: Follow Button */}
      {showFollowButton && !isCurrentUser && (
        <div className="ml-3">
          <FollowButton
            targetId={user.username}
            type="athlete"
            initialFollowing={initialFollowing}
            displayName={fullName}
            size="sm"
            onFollowChange={onFollowChange}
          />
        </div>
      )}
    </div>
  );
}
