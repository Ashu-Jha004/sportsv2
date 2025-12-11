"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  CreateTrainingFootageInput,
  TrainingFootageWithRelations,
  trainingFootageInclude,
} from "@/types/Training/types/training";
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  isValidYouTubeUrl,
} from "@/lib/utils/trainingHelpers";
import { canManageTraining } from "@/lib/utils/trainingPermissions";

// ============================================
// UPLOAD TRAINING FOOTAGE
// ============================================

export async function uploadTrainingFootage(
  input: CreateTrainingFootageInput
): Promise<{
  success: boolean;
  data?: TrainingFootageWithRelations;
  error?: string;
}> {
  try {
    console.log("[uploadTrainingFootage] Starting with input:", input);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[uploadTrainingFootage] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Validate YouTube URL
    if (!isValidYouTubeUrl(input.youtubeUrl)) {
      console.error(
        "[uploadTrainingFootage] Invalid YouTube URL:",
        input.youtubeUrl
      );
      return {
        success: false,
        error:
          "Invalid YouTube URL. Please provide a valid YouTube video link.",
      };
    }

    // Validate title
    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: "Footage title is required" };
    }

    if (input.title.length > 200) {
      return {
        success: false,
        error: "Title must be less than 200 characters",
      };
    }

    // TeamId in input is teamApplicationId
    const teamApplicationId = input.teamId;

    // Fetch team by application id to get internal id
    const team = await prisma.team.findUnique({
      where: { teamApplicationId },
      select: { id: true },
    });

    if (!team) {
      console.error(
        "[uploadTrainingFootage] Team not found:",
        teamApplicationId
      );
      return { success: false, error: "Team not found" };
    }

    const internalTeamId = team.id;
    console.log("[uploadTrainingFootage] Team internal id:", internalTeamId);

    // Check permissions via server helper (owner / guide / captain)
    const hasPermission = await canManageTraining(userId, teamApplicationId);
    console.log("[uploadTrainingFootage] canManageTraining:", hasPermission);
    if (!hasPermission) {
      console.error("[uploadTrainingFootage] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to upload footage",
      };
    }

    // If sessionId provided, verify it exists and belongs to this team
    if (input.sessionId) {
      const session = await prisma.trainingSession.findUnique({
        where: { id: input.sessionId },
        include: {
          week: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!session) {
        return { success: false, error: "Training session not found" };
      }

      if (session.week.plan.teamId !== internalTeamId) {
        return {
          success: false,
          error: "Session does not belong to this team",
        };
      }
    }

    // If planId provided, verify it exists and belongs to this team
    if (input.planId) {
      const plan = await prisma.trainingPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan) {
        return { success: false, error: "Training plan not found" };
      }

      if (plan.teamId !== internalTeamId) {
        return { success: false, error: "Plan does not belong to this team" };
      }
    }

    // Lookup athlete by Clerk userId so uploadedById uses athlete id
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId }, // ⬅️ your field name
      select: { id: true },
    });

    if (!athlete) {
      console.error(
        "[uploadTrainingFootage] Athlete not found for Clerk ID:",
        userId
      );
      return { success: false, error: "User account not found" };
    }

    const athleteId = athlete.id;

    // Extract YouTube video ID and generate thumbnail
    const videoId = extractYouTubeId(input.youtubeUrl);
    const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId, "hq") : null;

    // Create footage record using internal IDs
    const footage = await prisma.trainingFootage.create({
      data: {
        teamId: internalTeamId,
        planId: input.planId || null,
        sessionId: input.sessionId || null,
        title: input.title,
        description: input.description,
        youtubeUrl: input.youtubeUrl,
        thumbnailUrl,
        recordedDate: input.recordedDate,
        uploadedById: athleteId, // ⬅️ athlete id, not Clerk id
      },
      include: trainingFootageInclude,
    });

    console.log(
      "[uploadTrainingFootage] Successfully uploaded footage:",
      footage.id
    );

    // Revalidate team page (route uses application id)
    revalidatePath(`/team/${teamApplicationId}`);

    return { success: true, data: footage };
  } catch (error) {
    console.error("[uploadTrainingFootage] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload training footage",
    };
  }
}

// ============================================
// UPDATE TRAINING FOOTAGE
// ============================================

