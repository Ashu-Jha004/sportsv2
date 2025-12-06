// lib/api/services/profile-service.ts

/**
 * =============================================================================
 * PROFILE SERVICE LAYER
 * =============================================================================
 * Business logic for Athlete profile CRUD operations
 * Aligned with Prisma Athlete schema
 * Transaction-safe with proper error handling
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  ProfileAlreadyExistsError,
  AthleteNotFoundError,
  UsernameNotAvailableError,
  EmailNotAvailableError,
  ConflictError,
} from "./api-error";
import {
  formatOwnProfile,
  formatPublicProfile,
  formatProfileSummaries,
} from "./profile-formatters";
import type {
  ProfileCreateInput,
  ProfileUpdateInput,
  ProfileSearchParams,
} from "./profile-schemas";
import type {
  OwnProfileResponse,
  PublicProfileResponse,
  ProfileSummaryResponse,
  ProfileCreateResult,
  ProfileUpdateResult,
  ProfileExistsResult,
  UsernameCheckResult,
} from "./athlete.types";

// =============================================================================
// PROFILE CREATION
// =============================================================================

/**
 * Create new athlete profile (onboarding)
 *
 * @throws {ProfileAlreadyExistsError} If profile already exists
 * @throws {UsernameNotAvailableError} If username is taken
 * @throws {EmailNotAvailableError} If email is taken
 */
export async function createProfileService(
  clerkUserId: string,
  data: ProfileCreateInput
): Promise<ProfileCreateResult> {
  console.log("🔄 Starting profile creation service");

  return await prisma.$transaction(
    async (tx) => {
      // 1. Check if athlete already exists
      const existingAthlete = await tx.athlete.findUnique({
        where: { clerkUserId },
        select: { id: true },
      });

      if (existingAthlete) {
        throw new ProfileAlreadyExistsError();
      }

      // 2. Check username uniqueness
      const usernameExists = await tx.athlete.findUnique({
        where: { username: data.username },
        select: { id: true },
      });

      if (usernameExists) {
        throw new UsernameNotAvailableError(data.username);
      }

      // 3. Check email uniqueness
      const emailExists = await tx.athlete.findUnique({
        where: { email: data.email },
        select: { id: true },
      });

      if (emailExists) {
        throw new EmailNotAvailableError();
      }

      // 4. Create athlete profile
      console.log("👤 Creating athlete profile");
      const athlete = await tx.athlete.create({
        data: {
          // Clerk integration
          clerkUserId,

          // Identity
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,

          // Personal
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          bio: data.bio,

          // Image
          profileImage: data.profileImage || null,

          // Sports
          primarySport: data.primarySport,
          secondarySport: data.secondarySport || null,

          // Location
          country: data.country,
          state: data.state,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,

          // Defaults
          rank: "PAWN",
          class: "E",
          roles: ["ATHLETE"],
          isAdmin: false,
          onboardingComplete: true,
        },
      });

      // 5. Initialize counters
      console.log("📊 Initializing athlete counters");
      await tx.athleteCounters.create({
        data: {
          athleteId: athlete.id,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
        },
      });

      // 6. Initialize empty stats (optional - for future use)
      console.log("📈 Creating empty stats record");
      await tx.stats.create({
        data: {
          athleteId: athlete.id,
        },
      });

      console.log("✅ Profile created successfully:", athlete.id);

      return {
        athleteId: athlete.id,
        username: athlete.username,
        message: "Profile created successfully",
      };
    },
    {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    }
  );
}

// =============================================================================
// PROFILE RETRIEVAL
// =============================================================================

/**
 * Get own profile (full access)
 *
 * @throws {AthleteNotFoundError} If athlete not found
 */
