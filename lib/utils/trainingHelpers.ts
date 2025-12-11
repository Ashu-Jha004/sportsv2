import {
  TrainingPlanWithRelations,
  TrainingWeekWithRelations,
  TrainingSessionWithRelations,
  ExerciseWithCompletions,
  TrainingStats,
  WeeklyOverview,
  DayOfWeek,
  DAY_NAMES,
} from "@/types/Training/types/training";

// ============================================
// YOUTUBE URL HELPERS
// ============================================

/**
 * Extracts YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 */
export function extractYouTubeId(url: string): string | null {
  try {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return match[2];
    }

    console.warn("[extractYouTubeId] Invalid YouTube URL:", url);
    return null;
  } catch (error) {
    console.error("[extractYouTubeId] Error parsing YouTube URL:", error);
    return null;
  }
}

/**
 * Generates YouTube embed URL from video ID or full URL
 */
export function getYouTubeEmbedUrl(urlOrId: string): string {
  try {
    const videoId = extractYouTubeId(urlOrId) || urlOrId;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    console.error("[getYouTubeEmbedUrl] Error generating embed URL:", error);
    return "";
  }
}

/**
 * Generates YouTube thumbnail URL
 */
export function getYouTubeThumbnail(
  urlOrId: string,
  quality: "default" | "hq" | "mq" | "sd" | "maxres" = "hq"
): string {
  try {
    const videoId = extractYouTubeId(urlOrId) || urlOrId;
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
  } catch (error) {
    console.error("[getYouTubeThumbnail] Error generating thumbnail:", error);
    return "";
  }
}

/**
 * Validates if URL is a valid YouTube link
 */
export function isValidYouTubeUrl(url: string): boolean {
  try {
    const videoId = extractYouTubeId(url);
    return videoId !== null && videoId.length === 11;
  } catch {
    return false;
  }
}

// ============================================
// TRAINING STATS CALCULATIONS
// ============================================

/**
 * Calculates training statistics for a plan
 */
export function calculateTrainingStats(
  plan: TrainingPlanWithRelations,
  athleteId?: string
): TrainingStats {
  try {
    let totalExercises = 0;
    let completedExercises = 0;
    let totalSessions = 0;

    plan.weeks.forEach((week) => {
      week.sessions.forEach((session) => {
        totalSessions++;
        session.exercises.forEach((exercise) => {
          totalExercises++;

          if (athleteId) {
            const completion = exercise.completions.find(
              (c) => c.athleteId === athleteId && c.completed
            );
            if (completion) {
              completedExercises++;
            }
          }
        });
      });
    });

    const completionPercentage =
      totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100)
        : 0;

    return {
      totalExercises,
      completedExercises,
      completionPercentage,
      totalSessions,
      totalFootage: plan.footage?.length || 0,
    };
  } catch (error) {
    console.error("[calculateTrainingStats] Error calculating stats:", error);
    return {
      totalExercises: 0,
      completedExercises: 0,
      completionPercentage: 0,
      totalSessions: 0,
      totalFootage: 0,
    };
  }
}

/**
 * Calculates completion rate for a specific session
 */
export function calculateSessionCompletion(
  session: TrainingSessionWithRelations,
  athleteId: string
): number {
  try {
    if (session.exercises.length === 0) return 0;

    const completedCount = session.exercises.filter((exercise) =>
      exercise.completions.some((c) => c.athleteId === athleteId && c.completed)
    ).length;

    return Math.round((completedCount / session.exercises.length) * 100);
  } catch (error) {
    console.error(
      "[calculateSessionCompletion] Error calculating completion:",
      error
    );
    return 0;
  }
}

/**
 * Calculates completion rate for a specific week
 */
export function calculateWeekCompletion(
  week: TrainingWeekWithRelations,
  athleteId: string
): number {
  try {
    let totalExercises = 0;
    let completedExercises = 0;

    week.sessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        totalExercises++;
        const completion = exercise.completions.find(
          (c) => c.athleteId === athleteId && c.completed
        );
        if (completion) {
          completedExercises++;
        }
      });
    });

    return totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;
  } catch (error) {
    console.error(
      "[calculateWeekCompletion] Error calculating completion:",
      error
    );
    return 0;
  }
}

/**
 * Gets weekly overview with completion stats
 */
