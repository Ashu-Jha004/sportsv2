import { z } from "zod";
import { Sport } from "@prisma/client";

// ============================================
// RECEIVED CHALLENGES VALIDATION
// ============================================

export const ReceivedChallengeFiltersSchema = z.object({
  status: z.enum(["PENDING", "NEGOTIATING", "ALL"]).optional(),
  sport: z.nativeEnum(Sport).or(z.literal("ALL")).optional(),
  teamName: z.string().max(100).optional(),
});

export const ChallengeActionSchema = z.object({
  matchId: z.string().cuid("Invalid match ID"),
  action: z.enum(["ACCEPT", "REJECT", "COUNTER", "DELETE"]),
  // Rejection
  rejectionReason: z.string().max(500).optional(),
  // Counter-proposal
  proposedDate: z.date().nullable().optional(),
  proposedTime: z.string().optional(),
  proposedLocation: z.string().min(1).max(500).optional(),
  proposedLatitude: z.number().min(-90).max(90).nullable().optional(),
  proposedLongitude: z.number().min(-180).max(180).nullable().optional(),
  matchDurationMinutes: z
    .number()
    .min(30, "Match must be at least 30 minutes")
    .max(300, "Match cannot exceed 5 hours")
    .nullable()
    .optional(),
  counterMessage: z.string().max(500).optional(),
});

