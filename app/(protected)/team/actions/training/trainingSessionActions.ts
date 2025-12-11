"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  CreateTrainingSessionInput,
  CreateExerciseInput,
  TrainingSessionWithRelations,
  ExerciseWithCompletions,
} from "@/types/Training/types/training";
import { getTrainingPermissions } from "../../lib/trainingPermissionsClient";

// ============================================
// CREATE TRAINING SESSION
// ============================================

export async function createTrainingSession(
  input: CreateTrainingSessionInput
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log("[createTrainingSession] Starting with input:", input);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[createTrainingSession] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: "Session title is required" };
    }

    if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
      return { success: false, error: "Invalid day of week (must be 0-6)" };
    }

    // Fetch week with plan and team to check permissions
    const week = await prisma.trainingWeek.findUnique({
      where: { id: input.weekId },
      include: {
        plan: {
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
        },
      },
    });

    if (!week) {
      console.error("[createTrainingSession] Week not found:", input.weekId);
      return { success: false, error: "Training week not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(week.plan.team as any, userId);
    if (!permissions.canCreateSession) {
      console.error("[createTrainingSession] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to create training sessions",
      };
    }

    // Create session
    const session = await prisma.trainingSession.create({
      data: {
        weekId: input.weekId,
        dayOfWeek: input.dayOfWeek,
        timeOfDay: input.timeOfDay,
        title: input.title,
        description: input.description,
        durationMinutes: input.durationMinutes,
        location: input.location,
        equipment: input.equipment || [],
      },
      include: {
        exercises: {
          include: {
            completions: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        footage: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            recordedDate: "desc",
          },
        },
      },
    });

    console.log(
      "[createTrainingSession] Successfully created session:",
      session.id
    );

    // Revalidate team page
    revalidatePath(`/teams/${week.plan.teamId}`);

    return { success: true, data: session };
  } catch (error) {
    console.error("[createTrainingSession] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create training session",
    };
  }
}

// ============================================
// UPDATE TRAINING SESSION
// ============================================

export async function updateTrainingSession(
  sessionId: string,
  updates: Partial<any>
): Promise<{
  success: boolean;
  data?: TrainingSessionWithRelations;
  error?: string;
}> {
  try {
    console.log("[updateTrainingSession] Starting with sessionId:", sessionId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[updateTrainingSession] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch existing session
    const existingSession = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        week: {
          include: {
            plan: {
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
            },
          },
        },
      },
    });

    if (!existingSession) {
      console.error("[updateTrainingSession] Session not found:", sessionId);
      return { success: false, error: "Training session not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(
      existingSession.week.plan.team as any,
      userId
    );
    if (!permissions.canEditSession) {
      console.error("[updateTrainingSession] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to edit this training session",
      };
    }

    // Validate updates
    if (updates.title && updates.title.trim().length === 0) {
      return { success: false, error: "Session title cannot be empty" };
    }

    if (
      updates.dayOfWeek !== undefined &&
      (updates.dayOfWeek < 0 || updates.dayOfWeek > 6)
    ) {
      return { success: false, error: "Invalid day of week (must be 0-6)" };
    }

    // Update session
    const updatedSession = await prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        title: updates.title,
        description: updates.description,
        dayOfWeek: updates.dayOfWeek,
        timeOfDay: updates.timeOfDay,
        durationMinutes: updates.durationMinutes,
        location: updates.location,
        equipment: updates.equipment,
      },
      include: {
        exercises: {
          include: {
            completions: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        footage: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            recordedDate: "desc",
          },
        },
      },
    });

    console.log(
      "[updateTrainingSession] Successfully updated session:",
      sessionId
    );

    // Revalidate team page
    revalidatePath(`/teams/${existingSession.week.plan.teamId}`);

    return { success: true, data: updatedSession };
  } catch (error) {
    console.error("[updateTrainingSession] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update training session",
    };
  }
}

// ============================================
// DELETE TRAINING SESSION
// ============================================

