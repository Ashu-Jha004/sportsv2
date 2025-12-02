"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { logger } from "../../utils/logger";
import { TeamMemberRole } from "@prisma/client";

const manageMemberSchema = z.object({
  teamId: z.string(),
  targetAthleteId: z.string(),
  action: z.enum(["REMOVE", "CHANGE_ROLE", "TRANSFER_OWNERSHIP"]),
  newRole: z.enum(["OWNER", "CAPTAIN", "PLAYER", "MANAGER"]).optional(),
});

export async function manageMember({
  teamId,
  targetAthleteId,
  action,
  newRole,
}: z.infer<typeof manageMemberSchema>) {
  const validated = manageMemberSchema.parse({
    teamId,
    targetAthleteId,
    action,
    newRole,
  });

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

    // Get team with members
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            athlete: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!team) throw new Error("Team not found");

    // Check authorization
    const isOwner = team.ownerId === currentAthlete.id;
    const currentMembership = team.members.find(
      (m) => m.athleteId === currentAthlete.id
    );
    const isCaptain = currentMembership?.role === "CAPTAIN";

    if (!isOwner && !isCaptain) {
      throw new Error("Not authorized to manage team members");
    }

    // Get target membership
    const targetMembership = team.members.find(
      (m) => m.athleteId === targetAthleteId
    );

    if (!targetMembership) {
      throw new Error("Target member not found");
    }

    const targetAthlete = targetMembership.athlete;

    // REMOVE MEMBER
    if (action === "REMOVE") {
      // Captains can't remove owners or other captains
      if (isCaptain && !isOwner) {
        if (["OWNER", "CAPTAIN"].includes(targetMembership.role)) {
          throw new Error("Captains cannot remove owners or other captains");
        }
      }

      // Can't remove yourself if you're the owner
      if (isOwner && targetAthleteId === currentAthlete.id) {
        throw new Error(
          "Owner cannot remove themselves. Transfer ownership first."
        );
      }

      // Can't remove the owner
      if (targetMembership.role === "OWNER") {
        throw new Error("Cannot remove the team owner");
      }

      await prisma.$transaction(async (tx) => {
        // Remove membership
        await tx.teamMembership.delete({
          where: { id: targetMembership.id },
        });

        // Notify removed member
        await tx.notification.create({
          data: {
            athleteId: targetAthleteId,
            actorId: currentAthlete.id,
            type: "MEMBER_LEFT",
            title: "Removed from Team",
            message: `You were removed from ${team.name}`,
            data: {
              teamId: team.teamApplicationId || team.id,
              teamName: team.name,
              removedBy: currentAthlete.id,
            },
          },
        });

        // Notify team leaders
        const leaders = team.members.filter(
          (m) =>
            ["OWNER", "CAPTAIN"].includes(m.role) &&
            m.athleteId !== currentAthlete.id &&
            m.athleteId !== targetAthleteId
        );

        await Promise.all(
          leaders.map((leader) =>
            tx.notification.create({
              data: {
                athleteId: leader.athleteId,
                actorId: currentAthlete.id,
                type: "MEMBER_LEFT",
                title: "Member Removed",
                message: `${targetAthlete.firstName} ${targetAthlete.lastName} was removed from the team`,
                data: {
                  teamId: team.teamApplicationId || team.id,
                  teamName: team.name,
                  removedAthleteId: targetAthleteId,
                },
              },
            })
          )
        );
      });

      logger.team.debug("✅ Member removed", {
        teamId,
        removedBy: currentAthlete.id,
        removedAthlete: targetAthleteId,
      });

      revalidatePath(`/team/${team.teamApplicationId || team.id}`);

      return {
        success: true,
        message: "Member removed successfully",
      };
    }

    // CHANGE ROLE
    if (action === "CHANGE_ROLE") {
      if (!newRole) throw new Error("New role is required");

      // Only owners can promote to captain or change captain roles
      if (!isOwner && ["OWNER", "CAPTAIN"].includes(newRole)) {
        throw new Error("Only owners can promote to captain");
      }

      // Can't change owner role (must use transfer ownership)
      if (targetMembership.role === "OWNER" || newRole === "OWNER") {
        throw new Error("Use transfer ownership to change owner");
      }

      await prisma.$transaction(async (tx) => {
        // Update role
        await tx.teamMembership.update({
          where: { id: targetMembership.id },
          data: {
            role: newRole as TeamMemberRole,
            isCaptain: newRole === "CAPTAIN",
          },
        });

        // Notify member
        await tx.notification.create({
          data: {
            athleteId: targetAthleteId,
            actorId: currentAthlete.id,
            type: "ROLE_CHANGED",
            title: "Role Updated",
            message: `Your role in ${team.name} was changed to ${newRole}`,
            data: {
              teamId: team.teamApplicationId || team.id,
              teamName: team.name,
              newRole,
            },
          },
        });
      });

      logger.team.debug("✅ Member role changed", {
        teamId,
        targetAthlete: targetAthleteId,
        newRole,
      });

      revalidatePath(`/team/${team.teamApplicationId || team.id}`);

      return {
        success: true,
        message: `Role changed to ${newRole}`,
      };
    }

    // TRANSFER OWNERSHIP
    if (action === "TRANSFER_OWNERSHIP") {
      if (!isOwner) {
        throw new Error("Only the owner can transfer ownership");
      }

      if (targetAthleteId === currentAthlete.id) {
        throw new Error("You are already the owner");
      }

      await prisma.$transaction(async (tx) => {
        // Update team owner
        await tx.team.update({
          where: { id: teamId },
          data: { ownerId: targetAthleteId },
        });

        // Update old owner to captain
        await tx.teamMembership.update({
          where: { athleteId: currentAthlete.id },
          data: {
            role: "CAPTAIN",
            isCaptain: true,
          },
        });

        // Update new owner membership
        await tx.teamMembership.update({
          where: { id: targetMembership.id },
          data: {
            role: "OWNER",
            isCaptain: false,
          },
        });

        // Notify new owner
        await tx.notification.create({
          data: {
            athleteId: targetAthleteId,
            actorId: currentAthlete.id,
            type: "ROLE_CHANGED",
            title: "Team Ownership Transferred",
            message: `You are now the owner of ${team.name}!`,
            data: {
              teamId: team.teamApplicationId || team.id,
              teamName: team.name,
              previousOwner: currentAthlete.id,
            },
          },
        });

        // Notify all members
        const allMembers = team.members.filter(
          (m) =>
            m.athleteId !== currentAthlete.id && m.athleteId !== targetAthleteId
        );

        await Promise.all(
          allMembers.map((member) =>
            tx.notification.create({
              data: {
                athleteId: member.athleteId,
                actorId: currentAthlete.id,
                type: "ROLE_CHANGED",
                title: "New Team Owner",
                message: `${targetAthlete.firstName} ${targetAthlete.lastName} is now the owner of ${team.name}`,
                data: {
                  teamId: team.teamApplicationId || team.id,
                  teamName: team.name,
                  newOwner: targetAthleteId,
                },
              },
            })
          )
        );
      });

      logger.team.debug("✅ Ownership transferred", {
        teamId,
        fromAthlete: currentAthlete.id,
        toAthlete: targetAthleteId,
      });

      revalidatePath(`/team/${team.teamApplicationId || team.id}`);

      return {
        success: true,
        message: "Ownership transferred successfully",
      };
    }

    throw new Error("Invalid action");
  } catch (error) {
    logger.team.error(error as Error, {
      action: "manageMember",
      teamId: validated.teamId,
      targetAthleteId: validated.targetAthleteId,
      actionType: validated.action,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to manage member",
    };
  }
}
