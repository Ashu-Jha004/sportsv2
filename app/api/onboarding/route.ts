// app/api/onboarding/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";
import { OnboardingRequestSchema } from "@/lib/validations/onboarding/onboarding.dto";
import {
  OnboardingService,
  ServiceErrorCode,
} from "@/server/onboarding/onboarding.service";

const service = new OnboardingService();

// Type-safe API response
type ApiResponse<T = any> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string; details?: any };

export async function POST(request: Request) {
  try {
    // 1. Auth check via Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Authentication required. Please sign in to continue.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid request body. Please check your data format.",
          code: "INVALID_JSON",
        },
        { status: 400 }
      );
    }

    // 3. Validate payload with Zod
    let payload;
    try {
      payload = OnboardingRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract first validation error for user-friendly message
        const firstError = error.issues[0];
        const fieldPath = firstError.path.join(".");
        const message = firstError.message;

        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: `Validation error: ${fieldPath} - ${message}`,
            code: "VALIDATION_ERROR",
            details:
              process.env.NODE_ENV === "development"
                ? error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                  }))
                : undefined,
          },
          { status: 400 }
        );
      }

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid onboarding data provided.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // 4. Call service layer
    const result = await service.completeOnboarding(userId, payload);

    if (!result.success) {
      // Map service error codes to HTTP status codes
      const statusCode = mapServiceErrorToStatusCode(result.code);

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error,
          code: result.code,
        },
        { status: statusCode }
      );
    }

    // 5. Success response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          athlete: {
            id: result.athlete?.id,
            username: result.athlete?.username,
            email: result.athlete?.email,
            onboardingComplete: result.athlete?.onboardingComplete,
          },
        },
        message: result.message || "Onboarding completed successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    // Unexpected errors
    console.error("API Route: Unexpected error in /api/onboarding:", error);

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: isDevelopment
          ? `Internal server error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          : "An unexpected error occurred. Please try again later.",
        code: "INTERNAL_ERROR",
        details:
          isDevelopment && error instanceof Error
            ? { stack: error.stack }
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Map service error codes to appropriate HTTP status codes
 */
function mapServiceErrorToStatusCode(code: ServiceErrorCode): number {
  const statusMap: Record<ServiceErrorCode, number> = {
    [ServiceErrorCode.VALIDATION_ERROR]: 400,
    [ServiceErrorCode.DUPLICATE_ENTRY]: 409, // Conflict
    [ServiceErrorCode.ALREADY_ONBOARDED]: 200, // OK (idempotent)
    [ServiceErrorCode.USER_NOT_FOUND]: 404,
    [ServiceErrorCode.CLERK_SYNC_FAILED]: 502, // Bad Gateway
    [ServiceErrorCode.DATABASE_ERROR]: 500,
    [ServiceErrorCode.UNKNOWN]: 500,
  };

  return statusMap[code] || 500;
}

/**
 * GET endpoint - Check onboarding status
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Authentication required.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const status = await service.checkOnboardingStatus(userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          isComplete: status.isComplete,
          athlete: status.athlete
            ? {
                id: status.athlete.id,
                username: status.athlete.username,
                email: status.athlete.email,
                firstName: status.athlete.firstName,
                lastName: status.athlete.lastName,
                onboardingComplete: status.athlete.onboardingComplete,
              }
            : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Route: Error in GET /api/onboarding:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to check onboarding status.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
