// ============================================
// CORE MEASUREMENT TYPES
// ============================================

/**
 * Basic physical measurements - Foundation for all calculations
 */
export type BasicPhysicalMeasurements = {
  height: number; // cm
  weight: number; // kg
  age: number; // years
  bodyFat: number; // percentage
  bodyMassIndex: number; // calculated: weight / (height/100)^2
  measuredAt: string; // ISO timestamp
  measuredBy: string; // guide ID
};

// ============================================
// STRENGTH & POWER TESTS
// ============================================

/**
 * Individual attempt for any jump test
 */
export type JumpAttempt = {
  attemptNumber: number;
  standingReach?: number; // cm
  jumpReach?: number; // cm
  flightTime?: number; // seconds
  groundContactTime?: number; // seconds (for depth jumps)
  load: number; // kg (0 = bodyweight)
  notes?: string;
};

/**
 * Countermovement Jump Test
 * Formula: Peak Power (W) = 60.7 × jump height (cm) + 45.3 × body mass (kg) - 2055
 * Source: Sayers et al. (1999) - Cross-validation study
 */
export type CountermovementJumpTest = {
  attempts: JumpAttempt[];
  bestAttempt: {
    attemptNumber: number;
    jumpHeight: number; // cm - calculated from flight time or reach difference
    peakPower: number; // watts
    relativePeakPower: number; // W/kg
    peakVelocity: number; // m/s - calculated from takeoff velocity
  };
  testDate: string;
};

/**
 * Loaded Squat Jump Test
 * Multiple loads tested to find optimal power output
 */
export type LoadedSquatJumpTest = {
  attempts: JumpAttempt[];
  bestAttempt: {
    attemptNumber: number;
    load: number; // kg
    jumpHeight: number; // cm
    peakPower: number; // watts
    relativePeakPower: number; // W/kg
    optimalLoad: number; // kg - load at which peak power was highest
  };
  testDate: string;
};

/**
 * Depth Jump Test - Measures reactive strength
 * RSI Formula: Jump Height (cm) / Ground Contact Time (s)
 * Source: GymAware, Hawkin Dynamics
 */
export type DepthJumpTest = {
  boxHeight: number; // cm
  attempts: JumpAttempt[];
  bestAttempt: {
    attemptNumber: number;
    jumpHeight: number; // cm
    groundContactTime: number; // seconds
    reactiveStrengthIndex: number; // RSI = jumpHeight / groundContactTime
    peakPower: number; // watts
  };
  testDate: string;
};

/**
 * Ballistic Bench Press - Upper body power
 * Power = (mass × gravity × displacement) / time
 * Formula: PO = m × 9.81 × Δh / Δt
 */
export type BallisticBenchPressTest = {
  attempts: Array<{
    attemptNumber: number;
    load: number; // kg
    barVelocity: number; // m/s
    displacement: number; // meters
    executionTime: number; // seconds
    peakPower: number; // watts - calculated
    notes?: string;
  }>;
  bestAttempt: {
    attemptNumber: number;
    load: number;
    peakPower: number;
    relativePeakPower: number; // W/kg
  };
  testDate: string;
};

/**
 * Ballistic Push-Up Test
 * Measures: Reps completed, power index, rate
 */
export type BallisticPushUpTest = {
  bodyweight: {
    repsCompleted: number;
    totalTime: number; // seconds
    avgSecondsPerRep: number; // calculated: totalTime / repsCompleted
    repsPerMinute: number; // calculated: (repsCompleted / totalTime) * 60
    powerIndex: number; // calculated: (repsCompleted × bodyWeight) / totalTime
  };
  weighted: {
    load: number; // kg
    repsCompleted: number;
    totalTime: number;
    avgSecondsPerRep: number;
    repsPerMinute: number;
    powerIndex: number;
  };
  testDate: string;
};

/**
 * Standard Push-Up Test (endurance)
 */
