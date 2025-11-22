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
  // Identity
  clerkUserId: string;
  username: string | undefined | null;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  profileImage: string | null;
  bio: string | null | undefined;

  // Athletic info
  primarySport: Sport | undefined | null;
  secondarySport: Sport | null | undefined;
  rank: Rank | undefined | null;
  class: Class | undefined | null;
  roles: Role[] | undefined | null;

  // Location (full access including coordinates)
  city: string | undefined | null;
  state: string | undefined | null;
  country: string | undefined | null;
  latitude: number | undefined | null;
  longitude: number | undefined | null;

  // Private info (only for own profile)
  email: string | undefined | null;
  dateOfBirth: string | undefined | null;
  gender: Gender | undefined | null;

  // Social counts
  followersCount: number | undefined | null;
  followingCount: number | undefined | null;
  postsCount: number | undefined | null;

  // Metadata
  createdAt: string | undefined | null;
  updatedAt: string | undefined | null;

  // Status
  onboardingComplete: boolean | undefined | null;
  isAdmin: boolean | undefined | null;

  // Context
  isOwnProfile: true | undefined | null;
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
  clerkUserId: string | undefined | null;
  username: string | undefined | null;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  profileImage: string | null;
  bio: string | null | undefined;

  // Athletic info
  primarySport: Sport | undefined | null;
  secondarySport: Sport | null | undefined;
  rank: Rank | undefined | null;
  class: Class | undefined | null;
  roles: Role[] | undefined | null;

  // Location (full access including coordinates)
  city: string | undefined | null;
  state: string | undefined | null;
  country: string | undefined | null;
  latitude: number | undefined | null;
  longitude: number | undefined | null;

  // Private info (only for own profile)
  email: string | undefined | null;
  dateOfBirth: string | undefined | null;
  gender: Gender | undefined | null;

  // Social counts
  followersCount: number | undefined | null;
  followingCount: number | undefined | null;
  postsCount: number | undefined | null;

  // Metadata
  createdAt: string | undefined | null;
  updatedAt: string | undefined | null;

  // Status
  onboardingComplete: boolean | undefined | null;
  isAdmin: boolean | undefined | null;

  // Context
  isOwnProfile: true | undefined | null;
}

/**
 * Own profile response (full access to own data)
 */
export interface OwnProfileResponse {
  // Identity
  clerkUserId: string;
  username: string | undefined | null;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  profileImage: string | null;
  bio: string | null | undefined;

  // Athletic info
  primarySport: Sport | undefined | null;
  secondarySport: Sport | null | undefined;
  rank: Rank | undefined | null;
  class: Class | undefined | null;
  roles: Role[] | undefined | null;

  // Location (full access including coordinates)
  city: string | undefined | null;
  state: string | undefined | null;
  country: string | undefined | null;
  latitude: number | undefined | null;
  longitude: number | undefined | null;

  // Private info (only for own profile)
  email: string | undefined | null;
  dateOfBirth: string | undefined | null | Date;
  gender: Gender | undefined | null;

  // Social counts
  followersCount: number | undefined | null;
  followingCount: number | undefined | null;
  postsCount: number | undefined | null;

  // Metadata
  createdAt: string | undefined | null;
  updatedAt: string | undefined | null;

  // Status
  onboardingComplete: boolean | undefined | null;
  isAdmin: boolean | undefined | null;

  // Context
  isOwnProfile: true | undefined | null;
}

/**
 * Profile summary for search/lists
 */
export interface ProfileSummaryResponse {
  clerkUserId: string | undefined | null;
  username: string | undefined | null;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  profileImage: string | undefined | null;
  primarySport: Sport | undefined | null;
  rank: Rank | undefined | null;
  class: Class | undefined | null;
  city: string | undefined | null;
  country: string | undefined | null;
  state: string | undefined | null;
  followersCount: number | undefined | null;
  followingCount: number | undefined | null;
  longitude: number | undefined | null;
  latitude: number | undefined | null;
  gender: string | undefined | null | Gender;
  dateOfBirth: number | string | undefined | null;
  bio: string | undefined | null;
  createdAt: number | string | undefined | null;
  updatedAt: number | string | undefined | null;
  secondarySport: string | undefined | null | Sport;
}

