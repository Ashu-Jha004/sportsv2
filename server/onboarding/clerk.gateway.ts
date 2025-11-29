// src/server/onboarding/clerk.gateway.ts
import { clerkClient } from "@clerk/nextjs/server";
import type { OnboardingRequestDTO } from "@/lib/validations/onboarding/onboarding.dto";

export type ClerkOnboardingMetadata = {
  onboardingComplete: boolean;
  username: string;
  firstName: string;
  lastName: string;
  primarySport: string;
  secondarySport?: string | null;
  location: {
    country: string;
    state: string;
    city: string;
  };
  syncedAt: string;
};

export type ClerkGatewayResult =
  | { success: true; metadata: ClerkOnboardingMetadata }
  | { success: false; error: string; status?: number };

export class ClerkOnboardingGateway {
  private client: ReturnType<typeof clerkClient> | null = null;

  private async getClient() {
    if (!this.client) {
      this.client = clerkClient();
    }
    return await this.client;
  }

  async updateOnboardingMetadata(
    userId: string,
    payload: OnboardingRequestDTO
  ): Promise<ClerkGatewayResult> {
    try {
      const { profile, sports, location } = payload;

      const metadata: ClerkOnboardingMetadata = {
        onboardingComplete: true,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        primarySport: sports.primarySport,
        secondarySport: sports.secondarySport ?? null,
        location: {
          country: location.country,
          state: location.state,
          city: location.city,
        },
        syncedAt: new Date().toISOString(),
      };

      // Validate metadata size (Clerk limit ~8KB)
      const metadataSize = JSON.stringify(metadata).length;
      if (metadataSize > 7500) {
        return {
          success: false,
          error: "Metadata size exceeds Clerk limits. Please reduce data size.",
        };
      }

      const client = await this.getClient();

      // Verify user exists first
      try {
        await client.users.getUser(userId);
      } catch (error: any) {
        if (error.status === 404) {
          return {
            success: false,
            error: `User ${userId} not found in Clerk`,
            status: 404,
          };
        }
        throw error;
      }

      // Update metadata - use publicMetadata for session access
      // For sensitive data, use privateMetadata instead
      const result = await client.users.updateUserMetadata(userId, {
        publicMetadata: metadata,
      });

      return {
        success: true,
        metadata: result.publicMetadata as ClerkOnboardingMetadata,
      };
    } catch (error: any) {
      console.error("ClerkGateway: updateOnboardingMetadata error:", error);

      // Handle specific Clerk errors
      if (error.status === 404) {
        return {
          success: false,
          error: "User not found in authentication service",
          status: 404,
        };
      }

      if (error.status === 429) {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          status: 429,
        };
      }

      if (error.status === 401 || error.status === 403) {
        return {
          success: false,
          error: "Authentication failed",
          status: error.status,
        };
      }

      return {
        success: false,
        error: error.message || "Failed to update authentication metadata",
        status: error.status,
      };
    }
  }

  /**
   * Verify if user exists in Clerk
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.users.getUser(userId);
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}
