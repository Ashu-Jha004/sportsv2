// types/social/follow.types.ts
/**
 * =============================================================================
 * FOLLOW SYSTEM TYPES
 * =============================================================================
 * Type definitions for athlete and team follow system
 */

import { Athlete, Team, Follow, TeamFollow } from "@prisma/client";

// =============================================================================
// ATHLETE FOLLOW TYPES
// =============================================================================

/**
 * Follow relationship with follower details
 */
export type FollowWithFollower = Follow & {
  follower: Pick<
    Athlete,
    | "id"
    | "username"
    | "firstName"
    | "lastName"
    | "profileImage"
    | "primarySport"
  >;
};

/**
 * Follow relationship with following details
 */
export type FollowWithFollowing = Follow & {
  following: Pick<
    Athlete,
    | "id"
    | "username"
    | "firstName"
    | "lastName"
    | "profileImage"
    | "primarySport"
  >;
};

/**
 * Complete follow relationship (for admin purposes)
 */
export type FollowWithBoth = Follow & {
  follower: Pick<
    Athlete,
    "id" | "username" | "firstName" | "lastName" | "profileImage"
  >;
  following: Pick<
    Athlete,
    "id" | "username" | "firstName" | "lastName" | "profileImage"
  >;
};

// =============================================================================
// TEAM FOLLOW TYPES
// =============================================================================

/**
 * Team follow with follower details
 */
export type TeamFollowWithFollower = TeamFollow & {
  follower: Pick<
    Athlete,
    | "id"
    | "username"
    | "firstName"
    | "lastName"
    | "profileImage"
    | "primarySport"
  >;
};

/**
 * Team follow with team details
 */
export type TeamFollowWithTeam = TeamFollow & {
  team: Pick<Team, "id" | "name" | "logoUrl" | "sport" | "rank" | "class">;
};

// =============================================================================
// FOLLOW STATUS TYPES
// =============================================================================

/**
 * Follow status response
 */
export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean; // Does the target follow you back?
  isMutual: boolean; // Mutual follow (both directions)
  canMessage: boolean; // Can send DM (mutual follow required)
}

/**
 * Team follow status response
 */
export interface TeamFollowStatus {
  isFollowing: boolean;
  followerCount: number;
}

// =============================================================================
// FOLLOW LIST TYPES
// =============================================================================

/**
 * Paginated follower list
 */
export interface FollowerListResponse {
  followers: FollowWithFollower[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Paginated following list
 */
export interface FollowingListResponse {
  following: FollowWithFollowing[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Paginated team follower list
 */
export interface TeamFollowerListResponse {
  followers: TeamFollowWithFollower[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// =============================================================================
// ACTION RESPONSE TYPES
// =============================================================================

/**
 * Follow action response
 */
export interface FollowActionResponse {
  success: boolean;
  message: string;
  data?: {
    isFollowing: boolean;
    followerCount: number;
    followingCount: number;
  };
  error?: string;
}

/**
 * Team follow action response
 */
export interface TeamFollowActionResponse {
  success: boolean;
  message: string;
  data?: {
    isFollowing: boolean;
    followerCount: number;
  };
  error?: string;
}

// =============================================================================
// PAGINATION TYPES
// =============================================================================

/**
 * Cursor-based pagination params
 */
export interface FollowPaginationParams {
  limit?: number;
  cursor?: string;
}

/**
 * Follow list filter options
 */
export interface FollowFilterOptions {
  sport?: string;
  search?: string;
  sortBy?: "recent" | "alphabetical";
}
