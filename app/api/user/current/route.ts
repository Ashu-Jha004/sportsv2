// api/user/current/route.ts
import { NextResponse } from "next/server";
import { getOwnProfileService } from "../profile-service";
import { handleApiError, createApiResponse } from "../response-utils";
import { authenticateUser } from "../auth";

/**
 * =============================================================================
 * CURRENT USER PROFILE API ENDPOINT
 * =============================================================================
 */

export async function GET() {
  console.log("📋 Fetching current user profile...");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Get current profile service
    const profileData = await getOwnProfileService(user.clerkUserId);

    console.log("✅ Current profile fetched successfully");

    // Step 3: Success response
    return createApiResponse({
      ...profileData,
      isOwnProfile: true,
      friendshipStatus: "self",
      isFollowing: false,
      isFollowedBy: false,
      showDetailedStats: true,
    });
  } catch (error) {
    console.error("❌ Current profile fetch failed:", error);
    return handleApiError(error, "current profile fetch");
  }
}
