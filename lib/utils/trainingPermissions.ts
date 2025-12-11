"use server";

import prisma from "../prisma";

export async function canManageTraining(
  clerkUserId: string,
  teamApplicationId: string
): Promise<boolean> {
  try {
    console.log("[canManageTraining] Called with Clerk ID:", {
      clerkUserId,
      teamApplicationId,
    });

    if (!clerkUserId || !teamApplicationId) {
      console.error("[canManageTraining] Missing parameters");
      return false;
    }

    // ✅ STEP 1: Find the Athlete/User by Clerk ID
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: clerkUserId },
      select: { id: true },
    });

    console.log("[canManageTraining] Athlete lookup:", {
      clerkId: clerkUserId,
      athleteId: athlete?.id,
    });

    if (!athlete) {
      console.error("[canManageTraining] Athlete not found for Clerk ID");
      return false;
    }

    const athleteId = athlete.id;

    // ✅ STEP 2: Find team by teamApplicationId
    const team = await prisma.team.findUnique({
      where: { teamApplicationId },
      select: {
        id: true,
        ownerId: true,
        overseerGuideId: true,
        members: {
          where: {
            athleteId: athleteId,
          },
          select: {
            role: true,
            athleteId: true,
            isCaptain: true,
          },
        },
      },
    });

    console.log("[canManageTraining] Team and member check:", {
      teamFound: !!team,
      teamOwnerId: team?.ownerId,
      athleteId: athleteId,
      guideId: team?.overseerGuideId,
      members: team?.members,
      isOwner: team?.ownerId === athleteId,
    });

    if (!team) {
      console.log("[canManageTraining] Team not found");
      return false;
    }

    // ✅ STEP 3: Check if athlete is owner
    if (team.ownerId === athleteId) {
      console.log("[canManageTraining] User is owner ✅");
      return true;
    }

    // ✅ STEP 4: Check if athlete is guide
    if (team.overseerGuideId === athleteId) {
      console.log("[canManageTraining] User is guide ✅");
      return true;
    }

    // ✅ STEP 5: Check if athlete is captain
    const member = team.members.find((m) => m.athleteId === athleteId);
    if (member) {
      const isCaptain = member.isCaptain === true || member.role === "CAPTAIN";

      console.log("[canManageTraining] Member found:", {
        role: member.role,
        isCaptain: member.isCaptain,
        hasPermission: isCaptain,
      });

      if (isCaptain) {
        console.log("[canManageTraining] User is captain ✅");
        return true;
      }
    }

    console.log("[canManageTraining] User has no permission ❌");
    return false;
  } catch (error) {
    console.error("[canManageTraining] Error:", error);
    return false;
  }
}

export async function canViewTraining(
  clerkUserId: string,
  teamApplicationId: string
): Promise<boolean> {
  try {
    console.log("[canViewTraining] Called with:", {
      clerkUserId,
      teamApplicationId,
    });

    if (!clerkUserId || !teamApplicationId) {
      return false;
    }

    // Find athlete by Clerk ID
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: clerkUserId },
      select: { id: true },
    });

    if (!athlete) {
      return false;
    }

    const athleteId = athlete.id;

    // Find team
    const team = await prisma.team.findUnique({
      where: { teamApplicationId },
      select: {
        id: true,
        ownerId: true,
        overseerGuideId: true,
        members: {
          where: {
            athleteId: athleteId,
          },
          select: {
            athleteId: true,
          },
        },
      },
    });

    if (!team) {
      return false;
    }

    // Owner, guide, or any member can view
    const canView =
      team.ownerId === athleteId ||
      team.overseerGuideId === athleteId ||
      team.members.length > 0;

    console.log("[canViewTraining] Result:", canView);
    return canView;
  } catch (error) {
    console.error("[canViewTraining] Error:", error);
    return false;
  }
}