export type PushUpTest = {
  bodyweightReps: number;
  weightedReps?: number;
  load?: number; // kg (if weighted)
  testDate: string;
};

/**
 * Deadlift Velocity Test - Lower body strength
 */
export type DeadliftVelocityTest = {
  attempts: Array<{
    attemptNumber: number;
    load: number; // kg
    peakVelocity: number; // m/s
    averageVelocity: number; // m/s
    peakForce: number; // newtons
    peakPower: number; // watts
    notes?: string;
  }>;
  oneRepMax: number; // kg - estimated from velocity
  testDate: string;
};

/**
 * Barbell Hip Thrust Test
 */
export type BarbellHipThrustTest = {
  attempts: Array<{
    attemptNumber: number;
    load: number; // kg
    repsCompleted: number;
    avgVelocity: number; // m/s
    peakPower: number; // watts
    notes?: string;
  }>;
  oneRepMax: number; // kg - estimated
  testDate: string;
};

/**
 * Weighted Pull-Up Test - Upper body strength
 */
export type WeightedPullUpTest = {
  bodyweight: {
    repsCompleted: number;
    notes?: string;
  };
  weighted: Array<{
    load: number; // kg
    repsCompleted: number;
    notes?: string;
  }>;
  estimatedOneRepMax: number; // kg
  testDate: string;
};

/**
 * Barbell Row Test
 */
export type BarbellRowTest = {
  attempts: Array<{
    attemptNumber: number;
    load: number; // kg
    repsCompleted: number;
    avgVelocity: number; // m/s
    notes?: string;
  }>;
  oneRepMax: number; // kg
  testDate: string;
};

/**
 * Plank Hold Test - Core endurance
 */
export type PlankHoldTest = {
  bodyweight: {
    duration: number; // seconds
    notes?: string;
  };
  weighted?: {
    load: number; // kg
    duration: number; // seconds
    notes?: string;
  };
  testDate: string;
};

/**
 * Pull-Ups Test - Bodyweight strength endurance
 */
export type PullUpsTest = {
  repsCompleted: number;
  testDate: string;
};

// ============================================
// SPEED & AGILITY TESTS
// ============================================

/**
 * Sprint Test - Generic sprint measurement
 */
export type SprintTest = {
  distance: number; // meters
  attempts: Array<{
    attemptNumber: number;
    time: number; // seconds
    splitTimes?: Record<string, number>; // e.g., {"10m": 1.8, "20m": 3.2}
  }>;
  bestTime: number; // seconds
  averageVelocity: number; // m/s - calculated: distance / bestTime
  peakVelocity?: number; // m/s - if split times available
  acceleration?: number; // m/s² - calculated from split times
  testDate: string;
};

/**
 * 10 Meter Sprint Test
 */
export type TenMeterSprintTest = SprintTest;

/**
 * 40 Meter Dash Test
 */
export type FourtyMeterDashTest = Omit<SprintTest, "splitTimes"> & {
  splitTimes: {
    "10m": number;
    "20m": number;
    "30m": number;
    "40m": number;
  };
};

/**
 * Repeated Sprint Ability Test
 */
export type RepeatedSprintAbilityTest = {
  sprintDistance: number; // meters (usually 30-40m)
  numberOfSprints: number; // usually 6-10
  restBetweenSprints: number; // seconds
  sprintTimes: number[]; // array of times for each sprint
  bestTime: number; // seconds
  averageTime: number; // seconds
  fatigueIndex: number; // % - calculated: ((averageTime - bestTime) / bestTime) × 100
  testDate: string;
};

/**
 * 505 Agility Test - Change of direction
 */
export type Five05AgilityTest = {
  attempts: Array<{
    attemptNumber: number;
    time: number; // seconds
    notes?: string;
  }>;
  bestTime: number; // seconds
  testDate: string;
};

/**
 * T-Test Agility
 * Norms: Excellent <9.5s (M), <10.5s (F); Good 9.5-10.5s (M), 10.5-11.5s (F)
 */