export async function deleteTrainingSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[deleteTrainingSession] Starting with sessionId:", sessionId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[deleteTrainingSession] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch session with team
    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        week: {
          include: {
            plan: {
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
            },
          },
        },
      },
    });

    if (!session) {
      console.error("[deleteTrainingSession] Session not found:", sessionId);
      return { success: false, error: "Training session not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(
      session.week.plan.team as any,
      userId
    );
    if (!permissions.canDeleteSession) {
      console.error("[deleteTrainingSession] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to delete this training session",
      };
    }

    // Delete session (cascade will handle exercises)
    await prisma.trainingSession.delete({
      where: { id: sessionId },
    });

    console.log(
      "[deleteTrainingSession] Successfully deleted session:",
      sessionId
    );

    // Revalidate team page
    revalidatePath(`/teams/${session.week.plan.teamId}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteTrainingSession] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete training session",
    };
  }
}

// ============================================
// CREATE EXERCISE
// ============================================

export async function createExercise(input: CreateExerciseInput): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log("[createExercise] Starting with input:", input);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[createExercise] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: "Exercise name is required" };
    }

    // Fetch session with team to check permissions
    const session = await prisma.trainingSession.findUnique({
      where: { id: input.sessionId },
      include: {
        week: {
          include: {
            plan: {
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
            },
          },
        },
      },
    });

    if (!session) {
      console.error("[createExercise] Session not found:", input.sessionId);
      return { success: false, error: "Training session not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(
      session.week.plan.team as any,
      userId
    );
    if (!permissions.canCreateExercise) {
      console.error("[createExercise] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to create exercises",
      };
    }

    // Create exercise
    const exercise = await prisma.exercise.create({
      data: {
        sessionId: input.sessionId,
        orderIndex: input.orderIndex,
        name: input.name,
        category: input.category,
        sets: input.sets,
        reps: input.reps,
        duration: input.duration,
        restPeriod: input.restPeriod,
        tempo: input.tempo,
        weight: input.weight,
        intensity: input.intensity,
        notes: input.notes,
        videoUrl: input.videoUrl,
      },
      include: {
        completions: {
          select: {
            id: true,
            athleteId: true,
            completed: true,
            completedAt: true,
            notes: true,
            difficulty: true,
          },
        },
      },
    });

    console.log("[createExercise] Successfully created exercise:", exercise.id);

    // Revalidate team page
    revalidatePath(`/teams/${session.week.plan.teamId}`);

    return { success: true, data: exercise };
  } catch (error) {
    console.error("[createExercise] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create exercise",
    };
  }
}

// ============================================
// UPDATE EXERCISE
// ============================================

export async function updateExercise(
  exerciseId: string,
  updates: Partial<CreateExerciseInput>
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log("[updateExercise] Starting with exerciseId:", exerciseId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[updateExercise] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch existing exercise
    const existingExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        session: {
          include: {
            week: {
              include: {
                plan: {
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
                },
              },
            },
          },
        },
      },
    });

    if (!existingExercise) {
      console.error("[updateExercise] Exercise not found:", exerciseId);
      return { success: false, error: "Exercise not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(
      existingExercise.session.week.plan.team as any,
      userId
    );
    if (!permissions.canEditExercise) {
      console.error("[updateExercise] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to edit this exercise",
      };
    }

    // Validate updates
    if (updates.name && updates.name.trim().length === 0) {
      return { success: false, error: "Exercise name cannot be empty" };
    }

    // Update exercise
    const updatedExercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        name: updates.name,
        category: updates.category,
        orderIndex: updates.orderIndex,
        sets: updates.sets,
        reps: updates.reps,
        duration: updates.duration,
        restPeriod: updates.restPeriod,
        tempo: updates.tempo,
        weight: updates.weight,
        intensity: updates.intensity,
        notes: updates.notes,
        videoUrl: updates.videoUrl,
      },
      include: {
        completions: {
          select: {
            id: true,
            athleteId: true,
            completed: true,
            completedAt: true,
            notes: true,
            difficulty: true,
          },
        },
      },
    });

    console.log("[updateExercise] Successfully updated exercise:", exerciseId);

    // Revalidate team page
    revalidatePath(`/teams/${existingExercise.session.week.plan.teamId}`);

    return { success: true, data: updatedExercise };
  } catch (error) {
    console.error("[updateExercise] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update exercise",
    };
  }
}

// ============================================
// DELETE EXERCISE
// ============================================

export async function deleteExercise(
  exerciseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[deleteExercise] Starting with exerciseId:", exerciseId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[deleteExercise] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch exercise with team
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        session: {
          include: {
            week: {
              include: {
                plan: {
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
                },
              },
            },
          },
        },
      },
    });

    if (!exercise) {
      console.error("[deleteExercise] Exercise not found:", exerciseId);
      return { success: false, error: "Exercise not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(
      exercise.session.week.plan.team as any,
      userId
    );
    if (!permissions.canDeleteExercise) {
      console.error("[deleteExercise] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to delete this exercise",
      };
    }

    // Delete exercise (cascade will handle completions)
    await prisma.exercise.delete({
      where: { id: exerciseId },
    });

    console.log("[deleteExercise] Successfully deleted exercise:", exerciseId);

    // Revalidate team page
    revalidatePath(`/teams/${exercise.session.week.plan.teamId}`);

    return { success: true };
  } catch (error) {
    console.error("[deleteExercise] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete exercise",
    };
  }
}

// ============================================
// REORDER EXERCISES
// ============================================

export async function reorderExercises(
  sessionId: string,
  exerciseIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[reorderExercises] Starting for session:", sessionId);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[reorderExercises] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // Fetch session with team to check permissions
    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        week: {
          include: {
            plan: {
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
            },
          },
        },
      },
    });

    if (!session) {
      console.error("[reorderExercises] Session not found:", sessionId);
      return { success: false, error: "Training session not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(
      session.week.plan.team as any,
      userId
    );
    if (!permissions.canEditExercise) {
      console.error("[reorderExercises] Insufficient permissions");
      return {
        success: false,
        error: "You don't have permission to reorder exercises",
      };
    }

    // Update order indexes in transaction
    await prisma.$transaction(
      exerciseIds.map((exerciseId, index) =>
        prisma.exercise.update({
          where: { id: exerciseId },
          data: { orderIndex: index },
        })
      )
    );

    console.log("[reorderExercises] Successfully reordered exercises");

    // Revalidate team page
    revalidatePath(`/teams/${session.week.plan.teamId}`);

    return { success: true };
  } catch (error) {
    console.error("[reorderExercises] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reorder exercises",
    };
  }
}
