// lib/api/utils/profile-formatters.ts

/**
 * =============================================================================
 * PROFILE DATA FORMATTERS
 * =============================================================================
 * Privacy-aware data transformation for Athlete profiles
 * Aligned with Prisma Athlete schema
 */

import type { AthleteWithCounts, OwnProfileResponse } from "./athlete.types";

// =============================================================================
// OWN PROFILE FORMATTER (Full Access)
// =============================================================================

/**
 * Format user's own profile with full data access
 * Includes private information like email, DOB, exact coordinates
 */
export function formatOwnProfile(athlete: any): any {
  return {
    // Identity
    clerkUserId: athlete.clerkUserId,
    username: athlete.username,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    profileImage: athlete.profileImage,
    bio: athlete.bio,

    // Athletic info
    primarySport: athlete.primarySport,
    secondarySport: athlete.secondarySport,
    rank: athlete.rank,
    class: athlete.class,
    roles: athlete.roles,

    // Location (full access including exact coordinates)
    city: athlete.city,
    state: athlete.state,
    country: athlete.country,
    latitude: athlete.latitude,
    longitude: athlete.longitude,

    // PRIVATE information (only for own profile)
    email: athlete.email,
    dateOfBirth: athlete.dateOfBirth,
    gender: athlete.gender,

    // Social counts
    followersCount:
      athlete.counters?.followersCount ?? athlete._count.followers,
    followingCount:
      athlete.counters?.followingCount ?? athlete._count.following,
    postsCount: athlete.counters?.postsCount ?? 0,

    // Metadata
    createdAt: athlete.createdAt.toISOString(),
    updatedAt: athlete.updatedAt.toISOString(),

    // Status flags
    onboardingComplete: athlete.onboardingComplete,
    isAdmin: athlete.isAdmin,

    // Context
    isOwnProfile: true,
  };
}

// =============================================================================
// PUBLIC PROFILE FORMATTER (Privacy Protected)
// =============================================================================

/**
 * Format public profile for other users viewing
 * Excludes private information (email, DOB, exact coordinates)
 */
export function formatPublicProfile(athlete: any) {
  return {
    // Identity
    clerkUserId: athlete.clerkUserId,
    username: athlete.username,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    profileImage: athlete.profileImage,
    bio: athlete.bio,

    // Athletic info
    primarySport: athlete.primarySport,
    secondarySport: athlete.secondarySport,
    rank: athlete.rank,
    class: athlete.class,
    roles: athlete.roles,

    // Location (full access including exact coordinates)
    city: athlete.city,
    state: athlete.state,
    country: athlete.country,
    latitude: athlete.latitude,
    longitude: athlete.longitude,

    // PRIVATE information (only for own profile)
    email: athlete.email,
    dateOfBirth: athlete.dateOfBirth,
    gender: athlete.gender,

    // Social counts
    followersCount:
      athlete.counters?.followersCount ?? athlete._count.followers,
    followingCount:
      athlete.counters?.followingCount ?? athlete._count.following,
    postsCount: athlete.counters?.postsCount ?? 0,

    // Metadata
    createdAt: athlete.createdAt.toISOString(),
    updatedAt: athlete.updatedAt.toISOString(),

    // Status flags
    onboardingComplete: athlete.onboardingComplete,
    isAdmin: athlete.isAdmin,

    // Context
    isOwnProfile: true,
  };
}

// =============================================================================
// PROFILE SUMMARY FORMATTER (Minimal Data)
// =============================================================================

/**
 * Format minimal profile summary for lists, search results, suggestions
 * Only essential information for display cards
 */
export function formatProfileSummary(athlete: any) {
  return {
    clerkUserId: athlete.clerkUserId,
    username: athlete.username,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    profileImage: athlete.profileImage,
    bio: athlete.bio,

    // Athletic info
    primarySport: athlete.primarySport,
    secondarySport: athlete.secondarySport,
    rank: athlete.rank,
    class: athlete.class,
    roles: athlete.roles,

    // Location (full access including exact coordinates)
    city: athlete.city,
    state: athlete.state,
    country: athlete.country,
    latitude: athlete.latitude,
    longitude: athlete.longitude,

    // PRIVATE information (only for own profile)
    email: athlete.email,
    dateOfBirth: athlete.dateOfBirth,
    gender: athlete.gender,

    // Social counts
    followersCount:
      athlete.counters?.followersCount ?? athlete._count.followers,
    followingCount:
      athlete.counters?.followingCount ?? athlete._count.following,
    postsCount: athlete.counters?.postsCount ?? 0,

    // Metadata
    createdAt: athlete.createdAt.toISOString(),
    updatedAt: athlete.updatedAt.toISOString(),

    // Status flags
    onboardingComplete: athlete.onboardingComplete,
    isAdmin: athlete.isAdmin,

    // Context
    isOwnProfile: true,
  };
}

