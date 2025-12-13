// app/profile/schemas/edit-profile-schema.ts

/**
 * =============================================================================
 * EDIT PROFILE VALIDATION SCHEMA
 * =============================================================================
 * Zod schema for profile editing form
 * Supports partial updates (all fields optional except required ones)
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const Sport = {
  CRICKET: "CRICKET",
  FOOTBALL: "FOOTBALL",
  BASKETBALL: "BASKETBALL",
  TENNIS: "TENNIS",
  BADMINTON: "BADMINTON",
  VOLLEYBALL: "VOLLEYBALL",
  HOCKEY: "HOCKEY",
  SWIMMING: "SWIMMING",
  ATHLETICS: "ATHLETICS",
  BOXING: "BOXING",
  WRESTLING: "WRESTLING",
  KABADDI: "KABADDI",
  TABLE_TENNIS: "TABLE_TENNIS",
  CHESS: "CHESS",
  ARCHERY: "ARCHERY",
  SHOOTING: "SHOOTING",
  CYCLING: "CYCLING",
  WEIGHTLIFTING: "WEIGHTLIFTING",
  GYMNASTICS: "GYMNASTICS",
  OTHER: "OTHER",
} as const;

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

export const editProfileSchema = z.object({
  // Identity
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    )
    .optional(),

  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .optional(),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .optional(),

  bio: z
    .string()
    .max(160, "Bio must be less than 160 characters")
    .optional()
    .or(z.literal("")),

  profileImage: z.string().url("Invalid image URL").optional().or(z.literal("")),

  // Personal
  dateOfBirth: z.string().optional(), // ISO date string
  gender: z.nativeEnum(Gender).optional(),

  // Sports
  primarySport: z.nativeEnum(Sport).optional(),
  secondarySport: z.nativeEnum(Sport).optional().or(z.literal("")),

  // Location
  country: z.string().min(2, "Country is required").optional(),
  state: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

// ============================================================================
// HELPER: Convert profile data to form defaults
// ============================================================================

export function profileToFormDefaults(profile: any): Partial<EditProfileFormData> {
  return {
    username: profile.username || "",
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    bio: profile.bio || "",
    profileImage: profile.profileImage || "",
    dateOfBirth: profile.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: profile.gender || undefined,
    primarySport: profile.primarySport || undefined,
    secondarySport: profile.secondarySport || "",
    country: profile.country || "",
    state: profile.state || "",
    city: profile.city || "",
    latitude: profile.latitude || undefined,
    longitude: profile.longitude || undefined,
  };
}
