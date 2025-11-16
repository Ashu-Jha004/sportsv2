// src/server/onboarding/onboarding.dto.ts
import { z } from "zod";

// Step 1: profile
export const OnboardingProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(32, "Username must be at most 32 characters.")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can contain letters, numbers, ., _ and - only."
    ),
  email: z.string().email("Please provide a valid email address."),
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(64, "First name is too long."),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .max(64, "Last name is too long."),
  profileImage: z.string().url().optional().nullable(),
  dateOfBirth: z.string(), // ISO string from frontend, will be converted to Date on backend
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]),
  bio: z
    .string()
    .max(1024, "Bio must be at most 1024 characters.")
    .optional()
    .nullable(),
});

// Step 2: sports
export const OnboardingSportsSchema = z.object({
  primarySport: z.enum([
    "FOOTBALL",
    "BASKETBALL",
    "CRICKET",
    "TENNIS",
    "RUNNING",
    "SWIMMING",
    "OTHER",
  ]),
  secondarySport: z
    .enum([
      "FOOTBALL",
      "BASKETBALL",
      "CRICKET",
      "TENNIS",
      "RUNNING",
      "SWIMMING",
      "OTHER",
    ])
    .optional()
    .nullable(),
});

// Step 3: location
export const OnboardingLocationSchema = z.object({
  country: z.string().min(1, "Country is required."),
  state: z.string().min(1, "State is required."),
  city: z.string().min(1, "City is required."),
  latitude: z.number(), // from browser geolocation
  longitude: z.number(),
});

// Combined payload for final submit
export const OnboardingRequestSchema = z.object({
  profile: OnboardingProfileSchema,
  sports: OnboardingSportsSchema,
  location: OnboardingLocationSchema,
});

export type OnboardingProfileDTO = z.infer<typeof OnboardingProfileSchema>;
export type OnboardingSportsDTO = z.infer<typeof OnboardingSportsSchema>;
export type OnboardingLocationDTO = z.infer<typeof OnboardingLocationSchema>;
export type OnboardingRequestDTO = z.infer<typeof OnboardingRequestSchema>;
