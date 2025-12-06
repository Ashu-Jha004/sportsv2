import { getUserTeam } from "@/actions/team.actions";
import { NextRequest, NextResponse } from "next/server";

// ============================================
// GET: Fetch authenticated user's team data
// ============================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("🌐 [API /api/team GET] Request received");

    // Fetch team data using server action
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athleteId") || undefined;
    console.log(
      "🔍 [API /api/team GET] AthleteId:",
      athleteId || "authenticated user"
    );
    let result = null;
    result = await getUserTeam(athleteId);

    const executionTime = Date.now() - startTime;

    // Handle no team case (not an error, just empty state)
    if (!result.success && result.errorCode === "NO_TEAM") {
      console.log(`ℹ️ [API /api/team GET] No team found (${executionTime}ms)`);
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "User is not a member of any team",
          errorCode: result.errorCode,
        },
        {
          status: 200, // 200 because it's a valid state, not an error
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Handle authentication errors
    if (!result.success && result.errorCode === "NO_AUTH") {
      console.error(
        `❌ [API /api/team GET] Authentication failed (${executionTime}ms)`
      );
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errorCode: result.errorCode,
          timestamp: new Date().toISOString(),
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Handle athlete not found
    if (!result.success && result.errorCode === "NO_ATHLETE") {
      console.error(
        `❌ [API /api/team GET] Athlete profile not found (${executionTime}ms)`
      );
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errorCode: result.errorCode,
          timestamp: new Date().toISOString(),
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Handle database or unknown errors
    if (!result.success) {
      console.error(
        `❌ [API /api/team GET] Error occurred (${executionTime}ms):`,
        result.error
      );
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to fetch team data",
          errorCode: result.errorCode || "UNKNOWN",
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Success response
    console.log(
      `✅ [API /api/team GET] Team data fetched successfully (${executionTime}ms)`
    );
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(
      `❌ [API /api/team GET] Unexpected error (${executionTime}ms):`,
      error
    );

    // Log detailed error information
    if (error instanceof Error) {
      console.error(`❌ [API /api/team GET] Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while fetching team data",
        errorCode: "UNEXPECTED_ERROR",
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

// ============================================
// OPTIONS: Handle CORS preflight
// ============================================

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: "GET, OPTIONS",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
