// lib/api/middleware/auth.ts

/**
 * =============================================================================
 * AUTHENTICATION MIDDLEWARE
 * =============================================================================
 * Clerk + Database sync for Athlete authentication
 * Next.js 15+ compatible | Request-memoized
 */

import { currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import prisma from "@/lib/prisma";
import {
  AuthenticationError,
  AthleteNotFoundError,
  AuthorizationError,
  ProfileIncompleteError,
} from "./api-error";
import type { AuthenticatedUser, OptionalAuthUser } from "./athlete.types";
import { Role } from "@prisma/client";

// =============================================================================
// CORE AUTHENTICATION
// =============================================================================

/**
 * Authenticate user and verify database record exists
 * Cached per-request to avoid duplicate Clerk API calls
 *
 * @throws {AuthenticationError} If user not authenticated
 * @throws {AthleteNotFoundError} If user not in database
 */
export const authenticateUser = cache(async (): Promise<AuthenticatedUser> => {
  // 1. Get Clerk user
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new AuthenticationError("Authentication required. Please log in.");
  }

  // 2. Find athlete in database
  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: clerkUser.id },
    select: {
      id: true,
      clerkUserId: true,
      username: true,
      email: true,
      roles: true,
      isAdmin: true,
      onboardingComplete: true,
    },
  });

  if (!athlete) {
    throw new AthleteNotFoundError(clerkUser.id);
  }

  console.log(`✅ Authenticated: ${athlete.username} (${athlete.id})`);

  // 3. Return authenticated user context
  return {
    clerkUserId: clerkUser.id,
    clerkEmail: clerkUser.emailAddresses[0]?.emailAddress,
    athleteId: athlete.id,
    username: athlete.username,
    roles: athlete.roles,
    isAdmin: athlete.isAdmin,
    onboardingComplete: athlete.onboardingComplete,
  };
});

/**
 * Optional authentication - returns null if not authenticated
 * Useful for public endpoints with conditional features
 *
 * @returns {AuthenticatedUser | null}
 */
export const optionalAuth = cache(async (): Promise<OptionalAuthUser> => {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    // Check if athlete exists in database
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: {
        id: true,
        clerkUserId: true,
        username: true,
        email: true,
        roles: true,
        isAdmin: true,
        onboardingComplete: true,
      },
    });

    if (!athlete) {
      return null;
    }

    return {
      clerkUserId: clerkUser.id,
      clerkEmail: clerkUser.emailAddresses[0]?.emailAddress,
      athleteId: athlete.id,
      username: athlete.username,
      roles: athlete.roles,
      isAdmin: athlete.isAdmin,
      onboardingComplete: athlete.onboardingComplete,
    };
  } catch (error) {
    // Log error but don't throw (optional auth)
    console.error("Optional auth error:", error);
    return null;
  }
});

// =============================================================================
// AUTHORIZATION CHECKS
// =============================================================================

/**
 * Require user to have completed onboarding
 *
 * @throws {ProfileIncompleteError} If onboarding not complete
 */
export const requireOnboarding = async (): Promise<AuthenticatedUser> => {
  const user = await authenticateUser();

  if (!user.onboardingComplete) {
    throw new ProfileIncompleteError([
      "Complete your profile to access this feature",
    ]);
  }

  return user;
};

/**
 * Require specific role
 *
 * @throws {AuthorizationError} If user doesn't have required role
 */
export const requireRole = async (
  requiredRole: Role
): Promise<AuthenticatedUser> => {
  const user = await authenticateUser();

  if (!user.roles.includes(requiredRole)) {
    throw new AuthorizationError(`This action requires ${requiredRole} role`);
  }

  return user;
};

/**
 * Require admin privileges
 *
 * @throws {AuthorizationError} If user is not admin
 */
export const requireAdmin = async (): Promise<AuthenticatedUser> => {
  const user = await authenticateUser();

  if (!user.isAdmin) {
    throw new AuthorizationError("Admin access required");
  }

  console.log(`🔐 Admin access granted: ${user.username}`);
  return user;
};

/**
 * Verify user owns a resource (by athleteId)
 *
 * @throws {AuthorizationError} If user doesn't own resource
 */
export const requireOwnership = async (
  resourceAthleteId: string
): Promise<AuthenticatedUser> => {
  const user = await authenticateUser();

  if (user.athleteId !== resourceAthleteId) {
    throw new AuthorizationError(
      "You don't have permission to access this resource"
    );
  }

  return user;
};

/**
 * Verify user is either owner OR admin
 * Useful for moderation features
 *
 * @throws {AuthorizationError} If user is neither owner nor admin
 */
export const requireOwnershipOrAdmin = async (
  resourceAthleteId: string
): Promise<AuthenticatedUser> => {
  const user = await authenticateUser();

  const isOwner = user.athleteId === resourceAthleteId;
  const isAdmin = user.isAdmin;

  if (!isOwner && !isAdmin) {
    throw new AuthorizationError(
      "You must be the owner or an admin to perform this action"
    );
  }

  return user;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get authenticated athlete with full profile data
 * Useful when you need more than just authentication context
 */
export const getAuthenticatedAthlete = cache(async () => {
  const user = await authenticateUser();

  const athlete = await prisma.athlete.findUnique({
    where: { id: user.athleteId },
    include: {
      counters: true,
      stats: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!athlete) {
    throw new AthleteNotFoundError(user.athleteId);
  }

  return athlete;
});

/**
 * Check if current user has specific role (returns boolean)
 */
export const hasRole = async (role: Role): Promise<boolean> => {
  try {
    const user = await authenticateUser();
    return user.roles.includes(role);
  } catch {
    return false;
  }
};

/**
 * Check if current user is admin (returns boolean)
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = await authenticateUser();
    return user.isAdmin;
  } catch {
    return false;
  }
};

/**
 * Check if current user has completed onboarding (returns boolean)
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const user = await authenticateUser();
    return user.onboardingComplete;
  } catch {
    return false;
  }
};

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if auth result is authenticated
 */
export function isAuthenticated(
  auth: OptionalAuthUser
): auth is AuthenticatedUser {
  return auth !== null;
}
