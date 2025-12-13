// app/api/athlete/[username]/route.ts

/**
 * =============================================================================
 * PUBLIC ATHLETE PROFILE API
 * =============================================================================
 * Get athlete profile by username (public view)
 */

import { NextRequest } from "next/server";
import { optionalAuth } from "../auth";
import { getAthleteByUsernameService } from "../profile-service";
import {
  createApiResponse,
  handleApiError,
  handleOptionsRequest,
} from "../response-utils";

// =============================================================================
// OPTIONS - CORS Preflight
// =============================================================================

export async function OPTIONS() {
  return handleOptionsRequest();
}

// =============================================================================
// GET - Get Athlete by Username (Public)
// =============================================================================

/**
 * Get athlete profile by username
 * Public endpoint (no authentication required)
 * Returns privacy-protected data (no email, DOB, exact coordinates)
 *
 * @route GET /api/athlete/[username]
 * @access Public
 *
 * @returns {PublicProfileResponse} Public profile data
 *
 * @throws {AthleteNotFoundError} 404 - Athlete not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    // 1. Get username from params
    const { username } = await params;

    if (!username) {
      return createApiResponse({ error: "Username is required" }, 400);
    }

    // 2. Optional authentication (for future features like relationship status)
    const auth = await optionalAuth();
    const viewerAthleteId = auth?.athleteId;

    // 3. Get athlete profile
    const profile = await getAthleteByUsernameService(username);

    // 4. Return public profile data
    return createApiResponse(profile);
  } catch (error) {
    console.error("❌ Profile fetch failed:", error);
    return handleApiError(error, "athlete profile fetch");
  }
}
