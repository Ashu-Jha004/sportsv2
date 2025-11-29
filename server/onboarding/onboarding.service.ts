// src/server/onboarding/onboarding.service.ts
import type { OnboardingRequestDTO } from "@/lib/validations/onboarding/onboarding.dto";
import {
  OnboardingRepository,
  RepositoryErrorCode,
  type AthleteEntity,
} from "./onboarding.repository";
import { ClerkOnboardingGateway } from "./clerk.gateway";
import prisma from "@/lib/prisma";

export enum ServiceErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  CLERK_SYNC_FAILED = "CLERK_SYNC_FAILED",
  DATABASE_ERROR = "DATABASE_ERROR",
  ALREADY_ONBOARDED = "ALREADY_ONBOARDED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  UNKNOWN = "UNKNOWN",
}

export type CompleteOnboardingResult =
  | {
      success: true;
      athlete: AthleteEntity;
      message?: string;
    }
  | {
      success: false;
      error: string;
      code: ServiceErrorCode;
    };

export class OnboardingService {
  private readonly repo: OnboardingRepository;
  private readonly clerkGateway: ClerkOnboardingGateway;

  constructor(
    repo = new OnboardingRepository(prisma),
    clerkGateway = new ClerkOnboardingGateway()
  ) {
    this.repo = repo;
    this.clerkGateway = clerkGateway;
  }

  /**
   * Check if user has already completed onboarding
   */
  async checkOnboardingStatus(userId: string): Promise<{
    isComplete: boolean;
    athlete: AthleteEntity | null;
  }> {
    const athlete = await this.repo.findByClerkUserId(userId);
    return {
      isComplete: athlete?.onboardingComplete ?? false,
      athlete,
    };
  }

  /**
   * Validate uniqueness before onboarding
   */
  private async validateUniqueness(
    clerkUserId: string,
    payload: OnboardingRequestDTO
  ): Promise<
    { valid: true } | { valid: false; error: string; code: ServiceErrorCode }
  > {
    // Check username uniqueness (only for new users)
    const existingAthlete = await this.repo.findByClerkUserId(clerkUserId);

    // If updating own record, skip username/email checks
    if (!existingAthlete) {
      const usernameExists = await this.repo.findByUsername(
        payload.profile.username
      );
      if (usernameExists) {
        return {
          valid: false,
          error: "This username is already taken. Please choose another.",
          code: ServiceErrorCode.DUPLICATE_ENTRY,
        };
      }

      const emailExists = await this.repo.findByEmail(payload.profile.email);
      if (emailExists) {
        return {
          valid: false,
          error: "This email is already registered.",
          code: ServiceErrorCode.DUPLICATE_ENTRY,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Complete onboarding with transaction safety and Clerk sync
   */
  async completeOnboarding(
    userId: string,
    payload: OnboardingRequestDTO
  ): Promise<CompleteOnboardingResult> {
    try {
      // Step 1: Check if already onboarded
      const status = await this.checkOnboardingStatus(userId);
      if (status.isComplete && status.athlete) {
        return {
          success: true,
          athlete: status.athlete,
          message: "Onboarding already completed.",
        };
      }

      // Step 2: Validate uniqueness
      const validation = await this.validateUniqueness(userId, payload);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          code: validation.code,
        };
      }

      // Step 3: Persist to database
      const dbResult = await this.repo.upsertByClerkUserId(userId, payload);

      if (!dbResult.success) {
        // Map repository errors to service errors
        return {
          success: false,
          error: dbResult.error,
          code: this.mapRepositoryErrorCode(dbResult.code),
        };
      }

      // Step 4: Update Clerk metadata (with retry)
      try {
        await this.updateClerkWithRetry(userId, payload, 3);
      } catch (clerkError) {
        // Compensating transaction: mark onboarding as incomplete
        console.error(
          "Clerk sync failed, rolling back onboarding status:",
          clerkError
        );

        await this.repo.markOnboardingIncomplete(userId);

        return {
          success: false,
          error:
            "Failed to sync with authentication service. Please try again.",
          code: ServiceErrorCode.CLERK_SYNC_FAILED,
        };
      }

      // Step 5: Success
      return {
        success: true,
        athlete: dbResult.data,
      };
    } catch (error) {
      console.error("Service: completeOnboarding unexpected error:", error);

      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        code: ServiceErrorCode.UNKNOWN,
      };
    }
  }

  /**
   * Update Clerk metadata with exponential backoff retry
   */
  private async updateClerkWithRetry(
    userId: string,
    payload: OnboardingRequestDTO,
    maxRetries: number = 3
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.clerkGateway.updateOnboardingMetadata(
          userId,
          payload
        );

        if (result.success) {
          return; // Success
        } else {
          throw new Error("Clerk update failed");
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Don't retry on non-retryable errors (404, 401, etc.)
        if (this.isNonRetryableError(error)) {
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error("Failed to update Clerk after retries");
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: unknown): boolean {
    if (error && typeof error === "object" && "status" in error) {
      const status = (error as any).status;
      // Don't retry client errors (400-499)
      return status >= 400 && status < 500;
    }
    return false;
  }

  /**
   * Map repository error codes to service error codes
   */
  private mapRepositoryErrorCode(
    repoCode: RepositoryErrorCode
  ): ServiceErrorCode {
    const mapping: Record<RepositoryErrorCode, ServiceErrorCode> = {
      [RepositoryErrorCode.DUPLICATE_ENTRY]: ServiceErrorCode.DUPLICATE_ENTRY,
      [RepositoryErrorCode.INVALID_DATA]: ServiceErrorCode.VALIDATION_ERROR,
      [RepositoryErrorCode.NOT_FOUND]: ServiceErrorCode.USER_NOT_FOUND,
      [RepositoryErrorCode.DATABASE_ERROR]: ServiceErrorCode.DATABASE_ERROR,
    };

    return mapping[repoCode] || ServiceErrorCode.UNKNOWN;
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get athlete profile by clerk user ID
   */
  async getAthleteProfile(userId: string): Promise<AthleteEntity | null> {
    return await this.repo.findByClerkUserId(userId);
  }
}