export async function getOwnProfileService(
  clerkUserId: string
): Promise<OwnProfileResponse> {
  console.log("📋 Fetching own profile");

  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId },
    include: {
      counters: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      teamMembership: true,
    },
  });

  if (!athlete) {
    throw new AthleteNotFoundError(clerkUserId);
  }

  // Ensure counters exist (safety check)
  if (!athlete.counters) {
    console.log("🔢 Creating missing counters");
    await prisma.athleteCounters.create({
      data: {
        athleteId: athlete.id,
        followersCount: athlete._count.followers,
        followingCount: athlete._count.following,
        postsCount: 0,
      },
    });

    // Refetch with counters
    const athleteWithCounters = await prisma.athlete.findUnique({
      where: { id: athlete.id },
      include: {
        counters: true,
        teamMembership: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!athleteWithCounters) {
      throw new AthleteNotFoundError(clerkUserId);
    }

    return formatOwnProfile(athleteWithCounters);
  }

  console.log("✅ Own profile fetched successfully");
  return formatOwnProfile(athlete);
}

/**
 * Get athlete by ID (used internally)
 *
 * @throws {AthleteNotFoundError} If athlete not found
 */
export async function getAthleteByIdService(athleteId: any) {
  console.log("📋 Fetching athlete by ID:", athleteId);

  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: athleteId },
    include: {
      counters: true,
      teamMembership: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!athlete) {
    throw new AthleteNotFoundError(athleteId);
  }

  console.log("✅ Athlete fetched successfully");
  return formatPublicProfile(athlete);
}

/**
 * Get athlete by username (public profile)
 *
 * @throws {AthleteNotFoundError} If athlete not found
 */
export async function getAthleteByUsernameService(username: any) {
  console.log("📋 Fetching athlete by username:", username);

  const athlete = await prisma.athlete.findUnique({
    where: { username },
    include: {
      counters: true,
      teamMembership: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!athlete) {
    throw new AthleteNotFoundError(username);
  }

  console.log("✅ Athlete fetched successfully");
  return formatPublicProfile(athlete);
}

// =============================================================================
// PROFILE UPDATE
// =============================================================================

/**
 * Update athlete profile
 *
 * @throws {AthleteNotFoundError} If athlete not found
 * @throws {UsernameNotAvailableError} If username is taken
 */
export async function updateProfileService(
  clerkUserId: string,
  updates: ProfileUpdateInput
): Promise<ProfileUpdateResult> {
  console.log("🔄 Starting profile update service");

  return await prisma.$transaction(async (tx) => {
    // 1. Get existing athlete
    const athlete = await tx.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true, username: true },
    });

    if (!athlete) {
      throw new AthleteNotFoundError(clerkUserId);
    }

    // 2. Check username uniqueness (if changing)
    if (updates.username && updates.username !== athlete.username) {
      const usernameExists = await tx.athlete.findUnique({
        where: { username: updates.username },
        select: { id: true },
      });

      if (usernameExists) {
        throw new UsernameNotAvailableError(updates.username);
      }
    }

    // 3. Build update data (only defined fields)
    const updateData: Prisma.AthleteUpdateInput = {};

    // Identity
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.firstName !== undefined)
      updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;

    // Personal
    if (updates.dateOfBirth !== undefined) {
      updateData.dateOfBirth = new Date(updates.dateOfBirth);
    }
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.bio !== undefined) updateData.bio = updates.bio;

    // Image
    if (updates.profileImage !== undefined) {
      updateData.profileImage = updates.profileImage || null;
    }

    // Sports
    if (updates.primarySport !== undefined) {
      updateData.primarySport = updates.primarySport;
    }
    if (updates.secondarySport !== undefined) {
      updateData.secondarySport = updates.secondarySport || null;
    }

    // Location
    if (updates.country !== undefined) updateData.country = updates.country;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
    if (updates.longitude !== undefined)
      updateData.longitude = updates.longitude;

    // 4. Update athlete if there are changes
    if (Object.keys(updateData).length === 0) {
      console.log("ℹ️ No fields to update");
      return {
        athleteId: athlete.id,
        username: athlete.username,
        message: "No changes to update",
      };
    }

    console.log("👤 Updating athlete with fields:", Object.keys(updateData));
    const updatedAthlete = await tx.athlete.update({
      where: { clerkUserId },
      data: updateData,
    });

    console.log("✅ Profile updated successfully");
    return {
      athleteId: updatedAthlete.id,
      username: updatedAthlete.username,
      message: "Profile updated successfully",
    };
  });
}

