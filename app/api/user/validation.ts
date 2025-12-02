// lib/api/middleware/validation.ts

/**
 * =============================================================================
 * VALIDATION MIDDLEWARE (COMPLETE FIXED VERSION)
 * =============================================================================
 * Zod-based request validation for API routes
 * Supports async refinements, transformations, and partial updates
 * Next.js 15+ compatible | Production-ready
 */

import { z, ZodError, ZodSchema, ZodObject, ZodRawShape } from "zod";
import { ValidationError } from "./api-error";
import { NextRequest } from "next/server";

// =============================================================================
// VALIDATION OPTIONS
// =============================================================================

interface ValidationOptions {
  stripUnknown?: boolean; // Remove fields not in schema
  abortEarly?: boolean; // Stop on first error
}

// =============================================================================
// CORE VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate data against Zod schema (supports async refinements)
 *
 * @throws {ValidationError} If validation fails
 */
export async function validateData<T>(
  data: unknown,
  schema: ZodSchema<T>,
  options: ValidationOptions = {}
): Promise<T> {
  try {
    // Use parseAsync to support async refinements (e.g., database checks)
    const result = await schema.safeParseAsync(data);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      // Format errors for better client experience
      const formattedErrors: Record<string, string[]> = {};

      for (const [field, errors] of Object.entries(fieldErrors)) {
        if (Array.isArray(errors) && errors.length > 0) {
          formattedErrors[field] = errors;
        }
      }

      console.error("❌ Validation failed:", formattedErrors);

      throw new ValidationError("Validation failed. Please check your input.", {
        fields: formattedErrors,
        issues: result.error.issues,
      });
    }

    console.log("✅ Validation successful");
    return result.data;
  } catch (error) {
    // Re-throw ValidationError as-is
    if (error instanceof ValidationError) {
      throw error;
    }

    // Wrap Zod errors
    if (error instanceof ZodError) {
      throw new ValidationError(
        "Invalid data format",
        error.flatten().fieldErrors
      );
    }

    // Unknown errors
    console.error("❌ Unexpected validation error:", error);
    throw new ValidationError("An error occurred during validation", {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}

// =============================================================================
// REQUEST BODY VALIDATION
// =============================================================================

/**
 * Validate request body with automatic JSON parsing
 *
 * @throws {ValidationError} If validation fails or invalid JSON
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
  options?: ValidationOptions
): Promise<T> {
  try {
    // Check content type
    const contentType = req.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      throw new ValidationError("Content-Type must be application/json", {
        received: contentType,
        expected: "application/json",
      });
    }

    // Parse JSON
    const body = await req.json();

    // Validate against schema
    return await validateData(body, schema, options);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError("Invalid JSON format in request body");
    }
    throw error;
  }
}

// =============================================================================
// URL PARAMETERS VALIDATION
// =============================================================================

/**
 * Validate URL search parameters
 * Automatically coerces string values to correct types
 */
export async function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): Promise<T> {
  // Convert URLSearchParams to plain object
  const params: Record<string, string | string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    // Handle multiple values with same key
    const existing = params[key];
    if (existing) {
      params[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      params[key] = value;
    }
  }

  return await validateData(params, schema, { stripUnknown: true });
}

/**
 * Validate route parameters (from dynamic segments)
 */
export async function validateRouteParams<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): Promise<T> {
  return await validateData(params, schema);
}

// =============================================================================
// PARTIAL VALIDATION (for PATCH/UPDATE) - FIXED
// =============================================================================

/**
 * Validate partial update where all fields are optional
 * Use this for PATCH endpoints that accept partial updates
 *
 * @param data - The request body data to validate
 * @param schema - A Zod object schema (z.object({...}))
 * @returns Validated partial data with proper typing
 *
 * @example
 * ```
 * const profileSchema = z.object({
 *   username: z.string(),
 *   email: z.string().email(),
 *   bio: z.string()
 * });
 *
 * const updates = await validatePartialUpdate(body, profileSchema);
 * // updates type: Partial<{ username: string; email: string; bio: string }>
 * ```
 */
