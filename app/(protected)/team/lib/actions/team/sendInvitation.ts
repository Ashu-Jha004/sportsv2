// actions/team/sendInvitation.ts - NO getCurrentAthleteId DEPENDENCY
"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { auth, currentUser } from "@clerk/nextjs/server";

const sendInvitationSchema = z.object({
  teamId: z.string(),
  athleteId: z.string(), // Target athlete to invite
});

export async function sendTeamInvitation({
  teamId,
  athleteId,
}: z.infer<typeof sendInvitationSchema>) {
  const validated = sendInvitationSchema.parse({ teamId, athleteId });

  try {
    // ✅ FIXED #1: Direct Clerk auth - NO external function needed
    const { userId } = await auth();
    if (!userId) throw new Error("Must be logged in");

    // ✅ FIXED #2: Lookup current athlete by clerkUserId
    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!currentAthlete) {
      throw new Error("Athlete profile not found");
    }

    const currentAthleteId = currentAthlete.id;

    console.log("🔐 Auth:", {
      clerkUserId: userId,
      currentAthleteId,
      targetAthleteId: athleteId,
      teamId,
    });

    // ✅ FIXED #3: Full team data with proper member lookup
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        sport: true,
        teamApplicationId: true,
        members: {
          select: {
            athleteId: true,
            role: true,
          },
        },
      },
    });

    if (!team) throw new Error("Team not found");

    console.log("🔍 Team:", {
      ownerId: team.ownerId,
      members: team.members.map((m) => ({
        athleteId: m.athleteId,
        role: m.role,
      })),
    });

    // ✅ FIXED #4: Correct membership detection
    const senderMembership = team.members.find(
      (m) => m.athleteId === currentAthleteId
    );
    const isOwner = team.ownerId === currentAthleteId;

    console.log("🔍 Authorization:", {
      isOwner,
      senderRole: senderMembership?.role || "none",
      memberFound: !!senderMembership,
    });

    // ✅ FIXED #5: Proper authorization logic
    const isAuthorized =
      isOwner ||
      ["OWNER", "CAPTAIN", "PLAYER", "MANAGER"].includes(
        senderMembership?.role || ""
      );

    if (!isAuthorized) {
      throw new Error(
        `Not authorized. Owner: ${isOwner}, Role: ${
          senderMembership?.role || "none"
        }`
      );
    }

    // ✅ Target athlete exists
    const targetAthlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      select: { id: true, firstName: true },
    });
    if (!targetAthlete) throw new Error("Target athlete not found");

    // ✅ Not already a member
    const existingMembership = await prisma.teamMembership.findFirst({
      where: { teamId, athleteId },
    });
    if (existingMembership) throw new Error("Already a team member");

    // ✅ No pending invite
    const existingInvite = await prisma.teamInvitation.findFirst({
      where: {
        teamId,
        invitedAthleteId: athleteId,
        status: "PENDING",
      },
    });
    if (existingInvite) throw new Error("Invite already pending");

    // ✅ CREATE INVITATION
    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId,
        invitedById: currentAthleteId, // ✅ YOU (sender)
        invitedAthleteId: athleteId, // ✅ TARGET
        status: "PENDING", // 7 days
        message: `Join ${team.name} as a teammate!`,
      },
      include: {
        team: { select: { name: true, sport: true } },
        invitedAthlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profileImage: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });
    await prisma.notification.create({
      data: {
        athleteId: athleteId, // Target athlete receives
        type: "TEAM_INVITE", // Notification type
        title: "New Team Invitation!",
        message: `${team.name} has invited you to join!`,
        data: {
          invitationId: invitation.id,
          teamId: team.teamApplicationId,
          teamName: team.name,
          sport: team.sport,
          invitedById: currentAthleteId,
        },
        isRead: false, // Deep link
      },
    });

    logger.team.debug("✅ Team invitation sent", {
      invitationId: invitation.id,
      fromAthleteId: currentAthleteId,
      toAthleteId: athleteId,
      teamId,
    });

    return {
      success: true,
      invitation,
    };
  } catch (error) {
    const errorMessage: any = "Failed to send invitation";
    logger.team.error(errorMessage, {
      teamId,
      athleteId,
      userId: (await auth()).userId,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}
