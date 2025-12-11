import { Prisma } from "@prisma/client";

// ============================================
// PRISMA INCLUDES (for fetching complete data)
// ============================================

export const trainingPlanInclude = {
  team: {
    select: {
      id: true,
      name: true,
      logoUrl: true,
      sport: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      profileImage: true,
    },
  },
  weeks: {
    include: {
      sessions: {
        include: {
          exercises: {
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
        orderBy: {
          dayOfWeek: "asc",
        },
      },
    },
    orderBy: {
      weekNumber: "asc",
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
    take: 10, // Latest 10 footage items
  },
} satisfies Prisma.TrainingPlanInclude;

export const trainingFootageInclude = {
  team: {
    select: {
      id: true,
      name: true,
      logoUrl: true,
      ownerId: true,
    },
  },
  uploadedBy: {
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      profileImage: true,
    },
  },
  session: {
    select: {
      id: true,
      title: true,
      dayOfWeek: true,
      timeOfDay: true,
    },
  },
  plan: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.TrainingFootageInclude;

// ============================================
// TYPE EXPORTS (with relations)
// ============================================

export type TrainingPlanWithRelations = Prisma.TrainingPlanGetPayload<{
  include: typeof trainingPlanInclude;
}>;

export type TrainingWeekWithRelations = Prisma.TrainingWeekGetPayload<{
  include: {
    sessions: {
      include: {
        exercises: {
          include: {
            completions: true;
          };
        };
        footage: {
          include: {
            uploadedBy: {
              select: {
                id: true;
                username: true;
                firstName: true;
                lastName: true;
                profileImage: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type TrainingSessionWithRelations = Prisma.TrainingSessionGetPayload<{
  include: {
    exercises: {
      include: {
        completions: true;
      };
    };
    footage: {
      include: {
        uploadedBy: {
          select: {
            id: true;
            username: true;
            firstName: true;
            lastName: true;
            profileImage: true;
          };
        };
      };
    };
  };
}>;

export type ExerciseWithCompletions = Prisma.ExerciseGetPayload<{
  include: {
    completions: true;
  };
}>;

export type TrainingFootageWithRelations = Prisma.TrainingFootageGetPayload<{
  include: typeof trainingFootageInclude;
}>;

// ============================================
// FORM DATA TYPES (for creating/updating)
// ============================================

export interface CreateTrainingPlanInput {
  teamId: string;
  name: string;
  description?: string;
  goal?: string;
  totalWeeks: number;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateTrainingWeekInput {
  planId: string;
  weekNumber: number;
  title?: string;
  notes?: string;
}

export interface CreateTrainingSessionInput {
  weekId: string;
  dayOfWeek: number;
  timeOfDay: "EARLY_MORNING" | "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  title: string;
  description?: string;
  durationMinutes?: number;
  location?: string;
  equipment?: string[];
}

export interface CreateExerciseInput {
  sessionId: string;
  orderIndex: number;
  name: string;
  category?:
    | "STRENGTH"
    | "POWER"
    | "CARDIO"
    | "FLEXIBILITY"
    | "SKILLS"
    | "RECOVERY"
    | "WARM_UP"
    | "COOL_DOWN";
  sets?: number;
  reps?: number;
  duration?: number;
  restPeriod?: number;
  tempo?: string;
  weight?: string;
  intensity?:
    | "VERY_LOW"
    | "LOW"
    | "MODERATE"
    | "HIGH"
    | "VERY_HIGH"
    | "MAX_EFFORT";
  notes?: string;
  videoUrl?: string;
}

export interface CreateTrainingFootageInput {
  teamId: string;
  planId?: string;
  sessionId?: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  recordedDate: Date;
}

export interface ToggleExerciseCompletionInput {
  exerciseId: string;
  athleteId: string;
  completed: boolean;
  notes?: string;
  difficulty?: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface TrainingStats {
  totalExercises: number;
  completedExercises: number;
  completionPercentage: number;
  totalSessions: number;
  totalFootage: number;
}

export interface WeeklyOverview {
  weekNumber: number;
  title?: string;
  totalSessions: number;
  completionRate: number;
  sessions: TrainingSessionWithRelations[];
}

// ============================================
// HELPER TYPES
// ============================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const TIME_OF_DAY_LABELS: any = {
  EARLY_MORNING: "Early Morning (5am-8am)",
  MORNING: "Morning (8am-12pm)",
  AFTERNOON: "Afternoon (12pm-5pm)",
  EVENING: "Evening (5pm-9pm)",
  NIGHT: "Night (9pm+)",
};

export const INTENSITY_LABELS = {
  VERY_LOW: "Very Low",
  LOW: "Low",
  MODERATE: "Moderate",
  HIGH: "High",
  VERY_HIGH: "Very High",
  MAX_EFFORT: "Max Effort",
} as const;

export const EXERCISE_CATEGORY_LABELS = {
  STRENGTH: "Strength",
  POWER: "Power",
  CARDIO: "Cardio",
  FLEXIBILITY: "Flexibility",
  SKILLS: "Skills",
  RECOVERY: "Recovery",
  WARM_UP: "Warm Up",
  COOL_DOWN: "Cool Down",
} as const;
