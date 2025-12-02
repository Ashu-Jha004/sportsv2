"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { logger } from "../../utils/logger";

const leaveTeamSchema = z.object({
  teamId: z.string(),
});

export async function leaveTeam({ teamId }: z.infer<typeof leaveTeamSchema>) {
  const validated = leaveTeamSchema.parse({ teamId });

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Must be logged in");

    // Get current athlete
    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!currentAthlete) {
      throw new Error("Athlete profile not found");
    }

    // Get team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        teamApplicationId: true,
        members: {
          where: { athleteId: currentAthlete.id },
          select: { id: true, role: true },
        },
      },
    });

    if (!team) throw new Error("Team not found");

    // Can't leave if you're the owner
    if (team.ownerId === currentAthlete.id) {
      throw new Error(
        "Owner cannot leave the team. Transfer ownership first or delete the team."
      );
    }

    const membership = team.members[0];
    if (!membership) {
      throw new Error("You are not a member of this team");
    }

    await prisma.$transaction(async (tx) => {
      // Remove membership
      await tx.teamMembership.delete({
        where: { id: membership.id },
      });

      // Notify team leaders
      const leaders = await tx.teamMembership.findMany({
        where: {
          teamId,
          role: { in: ["OWNER", "CAPTAIN"] },
        },
        select: { athleteId: true },
      });

      await Promise.all(
        leaders.map((leader) =>
          tx.notification.create({
            data: {
              athleteId: leader.athleteId,
              actorId: currentAthlete.id,
              type: "MEMBER_LEFT",
              title: "Member Left Team",
              message: `${currentAthlete.firstName} ${currentAthlete.lastName} left ${team.name}`,
              data: {
                teamId: team.teamApplicationId || team.id,
                teamName: team.name,
                athleteId: currentAthlete.id,
              },
            },
          })
        )
      );
    });

    logger.team.debug("✅ Member left team", {
      teamId,
      athleteId: currentAthlete.id,
    });

    revalidatePath(`/team/${team.teamApplicationId || team.id}`);

    return {
      success: true,
      message: "You have left the team",
    };
  } catch (error) {
    logger.team.error(error as Error, {
      action: "leaveTeam",
      teamId: validated.teamId,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to leave team",
    };
  }
}