export type TTestAgility = {
  attempts: Array<{
    attemptNumber: number;
    time: number; // seconds
    notes?: string;
  }>;
  bestTime: number; // seconds
  rating: "excellent" | "good" | "average" | "below_average" | "poor";
  testDate: string;
};

/**
 * Illinois Agility Test
 * Norms: Excellent <15.2s (M), <17.0s (F); Average 16.2-18.1s (M), 18.0-21.7s (F)
 */
export type IllinoisAgilityTest = {
  attempts: Array<{
    attemptNumber: number;
    time: number; // seconds
    notes?: string;
  }>;
  bestTime: number; // seconds
  rating: "excellent" | "above_average" | "average" | "below_average" | "poor";
  testDate: string;
};

/**
 * Visual Reaction Speed Drill
 */
export type VisualReactionSpeedDrill = {
  attempts: Array<{
    attemptNumber: number;
    reactionTime: number; // milliseconds
    accuracy: number; // percentage
  }>;
  averageReactionTime: number; // ms
  bestReactionTime: number; // ms
  testDate: string;
};

/**
 * Long Jump Test
 */
export type LongJumpTest = {
  attempts: Array<{
    attemptNumber: number;
    distance: number; // meters
    notes?: string;
  }>;
  bestDistance: number; // meters
  testDate: string;
};

/**
 * Reactive Agility T-Test
 */
export type ReactiveAgilityTTest = TTestAgility;

/**
 * Standing Long Jump
 */
export type StandingLongJumpTest = LongJumpTest;

// ============================================
// STAMINA & RECOVERY TESTS
// ============================================

/**
 * Beep Test (Multi-Stage Fitness Test)
 * VO2max Formula: VO2max = 3.46 × (Level + Shuttles/(Level × 0.4325 + 7.0048)) + 12.2
 * Source: Ramsbottom et al. (1988)
 */
export type BeepTest = {
  levelReached: number;
  shuttlesCompleted: number;
  vo2Max: number; // ml/kg/min - calculated using Ramsbottom formula
  fitnessRating:
    | "very_poor"
    | "poor"
    | "fair"
    | "good"
    | "excellent"
    | "superior";
  testDate: string;
};

/**
 * Yo-Yo Test (Intermittent Recovery Test)
 */
export type YoYoTest = {
  levelReached: number;
  distanceCovered: number; // meters
  vo2Max: number; // ml/kg/min
  testDate: string;
};

/**
 * Cooper Test (12-minute run)
 * VO2max Formula: VO2max (ml/kg/min) = (22.351 × distance in km) - 11.288
 * Alternative: VO2max = (distance - 504.9) / 44.73
 */
export type CooperTest = {
  distanceCovered: number; // meters
  vo2Max: number; // ml/kg/min - calculated
  fitnessRating:
    | "very_poor"
    | "poor"
    | "fair"
    | "good"
    | "excellent"
    | "superior";
  testDate: string;
};

/**
 * Heart Rate Measurements
 */
export type PeakHeartRate = {
  value: number; // bpm
  recordedDuring: string; // e.g., "sprint test", "beep test"
  testDate: string;
};

export type RestingHeartRate = {
  value: number; // bpm
  measuredAt: string; // time of day
  testDate: string;
};

export type RestingHeartRateVariability = {
  rmssd: number; // ms - Root Mean Square of Successive Differences
  sdnn: number; // ms - Standard Deviation of NN intervals
  testDate: string;
};

/**
 * Lactate Threshold Test
 */
export type LactateThreshold = {
  speedAtThreshold: number; // km/h or m/s
  heartRateAtThreshold: number; // bpm
  lactateLevel: number; // mmol/L
  testDate: string;
};

/**
 * Anaerobic Capacity Test
 */
export type AnaerobicCapacity = {
  testType: string; // e.g., "Wingate test", "RAST"
  peakPower: number; // watts
  meanPower: number; // watts
  fatigueIndex: number; // percentage
  testDate: string;
};

