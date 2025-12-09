import { z } from "zod";
import { Logger } from "@/lib/logger/logger";
import { Sport } from "@prisma/client";

export class ValidationError extends Error {
  constructor(public field: string, public issue: string) {
    super(`Validation failed for ${field}: ${issue}`);
    this.name = "ValidationError";
  }
}

export function validateWithLogging<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
  userId?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      Logger.error(
        "VALIDATION",
        context,
        "Validation failed",
        error,
        userId,
        undefined,
        { data, errors: error.issues }
      );

      const firstError = error.issues[0];
      throw new ValidationError(firstError.path.join("."), firstError.message);
    }
    throw error;
  }
}

// ============================================
// CHALLENGE VALIDATION SCHEMAS
// ============================================

export const ChallengeFiltersSchema = z.object({
  schoolName: z.string().max(100).optional(),
  teamName: z.string().max(100).optional(),
  sport: z.nativeEnum(Sport).or(z.literal("ALL")).optional(),
});

export const CreateChallengeSchema = z.object({
  challengerTeamId: z.string().cuid("Invalid challenger team ID"),
  challengedTeamId: z.string().cuid("Invalid challenged team ID"),
  proposedStart: z.date().nullable(),
  proposedEnd: z.date().nullable(),
  proposedLocation: z
    .string()
    .min(1, "Location is required")
    .max(500, "Location is too long"),
  proposedLatitude: z.number().min(-90).max(90).nullable(),
  proposedLongitude: z.number().min(-180).max(180).nullable(),
  matchLengthMinutes: z
    .number()
    .min(30, "Match must be at least 30 minutes")
    .max(300, "Match cannot exceed 5 hours")
    .nullable(),
  messageToOpponent: z.string().max(500, "Message is too long"),
  participants: z.array(
    z.object({
      athleteId: z.string().cuid("Invalid athlete ID"),
      isStarter: z.boolean(),
    })
  ),
});

// ============================================
// COMMON SCHEMAS (for reuse)
// ============================================

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export const TeamIdSchema = z.string().cuid("Invalid team ID");

export const AthleteIdSchema = z.string().cuid("Invalid athlete ID");
