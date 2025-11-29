// src/server/onboarding/onboarding.repository.ts
import prisma from "@/lib/prisma";
import type { OnboardingRequestDTO } from "@/lib/validations/onboarding/onboarding.dto";
import { Prisma, type PrismaClient } from "@prisma/client";

export type AthleteEntity = Awaited<
  ReturnType<OnboardingRepository["findByClerkUserId"]>
>;

export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: RepositoryErrorCode };

export enum RepositoryErrorCode {
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  INVALID_DATA = "INVALID_DATA",
  DATABASE_ERROR = "DATABASE_ERROR",
}

export class OnboardingRepository {
  private readonly db: PrismaClient;

  constructor(dbClient?: PrismaClient) {
    this.db = dbClient ?? prisma;
  }

  async findByClerkUserId(clerkUserId: string) {
    try {
      return await this.db.athlete.findUnique({
        where: { clerkUserId },
      });
    } catch (error) {
      console.error("Repository: findByClerkUserId error", error);
      return null;
    }
  }

  async findByUsername(username: string) {
    try {
      return await this.db.athlete.findUnique({
        where: { username },
        select: { id: true, username: true },
      });
    } catch (error) {
      console.error("Repository: findByUsername error", error);
      return null;
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.db.athlete.findUnique({
        where: { email },
        select: { id: true, email: true },
      });
    } catch (error) {
      console.error("Repository: findByEmail error", error);
      return null;
    }
  }

  private validateDateOfBirth(dateString: string): Date {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date of birth format");
    }

    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();

    if (age < 5 || age > 120) {
      throw new Error("Date of birth must be between 5 and 120 years ago");
    }

    return date;
  }

  async upsertByClerkUserId(
    clerkUserId: string,
    payload: OnboardingRequestDTO
  ): Promise<RepositoryResult<AthleteEntity>> {
    try {
      const { profile, sports, location } = payload;

      // Validate date of birth
      let dateOfBirth: Date;
      try {
        dateOfBirth = this.validateDateOfBirth(profile.dateOfBirth);
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Invalid date of birth",
          code: RepositoryErrorCode.INVALID_DATA,
        };
      }

      // Build athlete data object (DRY - used for both create and update)
      const athleteData: Prisma.AthleteUpdateInput = {
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImage: profile.profileImage || null,
        dateOfBirth,
        gender: profile.gender,
        bio: profile.bio || null,
        primarySport: sports.primarySport,
        secondarySport: sports.secondarySport || null,
        country: location.country,
        state: location.state,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        onboardingComplete: true,
      };

      const result = await this.db.athlete.upsert({
        where: { clerkUserId },
        create: {
          clerkUserId,
          ...athleteData,
        } as Prisma.AthleteCreateInput,
        update: athleteData,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // Handle Prisma-specific errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) || [];
          const field = target[0] || "field";

          return {
            success: false,
            error: `This ${field} is already in use. Please choose another.`,
            code: RepositoryErrorCode.DUPLICATE_ENTRY,
          };
        }

        // Foreign key constraint violation
        if (error.code === "P2003") {
          return {
            success: false,
            error: "Invalid reference data provided.",
            code: RepositoryErrorCode.INVALID_DATA,
          };
        }
      }

      // Generic database error
      console.error("Repository: upsertByClerkUserId error", error);
      return {
        success: false,
        error: "Database operation failed. Please try again.",
        code: RepositoryErrorCode.DATABASE_ERROR,
      };
    }
  }

  async markOnboardingIncomplete(
    clerkUserId: string
  ): Promise<RepositoryResult<AthleteEntity>> {
    try {
      const result = await this.db.athlete.update({
        where: { clerkUserId },
        data: {
          onboardingComplete: false,
        },
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            error: "Athlete not found.",
            code: RepositoryErrorCode.NOT_FOUND,
          };
        }
      }

      console.error("Repository: markOnboardingIncomplete error", error);
      return {
        success: false,
        error: "Failed to update onboarding status.",
        code: RepositoryErrorCode.DATABASE_ERROR,
      };
    }
  }

  // Transaction support for complex operations
  async executeInTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return await this.db.$transaction(callback);
  }
}
