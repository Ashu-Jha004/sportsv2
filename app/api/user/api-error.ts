// lib/api/errors/api-errors.ts

/**
 * =============================================================================
 * API ERROR CLASSES - PROFILE OPERATIONS ONLY (FIXED)
 * =============================================================================
 * Aligned with Sparta Athlete schema
 * Next.js 15+ compatible | Vercel optimized
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      ...(process.env.NODE_ENV === "development" && {
        details: this.details,
        stack: this.stack,
      }),
    };
  }

  isOperational(): boolean {
    return this.statusCode < 500;
  }
}

// =============================================================================
// CLIENT ERRORS (4xx)
// =============================================================================

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad request", details?: Record<string, any>) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string = "Validation failed",
    details?: Record<string, any>
  ) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found", resourceType?: string) {
    super(
      message,
      404,
      "NOT_FOUND_ERROR",
      resourceType ? { resourceType } : undefined
    );
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Resource conflict", field?: string) {
    super(message, 409, "CONFLICT_ERROR", field ? { field } : undefined);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(
    message: string = "Cannot process request",
    details?: Record<string, any>
  ) {
    super(message, 422, "UNPROCESSABLE_ENTITY", details);
  }
}

// =============================================================================
// SERVER ERRORS (5xx)
// =============================================================================

export class InternalServerError extends ApiError {
  constructor(
    message: string = "Internal server error",
    details?: Record<string, any>
  ) {
    super(
      process.env.NODE_ENV === "production" ? "Internal server error" : message,
      500,
      "INTERNAL_SERVER_ERROR",
      process.env.NODE_ENV === "development" ? details : undefined
    );
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(service?: string) {
    super(
      `Service temporarily unavailable${service ? `: ${service}` : ""}`,
      503,
      "SERVICE_UNAVAILABLE",
      service ? { service } : undefined
    );
  }
}

// =============================================================================
// PROFILE-SPECIFIC ERRORS
// =============================================================================

export class AthleteNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super(`Athlete not found${identifier ? `: ${identifier}` : ""}`, "Athlete");
    // Pass code through super constructor
  }
}

export class ProfileIncompleteError extends UnprocessableEntityError {
  constructor(missingFields?: string[]) {
    super("Profile is incomplete. Please complete onboarding.", {
      missingFields,
    });
    // Override code by passing through constructor chain
    Object.defineProperty(this, "code", {
      value: "PROFILE_INCOMPLETE",
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }
}

export class ProfileAlreadyExistsError extends ConflictError {
  constructor() {
    super("Profile already exists. Use update instead.");
    Object.defineProperty(this, "code", {
      value: "PROFILE_EXISTS",
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }
}

export class UsernameNotAvailableError extends ConflictError {
  constructor(username: string) {
    super(`Username "${username}" is already taken`, "username");
    Object.defineProperty(this, "code", {
      value: "USERNAME_TAKEN",
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }
}

export class EmailNotAvailableError extends ConflictError {
  constructor() {
    super("Email address is already registered", "email");
    Object.defineProperty(this, "code", {
      value: "EMAIL_TAKEN",
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }
}

// =============================================================================
// TYPE GUARDS & HELPERS
// =============================================================================

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isOperationalError(error: unknown): boolean {
  return isApiError(error) && error.isOperational();
}

export function shouldLogToMonitoring(error: unknown): boolean {
  return !isOperationalError(error);
}
