"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server"; // Import Clerk auth

const sendJoinRequestSchema = z.object({
  teamId: z.string(),
  message: z.string().max(500).optional(),
});

export async function sendTeamJoinRequest({
  teamId,
  message,
}: z.infer<typeof sendJoinRequestSchema>) {
  const validatedData = sendJoinRequestSchema.parse({ teamId, message });
  const startTime = Date.now();

  try {
    // Use Clerk server auth to get userId
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Query athlete by Clerk userId
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      throw new Error("Athlete profile not found");
    }

    const athleteId = athlete.id;

    // 1. Check if already a member
    const existingMembership = await prisma.teamMembership.findFirst({
      where: {
        athleteId,
        teamId,
      },
    });

    if (existingMembership) throw new Error("You are already a team member");

    // 2. Check if pending invitation exists
    const pendingInvite = await prisma.teamInvitation.findFirst({
      where: {
        teamId,
        invitedAthleteId: athleteId,
        status: "PENDING",
      },
    });

    if (pendingInvite)
      throw new Error("You have a pending invitation. Please respond first.");

    // 3. Check if pending join request exists
    const pendingRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        teamId,
        athleteId,
        status: "PENDING",
      },
    });

    if (pendingRequest)
      throw new Error("You already have a pending join request");

    // 4. Create join request
    const joinRequest = await prisma.teamJoinRequest.create({
      data: {
        teamId,
        athleteId,
        message: validatedData.message || "",
        status: "PENDING",
      },
      include: {
        team: {
          select: { name: true },
        },
        athlete: {
          select: { username: true, firstName: true, lastName: true },
        },
      },
    });

    // 5. Notify team owner/captains
    const teamCaptains = await prisma.teamMembership.findMany({
      where: {
        teamId,
        OR: [{ role: "OWNER" }, { role: "CAPTAIN" }],
      },
      select: { athleteId: true },
    });

    await prisma.$transaction(
      teamCaptains.map((captain) =>
        prisma.notification.create({
          data: {
            athleteId: captain.athleteId,
            actorId: athleteId,
            type: "TEAM_JOIN_REQUEST",
            title: "New Join Request",
            message: `${
              joinRequest.athlete.username || joinRequest.athlete.firstName
            } wants to join your team`,
            data: {
              requestId: joinRequest.id,
              teamId,
              athleteId,
            },
          },
        })
      )
    );

    const queryTime = Date.now() - startTime;
    logger.team.debug("✅ Join request sent", {
      requestId: joinRequest.id,
      teamId,
      athleteId,
      queryTime: `${queryTime}ms`,
    });

    revalidatePath(`/team/${teamId}`);

    return {
      success: true,
      data: joinRequest,
    };
  } catch (error) {
    logger.team.error(error as Error, {
      action: "sendTeamJoinRequest",
      teamId: validatedData.teamId,
    });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send join request",
    };
  }
}