export async function validatePartialUpdate<T extends ZodRawShape>(
  data: unknown,
  schema: ZodObject<T>
): Promise<Partial<z.infer<ZodObject<T>>>> {
  try {
    // Create partial version of schema (all fields optional)
    const partialSchema = schema.partial();

    // Validate with the partial schema
    const result = await partialSchema.safeParseAsync(data);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const formattedErrors: Record<string, string[]> = {};

      for (const [field, errors] of Object.entries(fieldErrors)) {
        if (Array.isArray(errors) && errors.length > 0) {
          formattedErrors[field] = errors;
        }
      }

      console.error("❌ Partial validation failed:", formattedErrors);

      throw new ValidationError("Validation failed. Please check your input.", {
        fields: formattedErrors,
        issues: result.error.issues,
      });
    }

    console.log("✅ Partial validation successful");
    // Type assertion is safe here because we've validated the shape
    return result.data as Partial<z.infer<ZodObject<T>>>;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    if (error instanceof ZodError) {
      throw new ValidationError(
        "Invalid data format",
        error.flatten().fieldErrors
      );
    }

    throw new ValidationError("An error occurred during validation", {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}

// =============================================================================
// MULTIPLE SCHEMA VALIDATION
// =============================================================================

interface SchemaValidation {
  data: unknown;
  schema: ZodSchema<any>;
  name: string;
}

/**
 * Validate multiple schemas in parallel
 * Returns all errors instead of stopping at first failure
 *
 * @throws {ValidationError} If any validation fails (includes all errors)
 */
export async function validateMultipleSchemas<T extends Record<string, any>>(
  validations: SchemaValidation[]
): Promise<T> {
  // Validate all schemas in parallel
  const results = await Promise.allSettled(
    validations.map(async ({ data, schema, name }) => ({
      name,
      result: await schema.safeParseAsync(data),
    }))
  );

  const allErrors: Record<string, any> = {};
  const validatedData = {} as T;
  let hasErrors = false;

  // Collect results and errors
  for (const result of results) {
    if (result.status === "fulfilled") {
      const { name, result: parseResult } = result.value;

      if (parseResult.success) {
        validatedData[name as keyof T] = parseResult.data;
      } else {
        hasErrors = true;
        allErrors[name] = parseResult.error.flatten().fieldErrors;
      }
    } else {
      hasErrors = true;
      allErrors["unknown"] = result.reason;
    }
  }

  // If any validation failed, throw with all errors
  if (hasErrors) {
    console.error("❌ Multiple schema validation failed:", allErrors);
    throw new ValidationError("Multiple validation errors occurred", allErrors);
  }

  console.log("✅ All schema validations successful");
  return validatedData;
}

// =============================================================================
// TRANSFORMATION HELPERS
// =============================================================================

/**
 * Validate and transform data in one step
 */
export async function validateAndTransform<T, R>(
  data: unknown,
  schema: ZodSchema<T>,
  transform: (validated: T) => R | Promise<R>
): Promise<R> {
  const validated = await validateData(data, schema);
  return await transform(validated);
}

// =============================================================================
// COMMON VALIDATION SCHEMAS (reusable)
// =============================================================================

export const commonSchemas = {
  /**
   * Pagination parameters
   */
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),

  /**
   * CUID or UUID identifier
   */
  id: z.object({
    id: z.string(),
  }),

  /**
   * Username parameter
   */
  username: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, hyphens, and underscores"
      ),
  }),

  /**
   * Search query with optional filters
   */
  search: z.object({
    q: z.string().min(1, "Search query is required").max(100),
    filter: z.string().optional(),
  }),

  /**
   * Sort parameters
   */
  sort: z.object({
    sortBy: z.string().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),

  /**
   * Date range filter
   */
  dateRange: z
    .object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
    .refine(
      (data) => data.startDate <= data.endDate,
      "Start date must be before or equal to end date"
    ),
};

// =============================================================================
// SANITIZATION (XSS prevention)
// =============================================================================

/**
 * Sanitize string to prevent XSS attacks
 */
function sanitizeString(str: string): string {
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Recursively sanitize all strings in an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validate and sanitize user input (for user-generated content)
 */
export async function validateAndSanitize<T>(
  data: unknown,
  schema: ZodSchema<T>
): Promise<T> {
  const validated = await validateData(data, schema);
  return sanitizeObject(validated) as T;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Extract user-friendly error messages from validation error
 */
export function formatValidationErrors(error: ValidationError): string[] {
  const messages: string[] = [];

  if (error.details?.fields) {
    for (const [field, errors] of Object.entries(error.details.fields)) {
      if (Array.isArray(errors)) {
        messages.push(`${field}: ${errors.join(", ")}`);
      }
    }
  }

  return messages.length > 0 ? messages : [error.message];
}
