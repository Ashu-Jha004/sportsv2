// app/api/profile/update/route.ts

/**
 * =============================================================================
 * PROFILE UPDATE API
 * =============================================================================
 * Update athlete profile (partial updates supported)
 */

import { NextRequest } from "next/server";
import { authenticateUser } from "../auth";
import { validatePartialUpdate } from "../validation";
import { updateProfileService } from "../profile-service";
import { profileUpdateSchema } from "../profile-schemas";
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
// PATCH - Update Profile (Partial)
// =============================================================================

/**
 * Update athlete profile
 * Supports partial updates (only send fields to update)
 *
 * @route PATCH /api/athlete/profile/update
 * @access Authenticated (own profile only)
 * @body Partial<ProfileUpdateInput>
 *
 * @returns {ProfileUpdateResult} Update confirmation
 *
 * @throws {AuthenticationError} 401 - Not authenticated
 * @throws {AthleteNotFoundError} 404 - Profile not found
 * @throws {UsernameNotAvailableError} 409 - Username taken
 * @throws {ValidationError} 400 - Invalid input
 */
export async function PATCH(req: NextRequest) {
  try {
    console.log("--- ✏️ PROFILE UPDATE REQUEST ---");

    // 1. Authenticate user
    const user = await authenticateUser();
    console.log(`✅ User authenticated: ${user.clerkUserId}`);

    // 2. Parse and validate request body (partial)
    const body = await req.json();
    const updates = await validatePartialUpdate(body, profileUpdateSchema);
    console.log("✅ Updates validated:", Object.keys(updates));

    // 3. Update profile
    const result = await updateProfileService(user.clerkUserId, updates);
    console.log(`✅ Profile updated: ${result.athleteId}`);

    // 4. Return success response
    return createApiResponse(result, 200, result.message);
  } catch (error) {
    console.error("❌ Profile update failed:", error);
    return handleApiError(error, "profile update");
  }
}
