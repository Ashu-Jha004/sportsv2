import { z } from "zod";

// Sport enum validation (must match your Prisma enum)
export const SportEnum = z.enum([
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
]);

export const associateApplicationSchema = z.object({
  workEmail: z
    .string()
    .min(1, "Work email is required")
    .email("Invalid email address")
    .refine((email) => email.toLowerCase().trim(), {
      message: "Email must be valid",
    }),

  coverLetter: z
    .string()
    .min(100, "Cover letter must be at least 100 characters")
    .max(2000, "Cover letter must not exceed 2000 characters"),

  primaryExpertise: SportEnum.refine((val) => val !== undefined, {
    message: "Primary sport expertise is required",
  }),

  secondaryExpertise: z
    .array(SportEnum)
    .min(0, "Select at least one secondary sport")
    .max(5, "Maximum 5 secondary sports allowed")
    .refine(
      (sports) => {
        // Check for duplicates
        return new Set(sports).size === sports.length;
      },
      {
        message: "Duplicate sports are not allowed",
      }
    ),

  yearsOfExperience: z
    .number({
      error:
        "Years of experience is required or you must have enterd wrong expirence number",
    })
    .int("Must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(50, "Experience seems too high, please verify"),

  workCountry: z
    .string()
    .min(2, "Country is required")
    .max(100, "Country name too long"),

  workState: z
    .string()
    .min(2, "State is required")
    .max(100, "State name too long"),

  workCity: z
    .string()
    .min(2, "City is required")
    .max(100, "City name too long"),

  workLatitude: z
    .number({
      error: "Invalid latitude",
    })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),

  workLongitude: z
    .number({
      error: "Invalid longitude",
    })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .nonoptional({ error: "you have to enter, this is not otional" }),

  resumeUrl: z
    .string()
    .url("Invalid resume URL")
    .min(1, "Resume is required")
    .refine((url) => url.includes("cloudinary.com"), {
      message: "Resume must be uploaded to our server",
    }),

  resumePublicId: z.string().min(1, "Resume public ID is required"),
});

export type AssociateApplicationFormData = z.infer<
  typeof associateApplicationSchema
>;

// Partial schema for step-by-step validation
export const workEmailSchema = associateApplicationSchema.pick({
  workEmail: true,
});

export const coverLetterSchema = associateApplicationSchema.pick({
  coverLetter: true,
});

export const sportsExpertiseSchema = associateApplicationSchema.pick({
  primaryExpertise: true,
  secondaryExpertise: true,
});

export const experienceSchema = associateApplicationSchema.pick({
  yearsOfExperience: true,
});

export const locationSchema = associateApplicationSchema.pick({
  workCountry: true,
  workState: true,
  workCity: true,
  workLatitude: true,
  workLongitude: true,
});

export const resumeSchema = associateApplicationSchema.pick({
  resumeUrl: true,
  resumePublicId: true,
});
