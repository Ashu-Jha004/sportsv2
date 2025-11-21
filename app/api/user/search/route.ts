// app/api/athlete/search/route.ts

/**
 * =============================================================================
 * ATHLETE SEARCH API
 * =============================================================================
 * Search and filter athletes with pagination
 */

import { NextRequest } from "next/server";
import { validateSearchParams } from "../validation";
import { searchAthletesService } from "../profile-service";
import { profileSearchSchema } from "../profile-schemas";
import {
  createPaginatedResponse,
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
// GET - Search Athletes
// =============================================================================

/**
 * Search athletes with filters and pagination
 *
 * @route GET /api/athlete/search?q=john&sport=FOOTBALL&page=1&pageSize=20
 * @access Public
 *
 * @query q - Search query (optional)
 * @query sport - Filter by sport (optional)
 * @query city - Filter by city (optional)
 * @query state - Filter by state (optional)
 * @query country - Filter by country (optional)
 * @query page - Page number (default: 1)
 * @query pageSize - Results per page (default: 20, max: 100)
 * @query sortBy - Sort field (default: createdAt)
 * @query sortOrder - Sort direction (default: desc)
 *
 * @returns {PaginatedResponse<ProfileSummaryResponse>} Search results
 */
export async function GET(req: NextRequest) {
  try {
    console.log("--- 🔍 ATHLETE SEARCH REQUEST ---");

    // 1. Validate search params
    const { searchParams } = new URL(req.url);
    const params = await validateSearchParams(
      searchParams,
      profileSearchSchema
    );
    console.log("✅ Search params validated:", params);

    // 2. Search athletes
    const result = await searchAthletesService(params);
    console.log(`✅ Found ${result.totalCount} athletes`);

    // 3. Return paginated results
    return createPaginatedResponse(result.athletes, {
      page: result.page,
      pageSize: result.pageSize,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      hasNextPage: result.page < result.totalPages,
      hasPreviousPage: result.page > 1,
    });
  } catch (error) {
    console.error("❌ Athlete search failed:", error);
    return handleApiError(error, "athlete search");
  }
}
