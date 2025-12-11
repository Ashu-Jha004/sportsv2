"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { canManageTraining } from "@/lib/utils/trainingPermissions";
import prisma from "@/lib/prisma";
import {
  CreateTrainingPlanInput,
  trainingPlanInclude,
  TrainingPlanWithRelations,
} from "@/types/Training/types/training";
import { getTrainingPermissions } from "../../lib/trainingPermissionsClient";

// ============================================
// CREATE TRAINING PLAN
// ============================================

export async function createTrainingPlan(
  input: CreateTrainingPlanInput
): Promise<{
  success: boolean;
  data?: TrainingPlanWithRelations;
  error?: string;
}> {
  try {
    console.log("[createTrainingPlan] Starting with input:", input);

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    console.log("[createTrainingPlan] Authenticated Clerk user:", userId);

    // ✅ STEP 1: Find athlete by Clerk ID
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      console.error(
        "[createTrainingPlan] Athlete not found for Clerk ID:",
        userId
      );
      return { success: false, error: "User account not found" };
    }

    const athleteId = athlete.id;
    console.log("[createTrainingPlan] Athlete ID:", athleteId);

    // ✅ STEP 2: Find team by teamApplicationId
    const team = await prisma.team.findUnique({
      where: { teamApplicationId: input.teamId },
      select: {
        id: true,
        teamApplicationId: true,
        ownerId: true,
        overseerGuideId: true,
      },
    });

    console.log("[createTrainingPlan] Team found:", team);

    if (!team) {
      return { success: false, error: "Team not found" };
    }

    // ✅ STEP 3: Check permissions
    const hasPermission = await canManageTraining(userId, input.teamId);

    if (!hasPermission) {
      return {
        success: false,
        error: "You don't have permission to create training plans",
      };
    }

    // ✅ STEP 4: Create plan using athleteId (not Clerk userId!)
    const plan = await prisma.$transaction(async (tx) => {
      // Deactivate existing plans
      await tx.trainingPlan.updateMany({
        where: {
          teamId: team.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      console.log("[createTrainingPlan] Deactivated existing plans");

      // Create new plan with athleteId
      const newPlan = await tx.trainingPlan.create({
        data: {
          teamId: team.id,
          name: input.name,
          description: input.description,
          goal: input.goal,
          totalWeeks: input.totalWeeks,
          isActive: true,
          createdById: athleteId, // ✅ Use athleteId instead of userId!
        },
      });

      console.log("[createTrainingPlan] Plan created:", newPlan.id);

      // Create empty weeks
      const weekPromises = Array.from({ length: input.totalWeeks }, (_, i) =>
        tx.trainingWeek.create({
          data: {
            planId: newPlan.id,
            weekNumber: i + 1,
          },
        })
      );

      await Promise.all(weekPromises);
      console.log("[createTrainingPlan] Weeks created:", input.totalWeeks);

      return newPlan;
    });

    // Fetch complete plan
    const fullPlan = await prisma.trainingPlan.findUnique({
      where: { id: plan.id },
      include: trainingPlanInclude,
    });

    console.log("[createTrainingPlan] Success! Plan created:", fullPlan?.id);

    return { success: true, data: fullPlan! };
  } catch (error) {
    console.error("[createTrainingPlan] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create training plan",
    };
  }
}

// ============================================
// UPDATE TRAINING PLAN
// ============================================

export async function updateTrainingPlan(
  planId: string,
  updates: Partial<CreateTrainingPlanInput>
): Promise<{
  success: boolean;
  data?: TrainingPlanWithRelations;
  error?: string;
}> {
  try {
    console.log("[updateTrainingPlan] Starting with planId:", planId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[updateTrainingPlan] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch existing plan
    const existingPlan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: {
        team: {
          include: {
            members: {
              include: {
                athlete: true,
              },
            },
            owner: true,
            overseerGuide: true,
          },
        },
      },
    });

    if (!existingPlan) {
      console.error("[updateTrainingPlan] Plan not found:", planId);
      return { success: false, error: "Training plan not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(
      existingPlan.team as any,
      userId
    );
    if (!permissions.canEditPlan) {
      console.error("[updateTrainingPlan] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to edit this training plan",
      };
    }

    // Validate updates
    if (updates.name && updates.name.trim().length === 0) {
      return { success: false, error: "Plan name cannot be empty" };
    }

    if (
      updates.totalWeeks !== undefined &&
      (updates.totalWeeks < 1 || updates.totalWeeks > 52)
    ) {
      return { success: false, error: "Plan must be between 1 and 52 weeks" };
    }

    // Update plan
    const updatedPlan = await prisma.trainingPlan.update({
      where: { id: planId },
      data: {
        name: updates.name,
        description: updates.description,
        goal: updates.goal,
        startDate: updates.startDate,
        endDate: updates.endDate,
        lastEditedBy: userId,
        lastEditedAt: new Date(),
      },
      include: trainingPlanInclude,
    });

    console.log("[updateTrainingPlan] Successfully updated plan:", planId);

    // Revalidate team page
    revalidatePath(`/teams/${existingPlan.teamId}`);

    return { success: true, data: updatedPlan };
  } catch (error) {
    console.error("[updateTrainingPlan] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update training plan",
    };
  }
}

// ============================================
// DELETE TRAINING PLAN
// ============================================

export async function deleteTrainingPlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[deleteTrainingPlan] Starting with planId:", planId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[deleteTrainingPlan] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch plan with team
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: {
        team: {
          include: {
            members: {
              include: {
                athlete: true,
              },
            },
            owner: true,
            overseerGuide: true,
          },
        },
      },
    });

    if (!plan) {
      console.error("[deleteTrainingPlan] Plan not found:", planId);
      return { success: false, error: "Training plan not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(plan.team as any, userId);
    if (!permissions.canDeletePlan) {
      console.error("[deleteTrainingPlan] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to delete this training plan",
      };
    }

    // Delete plan (cascade will handle weeks, sessions, exercises)
    await prisma.trainingPlan.delete({
      where: { id: planId },
    });

    console.log("[deleteTrainingPlan] Successfully deleted plan:", planId);

    // Revalidate team page
    revalidatePath(`/teams/${plan.teamId}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteTrainingPlan] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete training plan",
    };
  }
}

// ============================================
// ACTIVATE TRAINING PLAN
// ============================================

export async function activateTrainingPlan(planId: string): Promise<{
  success: boolean;
  data?: TrainingPlanWithRelations;
  error?: string;
}> {
  try {
    console.log("[activateTrainingPlan] Starting with planId:", planId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[activateTrainingPlan] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch plan
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: {
        team: {
          include: {
            members: {
              include: {
                athlete: true,
              },
            },
            owner: true,
            overseerGuide: true,
          },
        },
      },
    });

    if (!plan) {
      console.error("[activateTrainingPlan] Plan not found:", planId);
      return { success: false, error: "Training plan not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(plan.team as any, userId);
    if (!permissions.canActivatePlan) {
      console.error("[activateTrainingPlan] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to activate training plans",
      };
    }

    // Deactivate all other plans for this team and activate this one
    const activatedPlan = await prisma.$transaction(async (tx) => {
      // Deactivate all plans for this team
      await tx.trainingPlan.updateMany({
        where: {
          teamId: plan.teamId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Activate this plan
      const activated = await tx.trainingPlan.update({
        where: { id: planId },
        data: {
          isActive: true,
          lastEditedBy: userId,
          lastEditedAt: new Date(),
        },
        include: trainingPlanInclude,
      });

      return activated;
    });

    console.log("[activateTrainingPlan] Successfully activated plan:", planId);

    // Revalidate team page
    revalidatePath(`/teams/${plan.teamId}`);

    // TODO: Send notification to team members about new active plan
    // await createNotification({...})

    return { success: true, data: activatedPlan };
  } catch (error) {
    console.error("[activateTrainingPlan] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to activate training plan",
    };
  }
}

// ============================================
// ARCHIVE TRAINING PLAN
// ============================================

export async function archiveTrainingPlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[archiveTrainingPlan] Starting with planId:", planId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[archiveTrainingPlan] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch plan
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: {
        team: {
          include: {
            members: {
              include: {
                athlete: true,
              },
            },
            owner: true,
            overseerGuide: true,
          },
        },
      },
    });

    if (!plan) {
      console.error("[archiveTrainingPlan] Plan not found:", planId);
      return { success: false, error: "Training plan not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(plan.team as any, userId);
    if (!permissions.canEditPlan) {
      console.error("[archiveTrainingPlan] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to archive this training plan",
      };
    }

    // Archive plan
    await prisma.trainingPlan.update({
      where: { id: planId },
      data: {
        isArchived: true,
        isActive: false,
      },
    });

    console.log("[archiveTrainingPlan] Successfully archived plan:", planId);

    // Revalidate team page
    revalidatePath(`/teams/${plan.teamId}`);

    return { success: true };
  } catch (error) {
    console.error("[archiveTrainingPlan] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to archive training plan",
    };
  }
}

// ============================================
// GET ACTIVE TRAINING PLAN
// ============================================

export async function getActiveTrainingPlan(
  teamApplicationId: string
): Promise<{
  success: boolean;
  data?: TrainingPlanWithRelations | null;
  error?: string;
}> {
  try {
    console.log(
      "[getActiveTrainingPlan] Starting with teamApplicationId:",
      teamApplicationId
    );

    if (!teamApplicationId) {
      return { success: false, error: "Team ID is required" };
    }

    // ✅ FIX: Find team first to get internal ID
    const team = await prisma.team.findUnique({
      where: { teamApplicationId },
      select: { id: true },
    });

    if (!team) {
      console.log("[getActiveTrainingPlan] Team not found");
      return { success: true, data: null }; // Return success with null data
    }

    // Now find plan using internal team ID
    const activePlan = await prisma.trainingPlan.findFirst({
      where: {
        teamId: team.id, // Use internal ID
        isActive: true,
        isArchived: false,
      },
      include: trainingPlanInclude,
    });

    console.log(
      "[getActiveTrainingPlan] Plan found:",
      activePlan?.id || "none"
    );

    return { success: true, data: activePlan };
  } catch (error) {
    console.error("[getActiveTrainingPlan] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch training plan",
    };
  }
}

// ============================================
// GET ALL TRAINING PLANS (INCLUDING ARCHIVED)
// ============================================

export async function getAllTrainingPlans(teamId: string): Promise<{
  success: boolean;
  data?: TrainingPlanWithRelations[];
  error?: string;
}> {
  try {
    console.log("[getAllTrainingPlans] Fetching for team:", teamId);

    const plans = await prisma.trainingPlan.findMany({
      where: {
        teamId,
      },
      include: trainingPlanInclude,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    console.log("[getAllTrainingPlans] Found plans:", plans.length);

    return { success: true, data: plans };
  } catch (error) {
    console.error("[getAllTrainingPlans] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch training plans",
    };
  }
}
