// lib/api/utils/response-utils.ts

/**
 * =============================================================================
 * API RESPONSE UTILITIES (FIXED)
 * =============================================================================
 * Next.js 15+ compatible | Vercel optimized
 * Handles all response formatting and error conversion
 */

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import {
  ApiError,
  isApiError,
  ValidationError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
  InternalServerError,
  BadRequestError,
  UnprocessableEntityError,
} from "./api-error";
import type { PaginationMeta } from "./athlete.types";

// =============================================================================
// RESPONSE INTERFACES
// =============================================================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
  timestamp: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// =============================================================================
// SUCCESS RESPONSES
// =============================================================================

/**
 * Create standardized success response
 */
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  pagination: PaginationMeta
): NextResponse<ApiResponse<{ items: T[]; pagination: PaginationMeta }>> {
  return createApiResponse(
    {
      items,
      pagination,
    },
    200
  );
}

/**
 * Create "created" response (201)
 */
export function createCreatedResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return createApiResponse(
    data,
    201,
    message || "Resource created successfully"
  );
}

/**
 * Create "no content" response (204)
 */
export function createNoContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// =============================================================================
// ERROR RESPONSES
// =============================================================================

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };

  if (code) {
    response.code = code;
  }

  // Only include details in development
  if (process.env.NODE_ENV === "development" && details) {
    response.details = details;
  }

  return NextResponse.json(response, { status: statusCode });
}

// =============================================================================
// PRISMA ERROR HANDLER
// =============================================================================

/**
 * Convert Prisma errors to API errors
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): ApiError {
  console.error("🗄️ Prisma Error:", {
    code: error.code,
    meta: error.meta,
    message: error.message,
  });

  switch (error.code) {
    // Unique constraint violation
    case "P2002": {
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || "field";

      // Map common fields to user-friendly messages
      const fieldMessages: Record<string, string> = {
        username: "This username is already taken",
        email: "This email address is already registered",
        clerkUserId: "This account is already connected",
      };

      const message = fieldMessages[field] || `This ${field} already exists`;
      return new ConflictError(message, field);
    }

    // Foreign key constraint violation
    case "P2003": {
      const field = error.meta?.field_name as string | undefined;
      return new BadRequestError(
        `Invalid reference: ${field || "related record not found"}`,
        { field, constraint: "foreign_key" }
      );
    }

    // Record not found (used in update/delete)
    case "P2025": {
      return new NotFoundError("Record not found or already deleted");
    }

    // Required relation violation
    case "P2014": {
      return new BadRequestError(
        "Cannot delete: record has related dependencies",
        { constraint: "relation_violation" }
      );
    }

    // Record doesn't exist in where condition
    case "P2001": {
      return new NotFoundError("Record not found");
    }

    // Null constraint violation
    case "P2011": {
      const constraint = error.meta?.constraint as string | undefined;
      return new BadRequestError(
        `Missing required field: ${constraint || "unknown"}`,
        { field: constraint, constraint: "null_violation" }
      );
    }

    // Invalid value for field type
    case "P2006": {
      const field = error.meta?.field_name as string | undefined;
      return new BadRequestError(
        `Invalid value provided for field: ${field || "unknown"}`,
        { field }
      );
    }

    // Connection timeout
    case "P2024": {
      return new ServiceUnavailableError("Database");
    }

    // Connection pool timeout
    case "P2037": {
      return new ServiceUnavailableError("Database connection pool");
    }

    default:
      return new InternalServerError("A database error occurred", {
        prismaCode: error.code,
      });
  }
}

/**
 * Handle Prisma validation errors
 */
function handlePrismaValidationError(
  error: Prisma.PrismaClientValidationError
): ApiError {
  console.error("🗄️ Prisma Validation Error:", error.message);

  return new BadRequestError("Invalid data provided to database", {
    type: "validation",
    message: error.message,
  });
}

/**
 * Handle Prisma initialization errors
 */
function handlePrismaInitializationError(
  error: Prisma.PrismaClientInitializationError
): ApiError {
  console.error("🗄️ Prisma Initialization Error:", error.message);

  return new ServiceUnavailableError("Database");
}

// =============================================================================
// ZOD ERROR HANDLER (FIXED)
// =============================================================================

/**
 * Convert Zod validation errors to API errors
 */
