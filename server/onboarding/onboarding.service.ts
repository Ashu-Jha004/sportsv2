// src/server/onboarding/onboarding.service.ts
import type { OnboardingRequestDTO } from "@/lib/validations/onboarding/onboarding.dto";
import { OnboardingRepository } from "./onboarding.repository";
import { ClerkOnboardingGateway } from "./clerk.gateway";

export type CompleteOnboardingResult = {
  success: boolean;
  error?: string;
};

export class OnboardingService {
  private readonly repo: OnboardingRepository;
  private readonly clerkGateway: ClerkOnboardingGateway;

  constructor(
    repo = new OnboardingRepository(),
    clerkGateway = new ClerkOnboardingGateway()
  ) {
    this.repo = repo;
    this.clerkGateway = clerkGateway;
  }

  async completeOnboarding(
    userId: string,
    payload: OnboardingRequestDTO
  ): Promise<CompleteOnboardingResult> {
    try {
      // 1. Persist to your own DB
      await this.repo.upsertByClerkUserId(userId, payload);

      // 2. Update Clerk metadata (mirror)
      await this.clerkGateway.updateOnboardingMetadata(userId, payload);

      return { success: true };
    } catch (err) {
      // TODO: replace with proper logger (Sentry, etc.)
      console.error("Error completing onboarding:", err);
      return {
        success: false,
        error: "Failed to complete onboarding. Please try again.",
      };
    }
  }
}