// =============================================================================
// PROFILE DELETION
// =============================================================================

/**
 * Delete athlete profile (hard delete with cascade)
 * Use with caution - this is irreversible
 *
 * @throws {AthleteNotFoundError} If athlete not found
 */
export async function deleteProfileService(
  clerkUserId: string
): Promise<{ athleteId: string; message: string }> {
  console.log("🗑️ Starting profile deletion service");

  return await prisma.$transaction(async (tx) => {
    // Find athlete
    const athlete = await tx.athlete.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!athlete) {
      throw new AthleteNotFoundError(clerkUserId);
    }

    // Hard delete (cascades to all relations due to onDelete: Cascade in schema)
    await tx.athlete.delete({
      where: { clerkUserId },
    });

    console.log("✅ Profile deleted successfully");
    return {
      athleteId: athlete.id,
      message: "Profile deleted successfully",
    };
  });
}

// =============================================================================
// PROFILE CHECKS
// =============================================================================

/**
 * Check if profile exists for Clerk user
 */
export async function checkProfileExistsService(clerkUserId: string) {
  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      username: true,
      onboardingComplete: true,
    },
  });

  return {
    hasProfile: !!athlete,
    needsOnboarding: athlete ? !athlete.onboardingComplete : true,
    athlete: athlete
      ? {
          id: athlete.id,
          username: athlete.username,
          firstName: "",
          lastName: "",
          profileImage: null,
          primarySport: "OTHER" as any,
          rank: "PAWN" as any,
          class: "E" as any,
          city: "",
          country: "",
        }
      : null,
  };
}

/**
 * Check username availability
 */
export async function checkUsernameAvailability(
  username: string,
  excludeClerkUserId?: string
) {
  const athlete = await prisma.athlete.findUnique({
    where: { username },
    select: { clerkUserId: true },
  });

  // Available if not found, or if it's the current user's username
  const isAvailable = !athlete || athlete.clerkUserId === excludeClerkUserId;

  return {
    available: isAvailable,
    username,
  };
}

// =============================================================================
// PROFILE SEARCH
// =============================================================================

/**
 * Search athletes with filters and pagination
 */
export async function searchAthletesService(
  params: ProfileSearchParams
): Promise<{
  athletes: ProfileSummaryResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  console.log("🔍 Searching athletes with params:", params);

  // Build where clause
  const where: Prisma.AthleteWhereInput = {
    onboardingComplete: true, // Only show completed profiles
  };

  // Search query
  if (params.q) {
    where.OR = [
      { username: { contains: params.q, mode: "insensitive" } },
      { firstName: { contains: params.q, mode: "insensitive" } },
      { lastName: { contains: params.q, mode: "insensitive" } },
    ];
  }

  // Filters
  if (params.sport) {
    where.primarySport = params.sport;
  }
  if (params.city) {
    where.city = { contains: params.city, mode: "insensitive" };
  }
  if (params.state) {
    where.state = { contains: params.state, mode: "insensitive" };
  }
  if (params.country) {
    where.country = { contains: params.country, mode: "insensitive" };
  }

  // Count total matching records
  const totalCount = await prisma.athlete.count({ where });

  // Fetch paginated results
  const athletes = await prisma.athlete.findMany({
    where,
    include: {
      counters: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
    orderBy: {
      [params.sortBy]: params.sortOrder,
    },
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  });

  const totalPages = Math.ceil(totalCount / params.pageSize);

  console.log(`✅ Found ${totalCount} athletes, returning page ${params.page}`);

  return {
    athletes: formatProfileSummaries(athletes),
    totalCount,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Initialize missing counters for all athletes (maintenance)
 */
export async function initializeMissingCounters(): Promise<number> {
  const athletesWithoutCounters = await prisma.athlete.findMany({
    where: {
      counters: null,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  for (const athlete of athletesWithoutCounters) {
    await prisma.athleteCounters.create({
      data: {
        athleteId: athlete.id,
        followersCount: athlete._count.followers,
        followingCount: athlete._count.following,
        postsCount: 0,
      },
    });
  }

  return athletesWithoutCounters.length;
}
