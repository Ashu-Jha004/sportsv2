// lib/validations/follow.validation.ts
/**
 * =============================================================================
 * FOLLOW VALIDATION UTILITIES
 * =============================================================================
 * Business logic validation for follow operations
 */

import { z } from "zod";

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/**
 * Follow athlete schema
 */
export const followAthleteSchema = z.object({
  targetUsername: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username too long"),
});

/**
 * Follow team schema
 */
export const followTeamSchema = z.object({
  teamId: z.string().cuid("Invalid team ID"),
});

/**
 * Pagination schema
 */
export const followPaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

/**
 * Follow filter schema
 */
export const followFilterSchema = z.object({
  sport: z.string().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["recent", "alphabetical"]).default("recent"),
});

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Prevent self-follow for athletes
 */
export function validateNotSelfFollow(
  currentUserId: string,
  targetUserId: string
): { valid: boolean; error?: string } {
  if (currentUserId === targetUserId) {
    return {
      valid: false,
      error: "You cannot follow yourself",
    };
  }
  return { valid: true };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  limit?: number,
  cursor?: string
): { valid: boolean; error?: string } {
  try {
    followPaginationSchema.parse({ limit, cursor });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Invalid pagination parameters",
    };
  }
}

/**
 * Validate follow action
 */
export function validateFollowAction(
  currentUserId: string | null,
  targetId: string
): { valid: boolean; error?: string } {
  // Check if user is authenticated
  if (!currentUserId) {
    return {
      valid: false,
      error: "You must be logged in to follow",
    };
  }

  // Check if target exists
  if (!targetId || targetId.trim() === "") {
    return {
      valid: false,
      error: "Invalid target ID",
    };
  }

  // Prevent self-follow
  const selfFollowCheck = validateNotSelfFollow(currentUserId, targetId);
  if (!selfFollowCheck.valid) {
    return selfFollowCheck;
  }

  return { valid: true };
}

/**
 * Validate team follow action
 */
export function validateTeamFollowAction(
  currentUserId: string | null,
  teamId: string
): { valid: boolean; error?: string } {
  // Check if user is authenticated
  if (!currentUserId) {
    return {
      valid: false,
      error: "You must be logged in to follow teams",
    };
  }

  // Check if team ID is valid
  if (!teamId || teamId.trim() === "") {
    return {
      valid: false,
      error: "Invalid team ID",
    };
  }

  return { valid: true };
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if pagination has more results
 */
export function hasMoreResults(totalFetched: number, limit: number): boolean {
  return totalFetched === limit;
}

/**
 * Generate next cursor for pagination
 */
export function generateNextCursor(
  items: Array<{ id: string; createdAt: Date }>,
  limit: number
): string | undefined {
  if (items.length < limit) return undefined;
  const lastItem = items[items.length - 1];
  return lastItem?.id;
}
