"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { logger } from "../../utils/logger";

const handleJoinRequestSchema = z.object({
  requestId: z.string(),
  decision: z.enum(["ACCEPT", "REJECT"]),
});

export async function handleTeamJoinRequest({
  requestId,
  decision,
}: z.infer<typeof handleJoinRequestSchema>) {
  const validated = handleJoinRequestSchema.parse({ requestId, decision });

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Must be logged in");

    // Get current athlete
    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!currentAthlete) {
      throw new Error("Athlete profile not found");
    }

    // Get join request with team and athlete
    const joinRequest = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            teamApplicationId: true,
          },
        },
        athlete: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!joinRequest) {
      throw new Error("Join request not found");
    }

    // Verify authorization
    const team = joinRequest.team;
    const isOwner = team.ownerId === currentAthlete.id;

    if (!isOwner) {
      const membership = await prisma.teamMembership.findFirst({
        where: {
          teamId: team.id,
          athleteId: currentAthlete.id,
          role: { in: ["OWNER", "CAPTAIN"] },
        },
      });

      if (!membership) {
        throw new Error("Not authorized to manage this team");
      }
    }

    if (decision === "ACCEPT") {
      // Check if athlete is already a member
      const existingMembership = await prisma.teamMembership.findFirst({
        where: {
          teamId: team.id,
          athleteId: joinRequest.athlete.id,
        },
      });

      if (existingMembership) {
        throw new Error("Athlete is already a team member");
      }

      // Create membership
      await prisma.$transaction(async (tx) => {
        // Create TeamMembership
        await tx.teamMembership.create({
          data: {
            teamId: team.id,
            athleteId: joinRequest.athlete.id,
            role: "PLAYER",
            isCaptain: false,
          },
        });

        // Update join request
        await tx.teamJoinRequest.update({
          where: { id: requestId },
          data: {
            status: "ACCEPTED",
            reviewedById: currentAthlete.id,
            reviewedAt: new Date(),
          },
        });

        // Notify athlete
        await tx.notification.create({
          data: {
            athleteId: joinRequest.athlete.id,
            actorId: currentAthlete.id,
            type: "TEAM_JOIN_REQUEST",
            title: "Join Request Accepted!",
            message: `Welcome to ${team.name}! You've been added as a player.`,
            data: {
              teamId: team.teamApplicationId || team.id,
              teamName: team.name,
            },
          },
        });

        // Notify other captains/owner
        const teamLeaders = await tx.teamMembership.findMany({
          where: {
            teamId: team.id,
            role: { in: ["OWNER", "CAPTAIN"] },
            athleteId: { not: joinRequest.athlete.id },
          },
          select: { athleteId: true },
        });

        await Promise.all(
          teamLeaders.map((leader) =>
            tx.notification.create({
              data: {
                athleteId: leader.athleteId,
                actorId: currentAthlete.id,
                type: "MEMBER_JOINED",
                title: "New Member Joined",
                message: `${joinRequest.athlete.firstName} ${joinRequest.athlete.lastName} joined the team`,
                data: {
                  teamId: team.teamApplicationId || team.id,
                  teamName: team.name,
                  athleteId: joinRequest.athlete.id,
                },
              },
            })
          )
        );

        await tx.teamJoinRequest.delete({
          where: { id: requestId },
        });
      });
    } else {
      // REJECT - just update status
      await prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          reviewedById: currentAthlete.id,
          reviewedAt: new Date(),
        },
      });

      // Notify athlete
      await prisma.notification.create({
        data: {
          athleteId: joinRequest.athlete.id,
          actorId: currentAthlete.id,
          type: "TEAM_JOIN_REQUEST",
          title: "Join Request Rejected",
          message: `Your request to join ${team.name} was declined.`,
          data: {
            teamId: team.teamApplicationId || team.id,
            teamName: team.name,
          },
        },
      });
    }

    logger.team.debug("✅ Join request processed", {
      requestId,
      decision,
      teamId: team.id,
      athleteId: joinRequest.athlete.id,
    });

    // Revalidate team pages
    revalidatePath(`/team/${team.teamApplicationId || team.id}`);

    return {
      success: true,
      data: { requestId, decision, teamId: team.id },
    };
  } catch (error) {
    logger.team.error(error as Error, {
      action: "handleTeamJoinRequest",
      requestId: validated.requestId,
      decision: validated.decision,
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process request",
    };
  }
}
