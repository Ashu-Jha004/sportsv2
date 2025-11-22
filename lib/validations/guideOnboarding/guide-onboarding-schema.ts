// lib/validation/guide-onboarding-schema.ts

import { z } from "zod";

// Keep in sync with your Prisma Sport enum
export const SPORT_VALUES = [
  "FOOTBALL",
  "BASKETBALL",
  "CRICKET",
  "TENNIS",
  "RUNNING",
  "SWIMMING",
  "BADMINTON",
  "VOLLEYBALL",
  "HOCKEY",
  "ATHLETICS",
  "WRESTLING",
  "BOXING",
  "MARTIAL_ARTS",
  "CYCLING",
  "GOLF",
  "OTHER",
] as const;

export type SportValue = (typeof SPORT_VALUES)[number];

// Cloudinary resume/document payload returned from your upload widget
export const uploadedDocumentSchema = z.object({
  url: z.string().url("Resume URL from Cloudinary is required."),
  publicId: z.string().min(1, "Cloudinary public ID is required."),
  format: z
    .string()
    .min(1, "File format is required.")
    .refine((f) => f.toLowerCase() === "pdf", {
      message: "Only PDF resumes are allowed.",
    }),
  bytes: z.number().int().positive().optional(),
});

export const guideOnboardingSchema = z.object({
  // Step 1: identity + contact
  guideEmail: z.string().trim().email("Please enter a valid email address."), // Step 2: resume upload (Cloudinary)

  documents: z
    .array(uploadedDocumentSchema)
    .min(1, "Please upload your resume as a PDF."), // Step 3: sports expertise

  primarySport: z.enum(SPORT_VALUES, {
    message: "Please select a primary sport.", // FIXED: Changed errorMap to message
  }),
  secondarySports: z
    .array(z.enum(SPORT_VALUES))
    .max(5, "You can select up to 5 secondary sports.")
    .optional()
    .default([]), // Step 4: experience

  experienceYears: z.coerce
    .number({
      error: "Experience must be a number.",
    })
    .int("Experience must be a whole number of years.")
    .min(0, "Experience cannot be negative.")
    .max(60, "Please enter a realistic experience value (0–60 years).")
    .nullable()
    .optional(), // Step 5: location (auto from browser, but still validated)

  country: z.string().trim().min(1, "Country is required."),
  state: z.string().trim().min(1, "State/Province is required."),
  city: z.string().trim().min(1, "City is required."),
  latitude: z
    .number({
      error: "Latitude must be a number.",
    })
    .min(-90, "Latitude must be between -90 and 90.")
    .max(90, "Latitude must be between -90 and 90."),
  longitude: z
    .number({
      error: "Longitude must be a number.",
    })
    .min(-180, "Longitude must be between -180 and 180.")
    .max(180, "Longitude must be between -180 and 180."), // Optional: confirmation / terms

  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms to continue.",
  }),
});
export type UploadedDocument = z.infer<typeof uploadedDocumentSchema>;
export type GuideOnboardingInput = z.infer<typeof guideOnboardingSchema>;
