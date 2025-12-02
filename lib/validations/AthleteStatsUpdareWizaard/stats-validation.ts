import { z } from "zod";

// ============================================
// BASIC MEASUREMENTS VALIDATION
// ============================================
export const basicMeasurementsSchema = z.object({
  height: z
    .number()
    .min(100, "Height must be at least 100cm")
    .max(250, "Height must be less than 250cm"),
  weight: z
    .number()
    .min(30, "Weight must be at least 30kg")
    .max(300, "Weight must be less than 300kg"),
  age: z
    .number()
    .int()
    .min(5, "Age must be at least 5 years")
    .max(100, "Age must be less than 100 years"),
  bodyFat: z
    .number()
    .min(3, "Body fat must be at least 3%")
    .max(50, "Body fat must be less than 50%"),
  bodyMassIndex: z.number().min(10).max(50),
  measuredAt: z.string().datetime(),
  measuredBy: z.string(),
});

// ============================================
// JUMP ATTEMPT VALIDATION
// ============================================
export const jumpAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  standingReach: z.number().positive().optional(),
  jumpReach: z.number().positive().optional(),
  flightTime: z.number().positive().optional(),
  groundContactTime: z.number().positive().optional(),
  load: z.number().min(0),
  notes: z.string().optional(),
});

// ============================================
// STRENGTH & POWER TEST VALIDATIONS
// ============================================
export const countermovementJumpSchema = z.object({
  attempts: z.array(jumpAttemptSchema).min(1, "At least one attempt required"),
  bestAttempt: z.object({
    attemptNumber: z.number().int().positive(),
    jumpHeight: z.number().positive(),
    peakPower: z.number().positive(),
    relativePeakPower: z.number().positive(),
    peakVelocity: z.number().positive(),
  }),
  testDate: z.string(),
});

export const pushUpTestSchema = z.object({
  bodyweightReps: z.number().int().min(0),
  weightedReps: z.number().int().min(0).optional(),
  load: z.number().min(0).optional(),
  testDate: z.string(),
});

export const plankHoldSchema = z.object({
  bodyweight: z.object({
    duration: z.number().positive(),
    notes: z.string().optional(),
  }),
  weighted: z
    .object({
      load: z.number().positive(),
      duration: z.number().positive(),
      notes: z.string().optional(),
    })
    .optional(),
  testDate: z.string(),
});

export const pullUpsTestSchema = z.object({
  repsCompleted: z.number().int().min(0),
  testDate: z.string(),
});

// ============================================
// STRENGTH & POWER SCORES VALIDATION
// ============================================
export const strengthScoresSchema = z.object({
  muscleMass: z.number().min(0).max(100),
  enduranceStrength: z.number().min(0).max(100),
  explosivePower: z.number().min(0).max(100),
});

export const strengthAndPowerSchema = z.object({
  Countermovement_Jump: countermovementJumpSchema.optional(),
  Loaded_Squat_Jump: z.any().optional(), // Flexible for now
  Depth_Jump: z.any().optional(),
  Ballistic_Bench_Press: z.any().optional(),
  Push_Up: pushUpTestSchema.optional(),
  Ballistic_Push_Up: z.any().optional(),
  Deadlift_Velocity: z.any().optional(),
  Barbell_Hip_Thrust: z.any().optional(),
  Weighted_Pull_up: z.any().optional(),
  Barbell_Row: z.any().optional(),
  Plank_Hold: plankHoldSchema.optional(),
  pullUps: pullUpsTestSchema.optional(),
  Pushups: z.number().int().min(0).optional(),
  scores: strengthScoresSchema,
});

// ============================================
// SPEED & AGILITY VALIDATIONS
// ============================================
export const speedScoresSchema = z.object({
  sprintSpeed: z.number().min(0).max(100),
  acceleration: z.number().min(0).max(100),
  agility: z.number().min(0).max(100),
  reactionTime: z.number().min(0).max(100),
});

