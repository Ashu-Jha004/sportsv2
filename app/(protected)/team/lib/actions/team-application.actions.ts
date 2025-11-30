// lib/actions/team-application.actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { teamApplicationSchema, guideSearchSchema } from "../validations/team";
import { calculateDistance } from "../utils/haversine";
import type { TeamApplicationFormData } from "../validations/team";

// Result wrapper for type-safe error handling
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * 1. Check if athlete already owns a team (unique constraint on ownerId)
 */
export async function checkExistingTeamOwnership(): Promise<
  ActionResult<{ hasTeam: boolean; teamId?: string }>
> {
  try {
    const { userId } = await auth();
    if (!userId)
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      include: { teamsOwned: { select: { id: true, status: true } } },
    });

    if (!athlete)
      return { success: false, error: "Athlete not found", code: "NOT_FOUND" };

    const activeTeam = athlete.teamsOwned.find(
      (t) => t.status !== "REVOKED" && t.status !== "EXPIRED"
    );

    return {
      success: true,
      data: {
        hasTeam: !!activeTeam,
        teamId: activeTeam?.id,
      },
    };
  } catch (error) {
    console.error("[CHECK_TEAM_OWNERSHIP_ERROR]", error);
    return { success: false, error: "Failed to check team ownership" };
  }
}

/**
 * 2. Fetch guides filtered by sport + distance (Haversine)
 */
export async function getGuidesForApplication(params: {
  sport: string;
  latitude?: number;
  longitude?: number;
  maxDistanceKm?: number;
}): Promise<
  ActionResult<
    Array<{
      id: string;
      user: {
        firstName: string | null;
        lastName: string | null;
        username: string | null;
        clerkUserId: string;
      };
      PrimarySports: string | null;
      Sports: string[];
      city: string | null;
      state: string | null;
      country: string | null;
      distance?: number;
      userId: string;
    }>
  >
> {
  try {
    const validated = guideSearchSchema.parse(params);

    // Fetch approved guides matching sport
    const guides = await prisma.guide.findMany({
      where: {
        status: "approved",
        OR: [
          { PrimarySports: validated.sport },
          { Sports: { has: validated.sport } },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            clerkUserId: true,
          },
        },
      },
    });

    // Calculate distance if lat/lon provided
    let guidesWithDistance = guides.map((g) => {
      let distance: number | undefined;
      if (validated.latitude && validated.longitude && g.lat && g.lon) {
        distance = calculateDistance(
          validated.latitude,
          validated.longitude,
          g.lat,
          g.lon
        );
      }
      return { ...g, distance };
    });

    // Filter by max distance
    if (validated.maxDistanceKm && validated.latitude && validated.longitude) {
      guidesWithDistance = guidesWithDistance.filter(
        (g) =>
          g.distance !== undefined && g.distance <= validated.maxDistanceKm!
      );
    }

    // Sort by distance (closest first)
    guidesWithDistance.sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });

    return { success: true, data: guidesWithDistance };
  } catch (error) {
    console.error("[GET_GUIDES_ERROR]", error);
    return { success: false, error: "Failed to fetch guides" };
  }
}

/**
 * 3. Submit team application
 */
export async function createTeamApplication(
  data: TeamApplicationFormData
): Promise<ActionResult<{ applicationId: string }>> {
  try {
    const { userId } = await auth();
    if (!userId)
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };

    const validated = teamApplicationSchema.parse(data);

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      include: { teamsOwned: true },
    });
    if (!athlete)
      return {
        success: false,
        error: "Athlete profile not found",
        code: "NOT_FOUND",
      };

    // Check if already owns a team (enforced by schema, but explicit check for better error)
    if (athlete.teamsOwned.length > 0) {
      return {
        success: false,
        error:
          "You already own a team. Leave or delete it before creating another.",
        code: "ALREADY_OWNS_TEAM",
      };
    }

    // Check for pending applications (limit one pending per athlete)
    const pendingApp = await prisma.teamApplication.findFirst({
      where: {
        applicantId: athlete.id,
        status: "PENDING",
      },
    });

    if (pendingApp) {
      return {
        success: false,
        error:
          "You already have a pending team application. Wait for guide review.",
        code: "PENDING_APPLICATION_EXISTS",
      };
    }
    const guideRecord = await prisma.guide.findUnique({
      where: { userId: validated.guideId }, // Assuming validated.guideId is the Guide's User ID
      select: { id: true, userId: true },
    });
    if (!guideRecord) {
      // Essential check: If the guide ID is invalid, prevent the P2003 error
      return {
        success: false,
        error: "The selected Guide does not exist.",
        code: "INVALID_GUIDE_ID",
      };
    }
    const actualGuideId = guideRecord.id;
    // Create application
    const application = await prisma.teamApplication.create({
      data: {
        applicantId: athlete.id,
        guideId: actualGuideId,
        name: validated.name,
        sport: validated.sport,
        class: validated.class,
        rank: validated.rank,
        bio: validated.bio,
        logoUrl: validated.logoUrl,
        country: validated.country,
        state: validated.state,
        city: validated.city,
        latitude: validated.latitude,
        longitude: validated.longitude,
        status: "PENDING",
      },
    });

    // Create notification for guide
    await prisma.notification.create({
      data: {
        athleteId: guideRecord.userId, // ⬅️ Use the Guide's User ID for notification recipient
        actorId: athlete.id,
        type: "APPLICATION_SUBMITTED",
        title: "New Team Application",
        message: `${
          athlete.username || athlete.firstName || "An athlete"
        } submitted a team application for review.`,
      },
    });

    revalidatePath("/team/application");
    return { success: true, data: { applicationId: application.id } };
  } catch (error) {
    console.error("[CREATE_TEAM_APPLICATION_ERROR]", error);
    return { success: false, error: "Failed to submit application" };
  }
}