export function getWeeklyOverview(
  plan: any,
  weekNumber: number,
  athleteId?: string
): WeeklyOverview | null {
  try {
    const week = plan.weeks.find((w: any) => w.weekNumber === weekNumber);
    if (!week) return null;

    const completionRate = athleteId
      ? calculateWeekCompletion(week, athleteId)
      : 0;

    return {
      weekNumber: week.weekNumber,
      title: week.title || undefined,
      totalSessions: week.sessions.length,
      completionRate,
      sessions: week.sessions,
    };
  } catch (error) {
    console.error("[getWeeklyOverview] Error getting overview:", error);
    return null;
  }
}

// ============================================
// SESSION HELPERS
// ============================================

/**
 * Gets sessions for a specific day of the week
 */
export function getSessionsByDay(
  week: TrainingWeekWithRelations,
  dayOfWeek: DayOfWeek
): TrainingSessionWithRelations[] {
  try {
    return week.sessions.filter((s) => s.dayOfWeek === dayOfWeek);
  } catch (error) {
    console.error("[getSessionsByDay] Error filtering sessions:", error);
    return [];
  }
}

/**
 * Groups sessions by day of week
 */
export function groupSessionsByDay(
  sessions: TrainingSessionWithRelations[]
): Record<DayOfWeek, TrainingSessionWithRelations[]> {
  try {
    const grouped: Record<number, TrainingSessionWithRelations[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    sessions.forEach((session) => {
      if (session.dayOfWeek >= 0 && session.dayOfWeek <= 6) {
        grouped[session.dayOfWeek].push(session);
      }
    });

    return grouped as Record<DayOfWeek, TrainingSessionWithRelations[]>;
  } catch (error) {
    console.error("[groupSessionsByDay] Error grouping sessions:", error);
    return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  }
}

/**
 * Calculates total session duration for a day
 */
export function calculateDayDuration(
  sessions: TrainingSessionWithRelations[]
): number {
  try {
    return sessions.reduce((total, session) => {
      return total + (session.durationMinutes || 0);
    }, 0);
  } catch (error) {
    console.error("[calculateDayDuration] Error calculating duration:", error);
    return 0;
  }
}

// ============================================
// DATE/TIME HELPERS
// ============================================

/**
 * Formats duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  try {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  } catch (error) {
    console.error("[formatDuration] Error formatting duration:", error);
    return "0min";
  }
}

/**
 * Gets day name from day number
 */
export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek as DayOfWeek] || "Unknown";
}

/**
 * Gets current day of week (0-6)
 */
export function getCurrentDay(): DayOfWeek {
  return new Date().getDay() as DayOfWeek;
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// ============================================
// EXERCISE HELPERS
// ============================================

/**
 * Formats exercise prescription (sets x reps @ weight)
 */
export function formatExercisePrescription(
  exercise: ExerciseWithCompletions
): string {
  try {
    const parts: string[] = [];

    if (exercise.sets && exercise.reps) {
      parts.push(`${exercise.sets} × ${exercise.reps}`);
    } else if (exercise.sets) {
      parts.push(`${exercise.sets} sets`);
    } else if (exercise.reps) {
      parts.push(`${exercise.reps} reps`);
    }

    if (exercise.duration) {
      parts.push(`${exercise.duration}s`);
    }

    if (exercise.weight) {
      parts.push(`@ ${exercise.weight}`);
    }

    return parts.length > 0 ? parts.join(" ") : "See notes";
  } catch (error) {
    console.error("[formatExercisePrescription] Error formatting:", error);
    return "";
  }
}

/**
 * Checks if an exercise is completed by an athlete
 */
export function isExerciseCompleted(
  exercise: ExerciseWithCompletions,
  athleteId: string
): boolean {
  try {
    return exercise.completions.some(
      (c) => c.athleteId === athleteId && c.completed
    );
  } catch (error) {
    console.error("[isExerciseCompleted] Error checking completion:", error);
    return false;
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates training plan data before submission
 */
export function validateTrainingPlanData(data: {
  name: string;
  totalWeeks: number;
  startDate?: Date;
  endDate?: Date;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Plan name is required");
  }

  if (data.name && data.name.length > 100) {
    errors.push("Plan name must be less than 100 characters");
  }

  if (!data.totalWeeks || data.totalWeeks < 1) {
    errors.push("Plan must have at least 1 week");
  }

  if (data.totalWeeks > 52) {
    errors.push("Plan cannot exceed 52 weeks");
  }

  if (data.startDate && data.endDate) {
    if (data.endDate <= data.startDate) {
      errors.push("End date must be after start date");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates YouTube URL
 */
export function validateYouTubeUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: "YouTube URL is required" };
  }

  if (!isValidYouTubeUrl(url)) {
    return { valid: false, error: "Invalid YouTube URL format" };
  }

  return { valid: true };
}
