"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { TeamApplicationStatus } from "@prisma/client"; // adjust path to your schema types
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@prisma/client"; // adjust path
import { use } from "react";

export async function getGuideTeamApplications() {
  try {
    const session = await auth();
    const { userId }: any = await auth();
    if (!session?.userId) {
      throw new Error("Unauthorized");
    }

    // Get current guide from session.user.id (Athlete.id)
    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, Guide: { select: { id: true } } },
    });

    if (!currentAthlete?.Guide) {
      throw new Error(
        "Guide not found. You must be an approved guide to view applications."
      );
    }

    const currentGuideId = currentAthlete.Guide.id;

    const applications = await prisma.teamApplication.findMany({
      where: {
        guideId: currentGuideId,
        status: TeamApplicationStatus.PENDING,
      },
      select: {
        id: true,
        name: true,
        sport: true,
        class: true,
        rank: true,
        logoUrl: true,
        status: true,
        createdAt: true,
        applicant: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            primarySport: true,
            rank: true,
            class: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      applications,
      count: applications.length,
    };
  } catch (error) {
    console.error("[getGuideTeamApplications]", error);
    throw new Error("Failed to fetch team applications");
  }
}
// ... existing getGuideTeamApplications above ...

export async function updateTeamApplicationStatus({
  applicationId,
  status,
  reviewNote,
}: {
  applicationId: string;
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}) {
  const { userId }: any = await auth();
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, Guide: { select: { id: true } } },
    });

    if (!currentAthlete?.Guide) {
      throw new Error("Guide not found. You must be an approved guide.");
    }

    const currentGuideId = currentAthlete.Guide.id;

    // Fetch and validate the application
    const application = await prisma.teamApplication.findFirst({
      where: {
        id: applicationId,
        guideId: currentGuideId,
        status: "PENDING",
      },
      include: {
        applicant: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error("Application not found or not authorized.");
    }

    // Check if applicant already has a team (enforce one team per athlete)
    const applicantHasTeam = await prisma.teamMembership.findUnique({
      where: { athleteId: application.applicantId },
    });

    if (applicantHasTeam && status === "APPROVED") {
      throw new Error("Applicant already belongs to a team.");
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewNote: reviewNote || null,
    };

    let result: any = { applicationId, status };

    if (status === "APPROVED") {
      // Create the Team
      const team = await prisma.team.create({
        data: {
          name: application.name,
          bio: application.bio,
          logoUrl: application.logoUrl,
          sport: application.sport,
          class: application.class,
          rank: application.rank,
          country: application.country,
          state: application.state,
          city: application.city,
          latitude: application.latitude,
          longitude: application.longitude,
          ownerId: application.applicantId,
          overseerGuideId: currentGuideId,
          status: "PENDING_MEMBERS", // Needs 2+ members to be ACTIVE
          teamApplicationId: application.id,
        },
      });

      // Create TeamMembership for owner
      await prisma.teamMembership.create({
        data: {
          teamId: team.id,
          athleteId: application.applicantId,
          role: "OWNER",
          isCaptain: true,
        },
      });

      // Initialize TeamCounters
      await prisma.teamCounters.create({
        data: {
          teamId: team.id,
          membersCount: 1,
        },
      });

      // Link back to TeamApplication
      await prisma.teamApplication.update({
        where: { id: applicationId },
        data: { team: { connect: { id: team.id } } },
      });

      result.teamId = team.id;
    }

    // Always update application status and create notification
    await prisma.$transaction(async (tx) => {
      // Update application
      await tx.teamApplication.update({
        where: { id: applicationId },
        data: updateData,
      });

      // Create notification for applicant
      await tx.notification.create({
        data: {
          athleteId: application.applicantId,
          type:
            status === "APPROVED"
              ? "APPLICATION_APPROVED"
              : "APPLICATION_REJECTED",
          title:
            status === "APPROVED"
              ? "Team Application Approved!"
              : "Team Application Rejected",
          message:
            status === "APPROVED"
              ? `Your team "${application.name}" has been approved by the guide!`
              : `Your team application "${
                  application.name
                }" was rejected. Review note: ${
                  reviewNote || "No reason provided"
                }`,
          data: {
            applicationId,
            teamId: result.teamId || null,
            ...(status === "APPROVED" && { teamName: application.name }),
          },
        },
      });
    });

    // Revalidate relevant paths
    revalidatePath("/business/features/guide/dashboard");
    revalidatePath("/profile/[username]");

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error("[updateTeamApplicationStatus]", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update application"
    );
  }
}