/**
 * Post-Exercise Heart Rate Recovery
 * Good recovery: HR drops 12+ bpm in first minute
 */
export type PostExerciseHeartRateRecovery = {
  peakHeartRate: number; // bpm
  heartRateAt1Min: number; // bpm
  heartRateAt2Min: number; // bpm
  recoveryScore: number; // calculated: peakHR - HR at 1min
  testDate: string;
};

/**
 * Sit and Reach Test - Hamstring/lower back flexibility
 * Score: Distance reached (cm) - positive if past toes, negative if before
 */
export type SitAndReachTest = {
  attempts: Array<{
    attemptNumber: number;
    distance: number; // cm from toe line (+ = past toes, - = before toes)
  }>;
  bestDistance: number; // cm
  rating: "excellent" | "good" | "average" | "fair" | "poor";
  testDate: string;
};

/**
 * Active Straight Leg Raise - Hip flexibility
 */
export type ActiveStraightLegRaise = {
  leftLeg: {
    angle: number; // degrees from horizontal
    rating: "excellent" | "good" | "average" | "poor";
  };
  rightLeg: {
    angle: number; // degrees from horizontal
    rating: "excellent" | "good" | "average" | "poor";
  };
  asymmetry: number; // degrees difference between legs
  testDate: string;
};

/**
 * Shoulder External/Internal Rotation - Shoulder mobility
 */
export type ShoulderRotation = {
  leftShoulder: {
    externalRotation: number; // degrees
    internalRotation: number; // degrees
  };
  rightShoulder: {
    externalRotation: number; // degrees
    internalRotation: number; // degrees
  };
  testDate: string;
};

/**
 * Knee to Wall Test - Ankle dorsiflexion
 */
export type KneeToWallTest = {
  leftAnkle: {
    distance: number; // cm from wall
    rating: "excellent" | "good" | "average" | "poor";
  };
  rightAnkle: {
    distance: number; // cm from wall
    rating: "excellent" | "good" | "average" | "poor";
  };
  testDate: string;
};

/**
 * VO2 Max Measurement
 */
export type VO2Max = {
  value: number; // ml/kg/min
  testMethod:
    | "beep_test"
    | "cooper_test"
    | "yo_yo_test"
    | "lab_test"
    | "estimated";
  fitnessRating:
    | "very_poor"
    | "poor"
    | "fair"
    | "good"
    | "excellent"
    | "superior";
  testDate: string;
};

/**
 * Flexibility Assessment - Overall
 */
export type FlexibilityAssessment = {
  sitAndReach?: SitAndReachTest;
  activeStraightLegRaise?: ActiveStraightLegRaise;
  shoulderRotation?: ShoulderRotation;
  kneeToWall?: KneeToWallTest;
  overallFlexibilityScore: number; // 0-100 calculated from all tests
};

/**
 * Anthropometric Data - Body measurements
 */
export type AnthropometricData = {
  chest: number; // cm
  waist: number; // cm
  hips: number; // cm
  thigh: number; // cm
  calf: number; // cm
  bicep: number; // cm
  forearm: number; // cm
  neck: number; // cm
  shoulders: number; // cm - shoulder width
  testDate: string;
};

// ============================================
// INJURY TRACKING
// ============================================

export type InjuryRecord = {
  id: string;
  type: string; // e.g., "Sprain", "Strain", "Fracture", "Tear"
  bodyPart: string; // e.g., "Ankle", "Knee", "Shoulder"
  severity: "minor" | "moderate" | "severe" | "critical";
  occurredAt: string; // ISO date
  currentStatus: "active" | "recovering" | "recovered";
  expectedRecoveryDate?: string; // ISO date (if status = active)
  recoveredAt?: string; // ISO date (if status = recovered)
  recoveryTime?: number; // days
  notes?: string;
  treatmentPlan?: string;
  createdAt: string;
  updatedAt: string;
};