// lib/actions/team-application.actions.ts (additional functions)

/**
 * Guide: Approve team application and auto-create team
 */
export async function approveTeamApplication(
  applicationId: string
): Promise<ActionResult<{ teamId: string }>> {
  try {
    const { userId } = await auth();
    if (!userId)
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };

    const guide = await prisma.guide.findUnique({
      where: { userId },
    });

    if (!guide) {
      return {
        success: false,
        error: "Guide profile not found",
        code: "NOT_FOUND",
      };
    }

    const application = await prisma.teamApplication.findUnique({
      where: { id: applicationId },
      include: { applicant: true },
    });

    if (!application) {
      return {
        success: false,
        error: "Application not found",
        code: "NOT_FOUND",
      };
    }

    if (application.guideId !== guide.id) {
      return {
        success: false,
        error: "Unauthorized to review this application",
        code: "UNAUTHORIZED",
      };
    }

    if (application.status !== "PENDING") {
      return {
        success: false,
        error: "Application already reviewed",
        code: "ALREADY_REVIEWED",
      };
    }

    // Check if applicant already owns a team
    const existingTeam = await prisma.team.findUnique({
      where: { ownerId: application.applicantId },
    });

    if (existingTeam) {
      return {
        success: false,
        error: "Applicant already owns a team",
        code: "ALREADY_OWNS_TEAM",
      };
    }

    // Transaction: Update application, create team, membership, and counters
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      await tx.teamApplication.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
        },
      });

      // Create team
      const team = await tx.team.create({
        data: {
          name: application.name,
          sport: application.sport,
          class: application.class,
          rank: application.rank,
          bio: application.bio,
          logoUrl: application.logoUrl,
          country: application.country,
          state: application.state,
          city: application.city,
          latitude: application.latitude,
          longitude: application.longitude,
          ownerId: application.applicantId,
          overseerGuideId: guide.id,
          status: "PENDING_MEMBERS", // < 2 members initially
          teamApplicationId: applicationId,
        },
      });

      // Create team membership for owner
      await tx.teamMembership.create({
        data: {
          teamId: team.id,
          athleteId: application.applicantId,
          role: "OWNER",
          isCaptain: true,
        },
      });

      // Initialize team counters
      await tx.teamCounters.create({
        data: {
          teamId: team.id,
          membersCount: 1,
          postsCount: 0,
          matchesPlayed: 0,
        },
      });

      return team;
    });

    // Create notification for applicant
    await prisma.notification.create({
      data: {
        athleteId: application.applicantId,
        actorId: guide.userId,
        type: "APPLICATION_APPROVED",
        title: "Team Application Approved! 🎉",
        message: `Your team "${application.name}" has been approved. Start inviting members!`,
        data: { teamId: result.id, applicationId },
      },
    });

    console.log("[TEAM_CREATED]", result.id);
    revalidatePath("/team/[teamId]", "page");
    return { success: true, data: { teamId: result.id } };
  } catch (error) {
    console.error("[APPROVE_APPLICATION_ERROR]", error);
    return { success: false, error: "Failed to approve application" };
  }
}

/**
 * Guide: Reject team application
 */
export async function rejectTeamApplication(
  applicationId: string,
  reviewNote: string
): Promise<ActionResult<{ applicationId: string }>> {
  try {
    const { userId } = await auth();
    if (!userId)
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };

    const guide = await prisma.guide.findUnique({
      where: { userId },
    });

    if (!guide) {
      return {
        success: false,
        error: "Guide profile not found",
        code: "NOT_FOUND",
      };
    }

    const application = await prisma.teamApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return {
        success: false,
        error: "Application not found",
        code: "NOT_FOUND",
      };
    }

    if (application.guideId !== guide.id) {
      return {
        success: false,
        error: "Unauthorized to review this application",
        code: "UNAUTHORIZED",
      };
    }

    if (application.status !== "PENDING") {
      return {
        success: false,
        error: "Application already reviewed",
        code: "ALREADY_REVIEWED",
      };
    }

    await prisma.teamApplication.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        reviewNote,
        reviewedAt: new Date(),
      },
    });

    // Notify applicant
    await prisma.notification.create({
      data: {
        athleteId: application.applicantId,
        actorId: guide.userId,
        type: "APPLICATION_REJECTED",
        title: "Team Application Rejected",
        message: reviewNote || "Your team application was not approved.",
        data: { applicationId },
      },
    });

    revalidatePath("/team/application");
    return { success: true, data: { applicationId } };
  } catch (error) {
    console.error("[REJECT_APPLICATION_ERROR]", error);
    return { success: false, error: "Failed to reject application" };
  }
}
