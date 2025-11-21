// lib/api/types/athlete.types.ts

/**
 * =============================================================================
 * ATHLETE TYPE DEFINITIONS
 * =============================================================================
 * Aligned with Prisma Athlete schema
 * Used for type-safe API operations
 */

import { Prisma, Gender, Sport, Rank, Class, Role } from "@prisma/client";

// =============================================================================
// BASE ATHLETE TYPES
// =============================================================================

/**
 * Complete Athlete type from Prisma
 */
export type Athlete = Prisma.AthleteGetPayload<{}>;

/**
 * Athlete with counters included
 */
export type AthleteWithCounters = Prisma.AthleteGetPayload<{
  include: {
    counters: true;
  };
}>;

/**
 * Athlete with follower/following counts
 */
export type AthleteWithCounts = Prisma.AthleteGetPayload<{
  include: {
    counters: true;
    _count: {
      select: {
        followers: true;
        following: true;
      };
    };
  };
}>;

/**
 * Athlete with full profile data (for own profile)
 */
export type AthleteFullProfile = Prisma.AthleteGetPayload<{
  include: {
    counters: true;
    stats: true;
    associateProfile: true;
    _count: {
      select: {
        followers: true;
        following: true;
      };
    };
  };
}>;

/**
 * Minimal athlete data for lists/search
 *
 *
 */

export interface AthleteSummary {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  rank?: string;
  class?: string;
  primarySport: string;
  city?: string;
  state?: string;
  country?: string;
  profileImage: string | null | undefined;
}

export interface AthleteSearchResponse {
  athletes: AthleteSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
// =============================================================================
// PROFILE RESPONSE TYPES
// =============================================================================

/**
 * Public profile response (for other users viewing)
 */
export interface PublicProfileResponse {
  // Identity
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | null;

  // Athletic info
  primarySport: Sport;
  secondarySport: Sport | null;
  rank: Rank;
  class: Class;
  roles: Role[];

  // Location (city-level only for privacy)
  city: string;
  state: string;
  country: string;

  // Public info
  gender: Gender;

  // Social counts
  followersCount: number;
  followingCount: number;
  postsCount: number;

  // Metadata
  createdAt: string;

  // Context
  isOwnProfile: false;
}

/**
 * Own profile response (full access to own data)
 */
export interface OwnProfileResponse {
  // Identity
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | null;

  // Athletic info
  primarySport: Sport;
  secondarySport: Sport | null;
  rank: Rank;
  class: Class;
  roles: Role[];

  // Location (full access including coordinates)
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;

  // Private info (only for own profile)
  email: string;
  dateOfBirth: string;
  gender: Gender;

  // Social counts
  followersCount: number;
  followingCount: number;
  postsCount: number;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Status
  onboardingComplete: boolean;
  isAdmin: boolean;

  // Context
  isOwnProfile: true;
}

/**
 * Profile summary for search/lists
 */
export interface ProfileSummaryResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  primarySport: Sport;
  rank: Rank;
  class: Class;
  city: string;
  country: string;
  state: string | undefined | null;
  followersCount: number;
}

// =============================================================================
// PROFILE INPUT TYPES (for creation/update)
// =============================================================================

/**
 * Profile creation input (from Zod schema)
 */
export interface ProfileCreateInput {
  // Identity
  username: string;
  email: string;
  firstName: string;
  lastName: string;

  // Personal
  dateOfBirth: string;
  gender: Gender;
  bio: string;

  // Image
  profileImage?: string;

  // Sports
  primarySport: Sport;
  secondarySport?: Sport;

  // Location
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
}

/**
 * Profile update input (all fields optional)
 */
export interface ProfileUpdateInput {
  // Identity
  username?: string;
  firstName?: string;
  lastName?: string;

  // Personal
  dateOfBirth?: string;
  gender?: Gender;
  bio?: string;

  // Image
  profileImage?: string;

  // Sports
  primarySport?: Sport;
  secondarySport?: Sport;

  // Location
  country?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

// =============================================================================
// SERVICE LAYER TYPES
// =============================================================================

/**
 * Result from profile creation service
 */
export interface ProfileCreateResult {
  athleteId: string;
  username: string;
  message: string;
}

/**
 * Result from profile update service
 */
export interface ProfileUpdateResult {
  athleteId: string;
  username: string;
  message: string;
}

/**
 * Result from profile check
 */
export interface ProfileExistsResult {
  hasProfile: boolean;
  needsOnboarding: boolean;
  athlete: AthleteSummary | null | undefined;
}

/**
 * Username availability check result
 */
export interface UsernameCheckResult {
  available: boolean;
  username: string;
}

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

/**
 * Authenticated user context (from middleware)
 */
export interface AuthenticatedUser {
  // Clerk data
  clerkUserId: string;
  clerkEmail: string | undefined;

  // Database athlete data
  athleteId: string;
  username: string;
  roles: Role[];
  isAdmin: boolean;
  onboardingComplete: boolean;
}

/**
 * Optional authentication result
 */
export type OptionalAuthUser = AuthenticatedUser | null;

// =============================================================================
// PAGINATION & FILTERING
// =============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Search/filter parameters
 */
export interface AthleteSearchParams extends PaginationParams {
  query?: string;
  sport?: Sport;
  city?: string;
  country?: string;
  rank?: Rank;
  class?: Class;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Fields safe for public display
 */
export type PublicAthleteFields = Pick<
  Athlete,
  | "id"
  | "username"
  | "firstName"
  | "lastName"
  | "profileImage"
  | "bio"
  | "primarySport"
  | "secondarySport"
  | "rank"
  | "class"
  | "roles"
  | "city"
  | "state"
  | "country"
  | "gender"
  | "createdAt"
>;

/**
 * Fields only visible to owner
 */
export type PrivateAthleteFields = Pick<
  Athlete,
  "email" | "dateOfBirth" | "latitude" | "longitude"
>;

/**
 * Fields that can be updated
 */
export type UpdatableAthleteFields = Pick<
  Athlete,
  | "username"
  | "firstName"
  | "lastName"
  | "profileImage"
  | "bio"
  | "dateOfBirth"
  | "gender"
  | "primarySport"
  | "secondarySport"
  | "city"
  | "state"
  | "country"
  | "latitude"
  | "longitude"
>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if profile response is own profile
 */
export function isOwnProfile(
  profile: OwnProfileResponse | PublicProfileResponse
): profile is OwnProfileResponse {
  return profile.isOwnProfile === true;
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(
  athlete: Pick<Athlete, "onboardingComplete">
): boolean {
  return athlete.onboardingComplete === true;
}

/**
 * Check if user is admin
 */
export function isAdmin(athlete: Pick<Athlete, "isAdmin">): boolean {
  return athlete.isAdmin === true;
}

/**
 * Check if user has specific role
 */
export function hasRole(athlete: Pick<Athlete, "roles">, role: Role): boolean {
  return athlete.roles.includes(role);
}