export const speedAndAgilitySchema = z.object({
  Ten_Meter_Sprint: z.any().optional(),
  Fourty_Meter_Dash: z.any().optional(),
  Repeated_Sprint_Ability: z.any().optional(),
  Five_0_Five_Agility_Test: z.any().optional(),
  T_Test: z.any().optional(),
  Illinois_Agility_Test: z.any().optional(),
  Visual_Reaction_Speed_Drill: z.any().optional(),
  Long_Jump: z.any().optional(),
  Reactive_Agility_T_Test: z.any().optional(),
  Standing_Long_Jump: z.any().optional(),
  scores: speedScoresSchema,
});

// ============================================
// STAMINA & RECOVERY VALIDATIONS
// ============================================
export const staminaScoresSchema = z.object({
  cardiovascularFitness: z.number().min(0).max(100),
  recoveryEfficiency: z.number().min(0).max(100),
  overallFlexibility: z.number().min(0).max(100),
  vo2MaxScore: z.number().min(0).max(100),
});

export const staminaAndRecoverySchema = z.object({
  Beep_Test: z.any().optional(),
  Yo_Yo_Test: z.any().optional(),
  Cooper_Test: z.any().optional(),
  Peak_Heart_Rate: z.any().optional(),
  Resting_Heart_Rate: z.any().optional(),
  Resting_Heart_Rate_Variability: z.any().optional(),
  Lactate_Threshold: z.any().optional(),
  Anaerobic_Capacity: z.any().optional(),
  Post_Exercise_Heart_Rate_Recovery: z.any().optional(),
  Sit_and_Reach_Test: z.any().optional(),
  Active_Straight_Leg_Raise: z.any().optional(),
  Shoulder_External_Internal_Rotation: z.any().optional(),
  Knee_to_Wall_Test: z.any().optional(),
  vo2Max: z.any().optional(),
  flexibility: z.any().optional(),
  anthropometricData: z.any().optional(),
  scores: staminaScoresSchema,
});

// ============================================
// INJURY RECORD VALIDATION
// ============================================
export const injuryRecordSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Injury type is required"),
  bodyPart: z.string().min(1, "Body part is required"),
  severity: z.enum(["minor", "moderate", "severe", "critical"]),
  occurredAt: z.string().datetime(),
  currentStatus: z.enum(["active", "recovering", "recovered"]),
  expectedRecoveryDate: z.string().datetime().optional(),
  recoveredAt: z.string().datetime().optional(),
  recoveryTime: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  treatmentPlan: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ============================================
// COMPLETE PAYLOAD VALIDATION
// ============================================
export const completeStatsPayloadSchema = z.object({
  athleteId: z.string().min(1, "Athlete ID is required"),
  guideId: z.string().min(1, "Guide ID is required"),
  evaluationDate: z.string().datetime(),

  // Basic measurements - REQUIRED
  basicMeasurements: basicMeasurementsSchema,

  // Assessment sections - OPTIONAL
  strengthAndPower: strengthAndPowerSchema.optional(),
  speedAndAgility: speedAndAgilitySchema.optional(),
  staminaAndRecovery: staminaAndRecoverySchema.optional(),

  // Injuries - OPTIONAL
  injuries: z.array(injuryRecordSchema).default([]),

  // Metadata
  lastUpdatedBy: z.string(),
  lastUpdatedByName: z.string(),
  submittedAt: z.string().datetime().optional(),
});

// ============================================
// SUBMISSION INPUT VALIDATION
// ============================================
export const submitStatsInputSchema = z.object({
  athleteClerkUserId: z.string().min(1, "Athlete Clerk User ID is required"),
  guideId: z.string(),
  requestId: z.string().min(1, "Request ID is required"),
  payload: z.any(), // Will validate separately for better error messages
});

// Type exports
export type ValidatedStatsPayload = z.infer<typeof completeStatsPayloadSchema>;
export type ValidatedSubmitInput = z.infer<typeof submitStatsInputSchema>;