// =============================================================================
// UTILITY FORMATTERS
// =============================================================================

/**
 * Get display name from athlete data
 */
export function getDisplayName(athlete: {
  firstName: string;
  lastName: string;
  username: string;
}): string {
  if (athlete.firstName && athlete.lastName) {
    return `${athlete.firstName} ${athlete.lastName}`;
  }
  return athlete.username || "Anonymous User";
}

/**
 * Get initials from athlete name
 */
export function getInitials(athlete: {
  firstName: string;
  lastName: string;
}): string {
  const firstInitial = athlete.firstName?.charAt(0)?.toUpperCase() || "";
  const lastInitial = athlete.lastName?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}` || "??";
}

/**
 * Format location string for display
 */
export function formatLocation(athlete: {
  city: string;
  state?: string;
  country: string;
  longitude: number;
  latitude: number;
}): string {
  const parts = [athlete.city];

  if (athlete.state) {
    parts.push(athlete.state);
  }

  parts.push(athlete.country);

  return parts.filter(Boolean).join(", ");
}

/**
 * Calculate profile completion percentage
 */
export function getProfileCompletionPercentage(athlete: {
  username: string | undefined | null;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  email: string | undefined | null;
  dateOfBirth: Date | null;
  gender: string | undefined | null;
  bio: string | null | undefined;
  profileImage: string | null | undefined;
  primarySport: string | undefined | null;
  city: string | undefined | null;
  country: string | undefined | null;
  state: string | undefined | null;
  longitude: number | undefined | null;
  latitude: number | undefined | null;
}): number {
  const requiredFields = [
    "username",
    "firstName",
    "lastName",
    "email",
    "dateOfBirth",
    "gender",
    "bio",
    "profileImage",
    "primarySport",
    "city",
    "country",
    "state",
    "longitude",
    "latitude",
  ] as const;

  const completedFields = requiredFields.filter((field) => {
    const value = athlete[field];

    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === "string" && value.trim() === "") {
      return false;
    }

    return true;
  }).length;

  return Math.round((completedFields / requiredFields.length) * 100);
}

/**
 * Check if profile has minimum required information
 */
export function hasMinimumProfileInfo(athlete: {
  username: string | undefined | null;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  email: string | undefined | null;
  dateOfBirth: Date | null;
  gender: string | undefined | null;
  bio: string | null | undefined;
  profileImage: string | null | undefined;
  primarySport: string | undefined | null;
  city: string | undefined | null;
  country: string | undefined | null;
  state: string | undefined | null;
  longitude: number | undefined | null;
  latitude: number | undefined | null;
}): boolean {
  const minimumFields = [
    athlete.username,
    athlete.firstName,
    athlete.lastName,
    athlete.email,
    athlete.primarySport,
    athlete.city,
    athlete.country,
    athlete.latitude,
    athlete.longitude,
    athlete.state,
    athlete.dateOfBirth,
    athlete.gender,
    athlete.profileImage,
    athlete.bio,
  ];

  return minimumFields.every((field) => field !== null && field !== undefined);
}

/**
 * Format profile image URL with fallback
 */
export function getProfileImageUrl(
  profileImage: string | null,
  fallbackUrl?: string
): string {
  if (profileImage) {
    return profileImage;
  }

  return fallbackUrl || "/images/default-avatar.png";
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Format fuzzy location (approximate coordinates for privacy)
 * Rounds to ~1km precision
 */
export function formatFuzzyCoordinates(
  latitude: number,
  longitude: number
): { latitude: number; longitude: number } {
  return {
    latitude: Math.round(latitude * 100) / 100,
    longitude: Math.round(longitude * 100) / 100,
  };
}

// =============================================================================
// BATCH FORMATTERS
// =============================================================================

/**
 * Format multiple athletes as public profiles
 */
export function formatPublicProfiles(athletes: any) {
  return athletes.map(formatPublicProfile);
}

/**
 * Format multiple athletes as summaries
 */
export function formatProfileSummaries(athletes: any) {
  return athletes.map(formatProfileSummary);
}

// =============================================================================
// CONDITIONAL FORMATTER (Smart Selection)
// =============================================================================

/**
 * Automatically format profile based on ownership
 * Returns own profile format if viewing own profile, public format otherwise
 */
export function formatProfile(athlete: any, viewerAthleteId: any) {
  const isOwnProfile = viewerAthleteId === athlete.id;

  if (isOwnProfile) {
    return formatOwnProfile(athlete);
  }

  return formatPublicProfile(athlete);
}