export async function updateTrainingFootage(
  footageId: string,
  updates: Partial<CreateTrainingFootageInput>
): Promise<{
  success: boolean;
  data?: TrainingFootageWithRelations;
  error?: string;
}> {
  try {
    console.log("[updateTrainingFootage] Starting with footageId:", footageId);

    const { userId } = await auth();
    if (!userId) {
      console.error("[updateTrainingFootage] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    const existingFootage = await prisma.trainingFootage.findUnique({
      where: { id: footageId },
      include: {
        team: {
          select: {
            id: true,
            teamApplicationId: true,
          },
        },
      },
    });

    if (!existingFootage) {
      console.error("[updateTrainingFootage] Footage not found:", footageId);
      return { success: false, error: "Training footage not found" };
    }

    const teamApplicationId: any = existingFootage.team.teamApplicationId;

    const hasPermission: any = await canManageTraining(
      userId,
      teamApplicationId
    );
    console.log("[updateTrainingFootage] canManageTraining:", hasPermission);
    if (!hasPermission) {
      console.error("[updateTrainingFootage] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to edit this footage",
      };
    }

    if (updates.title && updates.title.trim().length === 0) {
      return { success: false, error: "Footage title cannot be empty" };
    }

    if (updates.title && updates.title.length > 200) {
      return {
        success: false,
        error: "Title must be less than 200 characters",
      };
    }

    if (updates.youtubeUrl && !isValidYouTubeUrl(updates.youtubeUrl)) {
      return { success: false, error: "Invalid YouTube URL" };
    }

    let thumbnailUrl = existingFootage.thumbnailUrl;
    if (updates.youtubeUrl) {
      const videoId = extractYouTubeId(updates.youtubeUrl);
      thumbnailUrl = videoId ? getYouTubeThumbnail(videoId, "hq") : null;
    }

    const updatedFootage = await prisma.trainingFootage.update({
      where: { id: footageId },
      data: {
        title: updates.title,
        description: updates.description,
        youtubeUrl: updates.youtubeUrl,
        thumbnailUrl: updates.youtubeUrl ? thumbnailUrl : undefined,
        recordedDate: updates.recordedDate,
      },
      include: trainingFootageInclude,
    });

    console.log(
      "[updateTrainingFootage] Successfully updated footage:",
      footageId
    );

    revalidatePath(`/team/${teamApplicationId}`);

    return { success: true, data: updatedFootage };
  } catch (error) {
    console.error("[updateTrainingFootage] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update training footage",
    };
  }
}

// ============================================
// DELETE TRAINING FOOTAGE
// ============================================

export async function deleteTrainingFootage(
  footageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[deleteTrainingFootage] Starting with footageId:", footageId);

    const { userId } = await auth();
    if (!userId) {
      console.error("[deleteTrainingFootage] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    const footage = await prisma.trainingFootage.findUnique({
      where: { id: footageId },
      include: {
        team: {
          select: {
            id: true,
            teamApplicationId: true,
          },
        },
      },
    });

    if (!footage) {
      console.error("[deleteTrainingFootage] Footage not found:", footageId);
      return { success: false, error: "Training footage not found" };
    }

    const teamApplicationId: any = footage.team.teamApplicationId;

    // Allow delete if user can manage training
    const hasPermission = await canManageTraining(userId, teamApplicationId);
    console.log("[deleteTrainingFootage] canManageTraining:", hasPermission);

    // Also allow uploader themselves to delete:
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });
    const isUploader =
      athlete && footage.uploadedById && footage.uploadedById === athlete.id;

    if (!hasPermission && !isUploader) {
      console.error("[deleteTrainingFootage] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to delete this footage",
      };
    }

    await prisma.trainingFootage.delete({
      where: { id: footageId },
    });

    console.log(
      "[deleteTrainingFootage] Successfully deleted footage:",
      footageId
    );

    revalidatePath(`/team/${teamApplicationId}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteTrainingFootage] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete training footage",
    };
  }
}

// ============================================
// GET FOOTAGE BY TEAM
// ============================================

export async function getTeamFootage(
  teamApplicationId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{
  success: boolean;
  data?: TrainingFootageWithRelations[];
  hasMore?: boolean;
  error?: string;
}> {
  try {
    console.log(
      "[getTeamFootage] Fetching for team:",
      teamApplicationId,
      "limit:",
      limit,
      "offset:",
      offset
    );

    const team = await prisma.team.findUnique({
      where: { teamApplicationId },
      select: { id: true },
    });

    if (!team) {
      return { success: false, error: "Team not found" };
    }

    const footage = await prisma.trainingFootage.findMany({
      where: {
        teamId: team.id,
      },
      include: trainingFootageInclude,
      orderBy: {
        recordedDate: "desc",
      },
      take: limit + 1,
      skip: offset,
    });

    const hasMore = footage.length > limit;
    const results = hasMore ? footage.slice(0, limit) : footage;

    console.log(
      "[getTeamFootage] Found footage:",
      results.length,
      "hasMore:",
      hasMore
    );

    return { success: true, data: results, hasMore };
  } catch (error) {
    console.error("[getTeamFootage] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch team footage",
    };
  }
}

// ============================================
// GET FOOTAGE BY SESSION
// ============================================

export async function getSessionFootage(sessionId: string): Promise<{
  success: boolean;
  data?: TrainingFootageWithRelations[];
  error?: string;
}> {
  try {
    console.log("[getSessionFootage] Fetching for session:", sessionId);

    const footage = await prisma.trainingFootage.findMany({
      where: {
        sessionId,
      },
      include: trainingFootageInclude,
      orderBy: {
        recordedDate: "desc",
      },
    });

    console.log("[getSessionFootage] Found footage:", footage.length);

    return { success: true, data: footage };
  } catch (error) {
    console.error("[getSessionFootage] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch session footage",
    };
  }
}

// ============================================
// INCREMENT VIEW COUNT
// ============================================

export async function incrementFootageViewCount(
  footageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(
      "[incrementFootageViewCount] Incrementing for footage:",
      footageId
    );

    await prisma.trainingFootage.update({
      where: { id: footageId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    console.log(
      "[incrementFootageViewCount] Successfully incremented view count"
    );

    return { success: true };
  } catch (error) {
    console.error("[incrementFootageViewCount] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to increment view count",
    };
  }
}
