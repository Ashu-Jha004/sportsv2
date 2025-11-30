// lib/validations/team.ts
import { z } from "zod";
import { Sport, Class, Rank } from "@prisma/client";

// Step 1: Basic info
export const teamApplicationStep1Schema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters").max(50),
  sport: z.nativeEnum(Sport, { error: "Sport is required" }),
  class: z.nativeEnum(Class).optional(),
  rank: z.nativeEnum(Rank).optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),
});

// Step 2: Location (snapshot from athlete or manual entry)
export const teamApplicationStep2Schema = z.object({
  country: z.string().min(2, "Country is required"),
  state: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Step 3: Guide selection
export const teamApplicationStep3Schema = z.object({
  guideId: z.string(),
});

// Combined full schema
export const teamApplicationSchema = teamApplicationStep1Schema
  .merge(teamApplicationStep2Schema)
  .merge(teamApplicationStep3Schema);

export type TeamApplicationFormData = z.infer<typeof teamApplicationSchema>;

// For guide search/filter
export const guideSearchSchema = z.object({
  sport: z.nativeEnum(Sport),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxDistanceKm: z.number().default(100), // default 100km radius
});

// Invite athlete search
export const athleteSearchSchema = z.object({
  query: z.string().min(2, "Search term must be at least 2 characters"),
  sport: z.nativeEnum(Sport).optional(), // filter by sport if needed
  limit: z.number().default(10),
});

// Send invite
export const sendTeamInviteSchema = z.object({
  teamId: z.string().cuid(),
  invitedAthleteId: z.string().cuid(),
  message: z.string().max(300).optional(),
});

// Respond to invite
export const respondToInviteSchema = z.object({
  invitationId: z.string().cuid(),
  action: z.enum(["ACCEPT", "REJECT"]),
});