function handleZodError(error: ZodError): ValidationError {
  const fieldErrors = error.flatten().fieldErrors;

  // Create user-friendly error messages with proper typing
  const formattedErrors: Record<string, string[]> = {};

  // TypeScript-safe iteration over fieldErrors
  for (const [field, errors] of Object.entries(fieldErrors)) {
    // errors is of type string[] | undefined
    if (Array.isArray(errors) && errors.length > 0) {
      formattedErrors[field] = errors;
    }
  }

  return new ValidationError("Validation failed. Please check your input.", {
    fields: formattedErrors,
    issues: error.issues, // Use .issues instead of .errors
  });
}

// =============================================================================
// MAIN ERROR HANDLER
// =============================================================================

/**
 * Main error handler - converts all errors to proper API responses
 */
export function handleApiError(
  error: unknown,
  context?: string
): NextResponse<ApiErrorResponse> {
  // Log error with context
  const logPrefix = context ? `❌ Error in ${context}:` : "❌ API Error:";
  console.error(logPrefix, error);

  // 1. Handle custom ApiError instances
  if (isApiError(error)) {
    return createErrorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details
    );
  }

  // 2. Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = handleZodError(error);
    return createErrorResponse(
      validationError.message,
      validationError.statusCode,
      validationError.code,
      validationError.details
    );
  }

  // 3. Handle Prisma known errors (P2002, P2025, etc.)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    return createErrorResponse(
      prismaError.message,
      prismaError.statusCode,
      prismaError.code,
      prismaError.details
    );
  }

  // 4. Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    const validationError = handlePrismaValidationError(error);
    return createErrorResponse(
      validationError.message,
      validationError.statusCode,
      validationError.code,
      validationError.details
    );
  }

  // 5. Handle Prisma initialization errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    const initError = handlePrismaInitializationError(error);
    return createErrorResponse(
      initError.message,
      initError.statusCode,
      initError.code,
      initError.details
    );
  }

  // 6. Handle generic Error instances
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes("ECONNREFUSED")) {
      return createErrorResponse(
        "Service temporarily unavailable",
        503,
        "SERVICE_UNAVAILABLE"
      );
    }

    if (error.message.includes("ETIMEDOUT")) {
      return createErrorResponse("Request timeout", 504, "GATEWAY_TIMEOUT");
    }

    // Generic error
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "An error occurred";

    return createErrorResponse(message, 500, "INTERNAL_SERVER_ERROR");
  }

  // 7. Unknown error type
  return createErrorResponse(
    "An unexpected error occurred",
    500,
    "UNKNOWN_ERROR",
    { type: typeof error }
  );
}

// =============================================================================
// REQUEST VALIDATION HELPERS
// =============================================================================

/**
 * Validate Content-Type header
 */
export function validateContentType(req: Request): void {
  const contentType = req.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    throw new BadRequestError("Content-Type must be application/json", {
      received: contentType,
      expected: "application/json",
    });
  }
}

/**
 * Validate request body size
 */
export function validateRequestSize(
  req: Request,
  maxSizeBytes: number = 1024 * 1024 // 1MB default
): void {
  const contentLength = req.headers.get("content-length");

  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    throw new BadRequestError(
      `Request body too large. Maximum size: ${maxSizeBytes} bytes`,
      { maxSize: maxSizeBytes, received: parseInt(contentLength) }
    );
  }
}

/**
 * Parse and validate JSON body
 */
export async function parseJsonBody<T = any>(req: Request): Promise<T> {
  try {
    validateContentType(req);
    const body = await req.json();
    return body as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new BadRequestError("Invalid JSON format in request body");
    }
    throw error;
  }
}

// =============================================================================
// CORS HELPERS (for Vercel deployment)
// =============================================================================

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleOptionsRequest(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}

// =============================================================================
// LOGGING HELPERS
// =============================================================================

/**
 * Check if error should be logged to monitoring service
 */
export function shouldLogToMonitoring(error: unknown): boolean {
  // Log all 5xx errors
  if (isApiError(error)) {
    return error.statusCode >= 500;
  }

  // Log unknown errors
  return true;
}

/**
 * Log error to console with proper formatting
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : "[API]";

  console.error(`${timestamp} ${prefix}`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...(isApiError(error) && {
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    }),
  });
}
