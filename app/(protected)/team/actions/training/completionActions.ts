"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ToggleExerciseCompletionInput } from "@/types/Training/types/training";
import { getTrainingPermissions } from "../../lib/trainingPermissionsClient";

// ============================================
// TOGGLE EXERCISE COMPLETION
// ============================================

export async function toggleExerciseCompletion(
  input: ToggleExerciseCompletionInput
): Promise<{ success: boolean; completed?: boolean; error?: string }> {
  try {
    console.log("[toggleExerciseCompletion] Starting with input:", input);

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[toggleExerciseCompletion] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // User can only mark their own exercises complete (unless they're admin)
    if (input.athleteId !== userId) {
      console.error(
        "[toggleExerciseCompletion] User trying to mark another user's exercise"
      );
      return {
        success: false,
        error: "You can only mark your own exercises as complete",
      };
    }

    // Fetch exercise with team to verify membership
    const exercise = await prisma.exercise.findUnique({
      where: { id: input.exerciseId },
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
      console.error(
        "[toggleExerciseCompletion] Exercise not found:",
        input.exerciseId
      );
      return { success: false, error: "Exercise not found" };
    }

    // Check if user has permission to mark complete (must be team member)
    const permissions = getTrainingPermissions(
      exercise.session.week.plan.team as any,
      userId
    );
    if (!permissions.canMarkComplete) {
      console.error("[toggleExerciseCompletion] Insufficient permissions");
      return {
        success: false,
        error: "You must be a team member to track exercise completion",
      };
    }

    // Check if completion record exists
    const existingCompletion = await prisma.exerciseCompletion.findUnique({
      where: {
        exerciseId_athleteId: {
          exerciseId: input.exerciseId,
          athleteId: input.athleteId,
        },
      },
    });

    let completion;

    if (existingCompletion) {
      // Update existing completion
      completion = await prisma.exerciseCompletion.update({
        where: {
          id: existingCompletion.id,
        },
        data: {
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
          notes: input.notes,
          difficulty: input.difficulty,
        },
      });
    } else {
      // Create new completion
      completion = await prisma.exerciseCompletion.create({
        data: {
          exerciseId: input.exerciseId,
          athleteId: input.athleteId,
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
          notes: input.notes,
          difficulty: input.difficulty,
        },
      });
    }

    console.log(
      "[toggleExerciseCompletion] Success - completed:",
      completion.completed
    );

    // Revalidate team page
    revalidatePath(`/teams/${exercise.session.week.plan.teamId}`);

    return { success: true, completed: completion.completed };
  } catch (error) {
    console.error("[toggleExerciseCompletion] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update exercise completion",
    };
  }
}

// ============================================
// BATCH TOGGLE SESSION COMPLETION
// ============================================

export async function batchToggleSessionCompletion(
  sessionId: string,
  athleteId: string,
  completed: boolean
): Promise<{ success: boolean; completedCount?: number; error?: string }> {
  try {
    console.log(
      "[batchToggleSessionCompletion] Starting for session:",
      sessionId
    );

    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.error("[batchToggleSessionCompletion] Unauthorized - no userId");
      return { success: false, error: "Unauthorized" };
    }

    // User can only mark their own exercises complete
    if (athleteId !== userId) {
      console.error(
        "[batchToggleSessionCompletion] User trying to mark another user's exercises"
      );
      return {
        success: false,
        error: "You can only mark your own exercises as complete",
      };
    }

    // Fetch session with team
    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        exercises: true,
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
      console.error(
        "[batchToggleSessionCompletion] Session not found:",
        sessionId
      );
      return { success: false, error: "Training session not found" };
    }

    // Check permissions
    const permissions = getTrainingPermissions(
      session.week.plan.team as any,
      userId
    );
    if (!permissions.canMarkComplete) {
      console.error("[batchToggleSessionCompletion] Insufficient permissions");
      return {
        success: false,
        error: "You must be a team member to track exercise completion",
      };
    }

    // Batch upsert all exercise completions
    const completionPromises = session.exercises.map((exercise) =>
      prisma.exerciseCompletion.upsert({
        where: {
          exerciseId_athleteId: {
            exerciseId: exercise.id,
            athleteId,
          },
        },
        create: {
          exerciseId: exercise.id,
          athleteId,
          completed,
          completedAt: completed ? new Date() : null,
        },
        update: {
          completed,
          completedAt: completed ? new Date() : null,
        },
      })
    );

    await Promise.all(completionPromises);

    console.log(
      "[batchToggleSessionCompletion] Success - updated",
      session.exercises.length,
      "exercises"
    );

    // Revalidate team page
    revalidatePath(`/teams/${session.week.plan.teamId}`);

    return { success: true, completedCount: session.exercises.length };
  } catch (error) {
    console.error("[batchToggleSessionCompletion] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update session completion",
    };
  }
}

