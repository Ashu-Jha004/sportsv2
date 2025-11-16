// src/server/onboarding/clerk.gateway.ts
import { clerkClient } from "@clerk/nextjs/server";
import type { OnboardingRequestDTO } from "@/lib/validations/onboarding/onboarding.dto";

export class ClerkOnboardingGateway {
  async updateOnboardingMetadata(
    userId: string,
    payload: OnboardingRequestDTO
  ) {
    const { profile, sports, location } = payload;

    // Use updateUserMetadata to merge instead of overwrite
    const res = await (
      await clerkClient()
    ).users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        // Mirror selected fields for quick access via Clerk sessionClaims
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        primarySport: sports.primarySport,
        secondarySport: sports.secondarySport ?? null,
        country: location.country,
        state: location.state,
        city: location.city,
      },
    });

    return res.publicMetadata;
  }
}