// =============================================================================
// PROFILE INPUT TYPES (for creation/update)
// =============================================================================

/**
 * Profile creation input (from Zod schema)
 */
export interface ProfileCreateInput {
  // Identity
  username?: string | undefined | null;
  firstName?: string | undefined | null;
  lastName?: string | undefined | null;

  // Personal
  dateOfBirth?: string | undefined | null;
  gender?: Gender | undefined | null;
  bio?: string | undefined | null;

  // Image
  profileImage?: string | undefined | null;
  // Sports
  primarySport?: Sport | undefined | null;
  secondarySport?: Sport | undefined | null;

  // Location
  country?: string | undefined | null;
  state?: string | undefined | null;
  city?: string | undefined | null;
  latitude?: number | undefined | null;
  longitude?: number | undefined | null;
}

/**
 * Profile update input (all fields optional)
 */
export interface ProfileUpdateInput {
  // Identity
  username?: string | undefined | null;
  firstName?: string | undefined | null;
  lastName?: string | undefined | null;

  // Personal
  dateOfBirth?: string | undefined | null;
  gender?: Gender | undefined | null;
  bio?: string | undefined | null;

  // Image
  profileImage?: string | undefined | null;
  // Sports
  primarySport?: Sport | undefined | null;
  secondarySport?: Sport | undefined | null;

  // Location
  country?: string | undefined | null;
  state?: string | undefined | null;
  city?: string | undefined | null;
  latitude?: number | undefined | null;
  longitude?: number | undefined | null;
}

// =============================================================================
// SERVICE LAYER TYPES
// =============================================================================

/**
 * Result from profile creation service
 */
export interface ProfileCreateResult {
  athleteId: string | undefined | null;
  username: string | undefined | null;
  message: string | undefined | null;
}

/**
 * Result from profile update service
 */
export interface ProfileUpdateResult {
  athleteId: string | undefined | null;
  username: string | undefined | null;
  message: string | undefined | null;
}

/**
 * Result from profile check
 */
export interface ProfileExistsResult {
  needsOnboarding: boolean;
  athlete: AthleteSummary | null | undefined;
}

/**
 * Username availability check result
 */
export interface UsernameCheckResult {
  available: boolean;
  username: string | undefined | null;
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
  clerkEmail: string | undefined | null;

  // Database athlete data
  athleteId: string;
  username: string | undefined | null;
  roles: Role[];
  isAdmin: boolean;
  onboardingComplete: boolean;
}

/**
 * Optional authentication result
 */
export type OptionalAuthUser = AuthenticatedUser | null | undefined;

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
  | "email"
  | "dateOfBirth"
  | "latitude"
  | "longitude"
  | "adminGrantedAt"
  | "adminRole"
  | "adminGrantedBy"
  | "isAdmin"
  | "clerkUserId"
  | "rank"
  | "class"
  | "city"
  | "bio"
  | "country"
  | "username"
  | "id"
  | "onboardingComplete"
  | "firstName"
  | "gender"
  | "lastName"
  | "primarySport"
  | "profileImage"
  | "roles"
  | "secondarySport"
  | "state"
  | "createdAt"
  | "updatedAt"
>;

/**
 * Fields only visible to owner
 */
export type PrivateAthleteFields = Pick<
  Athlete,
  | "email"
  | "dateOfBirth"
  | "latitude"
  | "longitude"
  | "adminGrantedAt"
  | "adminRole"
  | "adminGrantedBy"
  | "isAdmin"
  | "clerkUserId"
  | "rank"
  | "class"
  | "city"
  | "bio"
  | "country"
  | "username"
  | "id"
  | "onboardingComplete"
  | "firstName"
  | "gender"
  | "lastName"
  | "primarySport"
  | "profileImage"
  | "roles"
  | "secondarySport"
  | "state"
  | "createdAt"
  | "updatedAt"
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