// ============================================
// GET ATHLETE COMPLETION STATS
// ============================================

export async function getAthleteCompletionStats(
  planId: string,
  athleteId: string
): Promise<{
  success: boolean;
  data?: {
    totalExercises: number;
    completedExercises: number;
    completionPercentage: number;
    weeklyStats: Array<{
      weekNumber: number;
      totalExercises: number;
      completedExercises: number;
      completionPercentage: number;
    }>;
  };
  error?: string;
}> {
  try {
    console.log(
      "[getAthleteCompletionStats] Fetching for plan:",
      planId,
      "athlete:",
      athleteId
    );

    // Fetch plan with all exercises and completions
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: {
        weeks: {
          include: {
            sessions: {
              include: {
                exercises: {
                  include: {
                    completions: {
                      where: {
                        athleteId,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            weekNumber: "asc",
          },
        },
      },
    });

    if (!plan) {
      console.error("[getAthleteCompletionStats] Plan not found:", planId);
      return { success: false, error: "Training plan not found" };
    }

    // Calculate overall stats
    let totalExercises = 0;
    let completedExercises = 0;

    const weeklyStats = plan.weeks.map((week) => {
      let weekTotal = 0;
      let weekCompleted = 0;

      week.sessions.forEach((session) => {
        session.exercises.forEach((exercise) => {
          weekTotal++;
          totalExercises++;

          const completion = exercise.completions.find(
            (c) => c.athleteId === athleteId && c.completed
          );

          if (completion) {
            weekCompleted++;
            completedExercises++;
          }
        });
      });

      return {
        weekNumber: week.weekNumber,
        totalExercises: weekTotal,
        completedExercises: weekCompleted,
        completionPercentage:
          weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0,
      };
    });

    const completionPercentage =
      totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100)
        : 0;

    console.log("[getAthleteCompletionStats] Success:", {
      totalExercises,
      completedExercises,
      completionPercentage,
    });

    return {
      success: true,
      data: {
        totalExercises,
        completedExercises,
        completionPercentage,
        weeklyStats,
      },
    };
  } catch (error) {
    console.error("[getAthleteCompletionStats] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch completion stats",
    };
  }
}

// ============================================
// GET TEAM COMPLETION STATS
// ============================================

export async function getTeamCompletionStats(planId: string): Promise<{
  success: boolean;
  data?: {
    teamAverageCompletion: number;
    athleteStats: Array<{
      athleteId: string;
      athleteName: string;
      profileImage: string | null;
      completionPercentage: number;
      completedExercises: number;
      totalExercises: number;
    }>;
  };
  error?: string;
}> {
  try {
    console.log("[getTeamCompletionStats] Fetching for plan:", planId);

    // Fetch plan with team members and all completions
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: {
        team: {
          include: {
            members: {
              include: {
                athlete: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
        weeks: {
          include: {
            sessions: {
              include: {
                exercises: {
                  include: {
                    completions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      console.error("[getTeamCompletionStats] Plan not found:", planId);
      return { success: false, error: "Training plan not found" };
    }

    // Calculate total exercises
    let totalExercises = 0;
    plan.weeks.forEach((week) => {
      week.sessions.forEach((session) => {
        totalExercises += session.exercises.length;
      });
    });

    // Calculate stats for each athlete
    const athleteStats = plan.team.members.map((member) => {
      let completedExercises = 0;

      plan.weeks.forEach((week) => {
        week.sessions.forEach((session) => {
          session.exercises.forEach((exercise) => {
            const completion = exercise.completions.find(
              (c) => c.athleteId === member.athleteId && c.completed
            );
            if (completion) {
              completedExercises++;
            }
          });
        });
      });

      const completionPercentage =
        totalExercises > 0
          ? Math.round((completedExercises / totalExercises) * 100)
          : 0;

      const athleteName =
        member.athlete.firstName && member.athlete.lastName
          ? `${member.athlete.firstName} ${member.athlete.lastName}`
          : member.athlete.username || "Unknown";

      return {
        athleteId: member.athleteId,
        athleteName,
        profileImage: member.athlete.profileImage,
        completionPercentage,
        completedExercises,
        totalExercises,
      };
    });

    // Calculate team average
    const teamAverageCompletion =
      athleteStats.length > 0
        ? Math.round(
            athleteStats.reduce(
              (sum, stat) => sum + stat.completionPercentage,
              0
            ) / athleteStats.length
          )
        : 0;

    console.log(
      "[getTeamCompletionStats] Success - team average:",
      teamAverageCompletion
    );

    return {
      success: true,
      data: {
        teamAverageCompletion,
        athleteStats: athleteStats.sort(
          (a, b) => b.completionPercentage - a.completionPercentage
        ),
      },
    };
  } catch (error) {
    console.error("[getTeamCompletionStats] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch team completion stats",
    };
  }
}
