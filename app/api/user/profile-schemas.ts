// lib/api/schemas/profile-schemas.ts

/**
 * =============================================================================
 * PROFILE VALIDATION SCHEMAS
 * =============================================================================
 * Zod schemas for Athlete profile validation
 * Aligned with Prisma Athlete model
 */

import { z } from "zod";
import { Gender, Sport } from "@prisma/client";
import prisma from "@/lib/prisma";

// =============================================================================
// ENUM SCHEMAS
// =============================================================================

/**
 * Gender enum schema
 */
export const GenderSchema = z.nativeEnum(Gender, {
  error: "Invalid gender selection",
});
/**
 * Sport enum schema
 */
export const SportSchema = z.nativeEnum(Sport, {
  error: "Invalid sport selection and sport required",
});
// =============================================================================
// REUSABLE FIELD SCHEMAS
// =============================================================================

/**
 * Username validation with uniqueness check
 */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, hyphens, and underscores"
  )
  .refine(
    (val) => !val.startsWith("-") && !val.startsWith("_"),
    "Username cannot start with special characters"
  )
  .refine(
    (val) => !val.endsWith("-") && !val.endsWith("_"),
    "Username cannot end with special characters"
  );

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .toLowerCase()
  .trim();

/**
 * Name validation (first/last name)
 */
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must be less than 50 characters")
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .trim();

/**
 * Bio validation
 */
export const bioSchema = z
  .string()
  .min(10, "Bio must be at least 10 characters")
  .max(500, "Bio must be less than 500 characters")
  .trim();

/**
 * Date of birth validation
 */
export const dateOfBirthSchema = z
  .string()
  .refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }, "Invalid date format")
  .refine((dateStr) => {
    const birthDate = new Date(dateStr);
    const today = new Date();

    // Check not in future
    if (birthDate > today) {
      return false;
    }

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Must be between 13 and 100 years old
    return age >= 13 && age <= 100;
  }, "You must be between 13 and 100 years old");

/**
 * Coordinates validation
 */
export const latitudeSchema = z
  .number()
  .min(-90, "Invalid latitude")
  .max(90, "Invalid latitude");

export const longitudeSchema = z
  .number()
  .min(-180, "Invalid longitude")
  .max(180, "Invalid longitude");

/**
 * Profile image URL validation
 */
export const profileImageSchema = z
  .string()
  .url("Invalid image URL")
  .optional()
  .or(z.literal(""));

// =============================================================================
// PROFILE CREATE SCHEMA
// =============================================================================

/**
 * Complete profile creation schema (for onboarding)
 * All required fields for creating a new Athlete record
 */
export const profileCreateSchema = z.object({
  // Identity (required)
  username: usernameSchema,
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,

  // Personal details (required)
  dateOfBirth: dateOfBirthSchema,
  gender: GenderSchema,
  bio: bioSchema,

  // Profile image (optional)
  profileImage: profileImageSchema,

  // Sports (required)
  primarySport: SportSchema,
  secondarySport: SportSchema.optional(),

  // Location (required)
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

/**
 * Type inference for profile creation
 */
export type ProfileCreateInput = z.infer<typeof profileCreateSchema>;

// =============================================================================
// PROFILE UPDATE SCHEMA
// =============================================================================

/**
 * Profile update schema (all fields optional)
 * Used for PATCH endpoints
 */
export const profileUpdateSchema = z.object({
  // Identity (optional updates)
  username: usernameSchema.optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),

  // Personal details (optional updates)
  dateOfBirth: dateOfBirthSchema.optional(),
  gender: GenderSchema.optional(),
  bio: bioSchema.optional(),

  // Profile image (optional update)
  profileImage: profileImageSchema,

  // Sports (optional updates)
  primarySport: SportSchema.optional(),
  secondarySport: SportSchema.optional(),

  // Location (optional updates)
  country: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
});

/**
 * Type inference for profile update
 */
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// =============================================================================
// USERNAME AVAILABILITY CHECK SCHEMA
// =============================================================================

/**
 * Schema for checking username availability
 */
export const usernameCheckSchema = z.object({
  username: usernameSchema,
});

/**
 * Username availability with async database check
 */
export const usernameAvailabilitySchema = z.object({
  username: usernameSchema.refine(async (username) => {
    const existing = await prisma.athlete.findUnique({
      where: { username },
      select: { id: true },
    });
    return !existing;
  }, "Username is already taken"),
});

// =============================================================================
// EMAIL CHECK SCHEMA
// =============================================================================

/**
 * Schema for email validation
 */
export const emailCheckSchema = z.object({
  email: emailSchema,
});

/**
 * Email availability with async database check
 */
export const emailAvailabilitySchema = z.object({
  email: emailSchema.refine(async (email) => {
    const existing = await prisma.athlete.findUnique({
      where: { email },
      select: { id: true },
    });
    return !existing;
  }, "Email is already registered"),
});

// =============================================================================
// PROFILE SEARCH SCHEMA
// =============================================================================

/**
 * Schema for profile search parameters
 */
export const profileSearchSchema = z.object({
  // Search query
  q: z.string().min(1, "Search query is required").max(100).optional(),

  // Filters
  sport: SportSchema.optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),

  // Sorting
  sortBy: z.enum(["createdAt", "username", "rank"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Type inference for search parameters
 */
export type ProfileSearchParams = z.infer<typeof profileSearchSchema>;

// =============================================================================
// LOCATION UPDATE SCHEMA
// =============================================================================

/**
 * Schema for updating only location
 */
export const locationUpdateSchema = z.object({
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

// =============================================================================
// PROFILE IMAGE UPDATE SCHEMA
// =============================================================================

/**
 * Schema for updating only profile image
 */
export const profileImageUpdateSchema = z.object({
  profileImage: z.string().url("Invalid image URL"),
});

// =============================================================================
// BIO UPDATE SCHEMA
// =============================================================================

/**
 * Schema for updating only bio
 */
export const bioUpdateSchema = z.object({
  bio: bioSchema,
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate and transform username (lowercase, trim)
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

/**
 * Validate and transform email (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Check if date string is valid
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Calculate age from date string
 */
export function calculateAgeFromString(dateStr: string): number {
  const birthDate = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// =============================================================================
// SCHEMA PRESETS (for different use cases)
// =============================================================================

/**
 * Minimal profile schema (for quick registration)
 */
export const minimalProfileSchema = profileCreateSchema.pick({
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  primarySport: true,
  country: true,
  state: true,
  city: true,
  latitude: true,
  longitude: true,
});

/**
 * Public profile fields that can be updated
 */
export const publicProfileUpdateSchema = profileUpdateSchema;