// ============================================
// AGGREGATE SCORES (0-100 scale)
// ============================================

export type StrengthAndPowerScores = {
  muscleMass: number; // 0-100
  enduranceStrength: number; // 0-100
  explosivePower: number; // 0-100
};

export type SpeedAndAgilityScores = {
  sprintSpeed: number; // 0-100
  acceleration: number; // 0-100
  agility: number; // 0-100
  reactionTime: number; // 0-100
};

export type StaminaAndRecoveryScores = {
  cardiovascularFitness: number; // 0-100
  recoveryEfficiency: number; // 0-100
  overallFlexibility: number; // 0-100
  vo2MaxScore: number; // 0-100
};

// ============================================
// COMPLETE STATS PAYLOAD
// ============================================

export type CompleteStatsPayload = {
  athleteId: string;
  guideId: string;
  evaluationDate: string;

  // Basic measurements
  basicMeasurements: BasicPhysicalMeasurements;

  // Strength & Power
  strengthAndPower: {
    Countermovement_Jump?: CountermovementJumpTest;
    Loaded_Squat_Jump?: LoadedSquatJumpTest;
    Depth_Jump?: DepthJumpTest;
    Ballistic_Bench_Press?: BallisticBenchPressTest;
    Push_Up?: PushUpTest;
    Ballistic_Push_Up?: BallisticPushUpTest;
    Deadlift_Velocity?: DeadliftVelocityTest;
    Barbell_Hip_Thrust?: BarbellHipThrustTest;
    Weighted_Pull_up?: WeightedPullUpTest;
    Barbell_Row?: BarbellRowTest;
    Plank_Hold?: PlankHoldTest;
    pullUps?: PullUpsTest;
    Pushups?: number; // legacy field
    scores: StrengthAndPowerScores;
  };

  // Speed & Agility
  speedAndAgility: {
    Ten_Meter_Sprint?: TenMeterSprintTest;
    Fourty_Meter_Dash?: FourtyMeterDashTest;
    Repeated_Sprint_Ability?: RepeatedSprintAbilityTest;
    Five_0_Five_Agility_Test?: Five05AgilityTest;
    T_Test?: TTestAgility;
    Illinois_Agility_Test?: IllinoisAgilityTest;
    Visual_Reaction_Speed_Drill?: VisualReactionSpeedDrill;
    Long_Jump?: LongJumpTest;
    Reactive_Agility_T_Test?: ReactiveAgilityTTest;
    Standing_Long_Jump?: StandingLongJumpTest;
    scores: SpeedAndAgilityScores;
  };

  // Stamina & Recovery
  staminaAndRecovery: {
    Beep_Test?: BeepTest;
    Yo_Yo_Test?: YoYoTest;
    Cooper_Test?: CooperTest;
    Peak_Heart_Rate?: PeakHeartRate;
    Resting_Heart_Rate?: RestingHeartRate;
    Resting_Heart_Rate_Variability?: RestingHeartRateVariability;
    Lactate_Threshold?: LactateThreshold;
    Anaerobic_Capacity?: AnaerobicCapacity;
    Post_Exercise_Heart_Rate_Recovery?: PostExerciseHeartRateRecovery;
    Sit_and_Reach_Test?: SitAndReachTest;
    Active_Straight_Leg_Raise?: ActiveStraightLegRaise;
    Shoulder_External_Internal_Rotation?: ShoulderRotation;
    Knee_to_Wall_Test?: KneeToWallTest;
    vo2Max?: VO2Max;
    flexibility?: FlexibilityAssessment;
    anthropometricData?: AnthropometricData;
    scores: StaminaAndRecoveryScores;
  };

  // Injuries
  injuries: InjuryRecord[];

  // Metadata
  lastUpdatedBy: string; // guide ID
  lastUpdatedByName: string; // guide name
  submittedAt?: string; // ISO timestamp (only when finalized)
};
