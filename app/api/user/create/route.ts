// app/api/athlete/profile/route.ts

/**
 * =============================================================================
 * ATHLETE PROFILE API ROUTES
 * =============================================================================
 * Endpoints for profile creation and retrieval
 * Next.js 15+ App Router
 */

import { NextRequest } from "next/server";
import { authenticateUser } from "../auth";
import { validateRequestBody } from "../validation";
import {
  createProfileService,
  getOwnProfileService,
  checkProfileExistsService,
} from "../profile-service";
import { profileCreateSchema } from "../profile-schemas";
import {
  createApiResponse,
  createCreatedResponse,
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
// POST - Create Profile (Onboarding)
// =============================================================================

/**
 * Create new athlete profile
 *
 * @route POST /api/athlete/profile
 * @access Authenticated (requires Clerk session)
 * @body ProfileCreateInput
 *
 * @returns {ProfileCreateResult} Created profile info
 *
 * @throws {AuthenticationError} 401 - Not authenticated
 * @throws {ProfileAlreadyExistsError} 409 - Profile already exists
 * @throws {UsernameNotAvailableError} 409 - Username taken
 * @throws {EmailNotAvailableError} 409 - Email taken
 * @throws {ValidationError} 400 - Invalid input
 */
export async function POST(req: NextRequest) {
  try {
    console.log("--- 📝 PROFILE CREATE REQUEST ---");

    // 1. Authenticate user
    const user = await authenticateUser();
    console.log(`✅ User authenticated: ${user.clerkUserId}`);

    // 2. Validate request body
    const validatedData = await validateRequestBody(req, profileCreateSchema);
    console.log("✅ Request body validated");

    // 3. Create profile
    const result = await createProfileService(user.clerkUserId, validatedData);
    console.log(`✅ Profile created: ${result.athleteId}`);

    // 4. Return success response
    return createCreatedResponse(result, "Profile created successfully");
  } catch (error) {
    console.error("❌ Profile creation failed:", error);
    return handleApiError(error, "profile creation");
  }
}

// =============================================================================
// GET - Get Own Profile
// =============================================================================

/**
 * Get current user's own profile (full access)
 *
 * @route GET /api/athlete/profile
 * @access Authenticated
 *
 * @returns {OwnProfileResponse} Full profile with private data
 *
 * @throws {AuthenticationError} 401 - Not authenticated
 * @throws {AthleteNotFoundError} 404 - Profile not found
 */
export async function GET() {
  try {
    console.log("--- 📋 GET OWN PROFILE REQUEST ---");

    // 1. Authenticate user
    const user = await authenticateUser();
    console.log(`✅ User authenticated: ${user.clerkUserId}`);

    // 2. Get own profile
    const profile = await getOwnProfileService(user.clerkUserId);
    console.log(`✅ Profile fetched: ${profile.clerkUserId}`);

    // 3. Return profile data
    return createApiResponse(profile);
  } catch (error) {
    console.error("❌ Profile fetch failed:", error);
    return handleApiError(error, "profile fetch");
  }
}
