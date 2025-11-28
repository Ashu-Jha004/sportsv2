// lib/utils/statsDataProcessor.ts
"use client";

/**
 * Global Stats Data Processor
 * Flattens, filters, and structures athlete stats data
 * Removes noise (IDs, nulls) and preserves all test details
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CleanedAthleteStats {
  profile: ProfileData;
  anthropometrics: AnthropometricData;
  aggregateScores: AggregateScores;
  tests: {
    strength: StrengthTestRecord[];
    speed: SpeedTestRecord[];
    stamina: StaminaTestRecord[];
  };
  injuries: InjuryRecord[];
  timeline: TestTimelineEntry[];
  recordedAt: string;
}

export interface ProfileData {
  athleteId: string;
  lastUpdated: {
    date: string;
    by: string | null;
    timestamp: string | null;
  };
}

export interface AnthropometricData {
  basic: {
    height: number;
    weight: number;
    age: number;
    bodyFat: number;
    bmi: number;
  };
  circumferences: {
    waist: number;
    neck: number;
    calf: number;
    biceps: number;
    thigh: number;
  };
  dimensions: {
    armSpan: number;
    legLength: number;
  };
}

export interface AggregateScores {
  strength: {
    muscleMass: number;
    enduranceStrength: number;
    explosivePower: number;
  };
  speed: {
    sprintSpeed?: number;
    acceleration?: number;
    agility?: number;
    reactionTime?: number;
  };
  stamina: {
    cardiovascularFitness?: number;
    recoveryEfficiency?: number;
    overallFlexibility?: number;
    vo2MaxScore?: number;
  };
}

export interface StrengthTestRecord {
  testDate: string;
  recordedAt: string;
  tests: {
    countermovementJump?: CountermovementJumpTest;
    loadedSquatJump?: LoadedSquatJumpTest;
    depthJump?: DepthJumpTest;
    ballisticBenchPress?: BallisticBenchPressTest;
    pushUp?: PushUpTest;
    ballisticPushUp?: BallisticPushUpTest;
    deadliftVelocity?: DeadliftVelocityTest;
    hipThrust?: HipThrustTest;
    weightedPullUp?: WeightedPullUpTest;
    barbellRow?: BarbellRowTest;
    plankHold?: PlankHoldTest;
  };
}

export interface SpeedTestRecord {
  testDate: string;
  recordedAt: string;
  tests: {
    tenMeterSprint?: TenMeterSprintTest;
    fourtyMeterDash?: FourtyMeterDashTest;
    repeatedSprintAbility?: any;
    illinoisAgility?: IllinoisAgilityTest;
    visualReaction?: VisualReactionTest;
    reactiveTTest?: ReactiveTTestTest;
    standingLongJump?: StandingLongJumpTest;
  };
}

export interface StaminaTestRecord {
  testDate: string;
  recordedAt: string;
  tests: {
    beepTest?: BeepTest;
    yoYoTest?: YoYoTest;
    cooperTest?: CooperTest;
    sitAndReach?: SitAndReachTest;
  };
}

export interface InjuryRecord {
  id: string;
  type: string;
  date: string;
  description: string;
  status: string;
}

export interface TestTimelineEntry {
  date: string;
  category: "strength" | "speed" | "stamina";
  testName: string;
  keyMetric: string;
  recordedAt: string;
}

// Detailed Test Types
export interface CountermovementJumpTest {
  attempts: Array<{
    attemptNumber: number;
    load: number;
    jumpReach: number;
    standingReach: number;
    flightTime: number;
    notes?: string;
  }>;
  bestAttempt: {
    attemptNumber: number;
    jumpHeight: number;
    peakPower: number;
    relativePeakPower: number;
    peakVelocity: number;
  };
  testDate: string;
  recordedAt: string;
}

export interface LoadedSquatJumpTest {
  raw: {
    bodyWeight: number;
    totalTimeUsed: number;
    sets: Array<{
      name: string;
      notes: string;
      reps: Array<{
        load: number;
        reps: number;
        restAfter: number;
      }>;
    }>;
    notes: string;
  };
  calculated: {
    overall: {
      totalSets: number;
      totalReps: number;
      totalVolumeLoad: number;
      avgLoad: number;
      maxLoad: number;
    };
    perSetMetrics: Array<{
      setIndex: number;
      totalReps: number;
      volumeLoad: number;
      avgLoad: number;
      maxLoad: number;
    }>;
  };
  meta: {
    recordedAt: string;
    formVersion: string;
  };
}

export interface DepthJumpTest {
  raw: {
    sets: Array<{
      name: string;
      dropHeightCm: number;
      notes: string;
      reps: Array<{
        jumpHeightCm: number;
        groundContactTimeSec: number;
      }>;
    }>;
    notes: string;
  };
  calculated: {
    overall: {
      totalReps: number;
      bestJump: number;
      bestRSI: number;
      avgRSI: number;
    };
    perSet: Array<{
      setIndex: number;
      dropHeight: number;
      repsCount: number;
      bestJump: number;
      bestRSI: number;
      avgRSI: number;
    }>;
  };
  meta: {
    recordedAt: string;
  };
}

export interface BallisticBenchPressTest {
  raw: {
    equipmentMode: string;
    notes: string;
    sets: Array<{
      load: number;
      reps: number;
      time: number;
      distance: number;
      restAfter: number;
      bodyWeight: number;
    }>;
  };
  calculated: {
    setsCount: number;
    bestSetIndex: number;
    equipmentMode: string;
    totalWork: number;
    totalImpulse: number;
    peakPower: number;
    meanPower: number;
    peakVelocity: number;
    avgVelocity: number;
    velocityLoadPoints: Array<{
      load: number;
      peakVelocity: number;
    }>;
  };
  meta: {
    recordedAt: string;
  };
}

export interface PushUpTest {
  raw: {
    repsBodyweight: number;
    repsWeighted: number;
    weightedLoadKg: number;
    bodyWeightKg: number;
    setDurationSeconds: number;
    tempo: string;
    handPosition: string;
    techniqueScore: number;
    rpe: number;
    videoUrl?: string;
    notes: string;
  };
  calculated: {
    totalReps: number;
    volumeLoad: number;
    density: number;
    powerProxy: number;
    strengthIndex: number;
    bodyweightAdjustedScore: number;
    performanceLevel: string;
  };
  meta: {
    recordedAt: string;
  };
}

export interface BallisticPushUpTest {
  raw: {
    reps: number;
    bodyWeightKg: number;
    bestJumpHeightCm: number;
    avgJumpHeightCm: number;
    takeoffDurationSec: number;
    techniqueScore: number;
    rpe: number;
    videoUrl?: string;
    notes: string;
  };
  calculated: {
    bestMeters: number;
    avgMeters: number;
    flightTime_s: number;
    takeoffVelocity_m_s: number;
    takeoffDurationUsed_s: number;
    estimatedPowerPerRep_W: number;
    averagePowerSet_W: number;
    mechanicalWorkPerRep_J: number;
    totalMechanicalWork_J: number;
  };
  meta: {
    recordedAt: string;
  };
}

export interface DeadliftVelocityTest {
  reps: number;
  loadUsedKg: number;
  bodyWeight: number;
  peakVelocity: number;
  barDisplacement: number;
  power: number;
  volumeLoad: number;
  oneRepMaxKg: number;
  estimatedVelocity1RM: number;
  relativeStrength: number;
  velocityToLoadRatio: number;
  techniqueScore: number;
  notes: string;
}

export interface HipThrustTest {
  reps: number;
  loadKg: number;
  bodyWeight: number;
  volumeLoad: number;
  estimated1RM: number;
  notes: string;
}

export interface WeightedPullUpTest {
  raw: {
    repsCompleted: number;
    bodyWeightKg: number;
    grip: string;
    techniqueScore: number;
    rpe: number;
    videoUrl?: string;
    notes: string;
  };
  calculated: {
    strengthIndex: number;
    powerScore: number;
    enduranceRatio: number;
    bodyweightAdjustedScore: number;
    performanceLevel: string;
  };
  meta: {
    recordedAt: string;
  };
}

export interface BarbellRowTest {
  reps: number;
  loadKg: number;
  bodyWeight: number;
  volumeLoad: number;
  estimated1RM: number;
  relativeStrength: number;
  techniqueScore: number;
  notes: string;
}

export interface PlankHoldTest {
  raw: {
    bodyweightDurationSeconds: number;
    weightedDurationSeconds: number;
    weightedLoadKg: number;
    formQualityScore: number;
    hipDrop: string;
    painAreas: string;
    rpe: number;
    videoUrl?: string;
    notes: string;
  };
  calculated: {
    totalHoldTimeSeconds: number;
    enduranceRatio: number;
    fatiguePercent: number;
    weightedIntensityIndex: number;
    coreEnduranceScore: number | null;
  };
  meta: {
    recordedAt: string;
  };
}

export interface TenMeterSprintTest {
  timeSeconds: number;
  notes: string;
}

export interface FourtyMeterDashTest {
  timeSeconds: number;
  notes: string;
}

export interface IllinoisAgilityTest {
  athleteGender: string;
  age: number;
  bodyWeight: number;
  courseLength: number;
  courseWidth: number;
  surfaceType: string;
  weatherConditions: string;
  testConditions: string;
  equipmentNotes: string;
  attempts: Array<{
    attemptNumber: number;
    time: number;
    valid: boolean;
  }>;
  calculated: {
    bestTime: number;
    worstTime: number;
    meanTime: number;
    medianTime: number;
    variance: number;
    standardDeviation: number;
    coefficientOfVariation: number;
    fatigueIndex: number;
    intraIndividualVariability: number;
    speedConsistency: string;
    performanceRating: string;
    percentile: number;
    reliabilityScore: number;
    ageGroupComparison: string;
    normsDifference: number;
    normsPercentageDifference: number;
  };
  recordedAt: string;
  notes: string;
}

export interface VisualReactionTest {
  testType: string;
  athleteAge: number;
  athleteGender: string;
  dominantHand: string;
  stimulusType: string;
  numberOfStimuli: number;
  numberOfTrials: number;
  randomDelay: boolean;
  preparationTime: number;
  equipmentUsed: string;
  testingEnvironment: string;
  athleteCondition: string;
  trials: Array<{
    trialNumber: number;
    reactionTime: number;
    correct: boolean;
  }>;
  calculated: {
    totalTrials: number;
    correctResponses: number;
    accuracyPercentage: number;
    averageTime: number;
    cleanedAverageTime: number;
    medianTime: number;
    q1Time: number;
    q3Time: number;
    interquartileRange: number;
    bestTime: number;
    worstTime: number;
    standardDeviation: number;
    coefficientOfVariation: number;
    outliers: number[];
    consistency: string;
    cognitiveSpeed: string;
    performanceRating: string;
    reliabilityIndex: number;
    fatigueIndex: number | null;
    improvementIndex: number;
  };
  recordedAt: string;
  notes: string;
}

export interface ReactiveTTestTest {
  testMode: string;
  athleteAge: number;
  athleteGender: string;
  athleteCondition: string;
  primarySport: string;
  courseDistance: number;
  coneSpacing: number;
  surfaceType: string;
  footwear: string;
  cueType: string;
  cueDelay: number;
  attempts: Array<{
    attemptNumber: number;
    totalTime: number;
    decisionTime: number;
    cuedDirection: string;
    responseCorrect: boolean;
    penaltySeconds: number;
  }>;
  calculated: {
    totalAttempts: number;
    correctResponses: number;
    accuracyPercentage: number;
    bestTime: number;
    worstTime: number;
    averageTime: number;
    medianTime: number;
    standardDeviation: number;
    coefficientOfVariation: number;
    consistency: string;
    performanceRating: string;
    averageDecisionTime: number;
    averageMovementTime: number | null;
    decisionToMovementRatio: number | null;
    totalPenaltyTime: number;
    cognitiveAgilityScore: number;
    changeOfDirectionSpeed: number;
    reactiveCognitiveCost: number;
    estimatedTraditionalTime: number;
    learningCurve: number;
    fatigueIndex: number | null;
    reliabilityScore: number;
  };
  recordedAt: string;
  notes: string;
}

export interface StandingLongJumpTest {
  distanceMeters: number;
  notes: string;
}

export interface BeepTest {
  levelReached: number;
  shuttlesInFinalLevel: number;
  athleteAge: number;
  athleteGender: string;
  bodyWeight: number;
  restingHeartRate: number;
  maxHeartRate: number;
  heartRateAt1Min: number;
  heartRateAt2Min: number;
  testTerminationReason: string;
  surfaceType: string;
  temperature: number;
  humidity: number;
  altitude: number;
  rpeScore: number;
  calculated: {
    totalShuttles: number;
    totalDistance: number;
    totalTime: number;
    estimatedVO2Max: number;
    vo2MaxRating: string;
    finalSpeed: number;
    averageSpeed: number;
    caloriesBurned: number;
    metabolicEquivalent: number;
    maxHeartRateEstimated: number;
    heartRateReserve: number;
    heartRateRecovery: number;
    exerciseIntensityPercent: number;
    anaerobicThreshold: number;
    percentileRank: number;
    performanceIndex: number;
    predictedLevel: number;
    fitnessAge: number;
    recoveryScore: string;
  };
  recordedAt: string;
  notes: string;
}

export interface YoYoTest {
  testType: string;
  speedLevelReached: number;
  distanceInFinalSpeed: number;
  totalRecoveryPeriods: number;
  athleteAge: number;
  athleteGender: string;
  primarySport: string;
  playingPosition: string;
  surfaceType: string;
  temperature: number;
  bloodLactatePostTest: number;
  bloodLactateAt3Min: number;
  recoveryQuality: string;
  mentalFatigue: number;
  legHeavinessScore: number;
  breathingDifficulty: number;
  technicalBreakdown: string;
  calculated: {
    totalDistance: number;
    totalTestDuration: number;
    totalActiveTime: number;
    estimatedVO2MaxIntermittent: number;
    performanceLevel: string;
    intermittentEnduranceScore: number;
    repeatedHighIntensityRunningAbility: number;
    recoveryEfficiencyIndex: number;
    activeToRecoveryRatio: number;
    speedReservePercentage: number;
    fatigueResistanceIndex: number;
    lactateClearanceRate: number;
    recoveryPowerScore: number;
    paceConsistency: number;
    trainingZoneSpeed: number;
    matchFitnessEquivalent: number;
    mentalResilienceScore: number;
    percentileInSport: number;
    sportSpecificRating: string;
  };
  recordedAt: string;
  notes: string;
}

export interface CooperTest {
  distanceMeters: number;
  notes: string;
}

export interface SitAndReachTest {
  testVariant: string;
  athleteAge: number;
  athleteGender: string;
  legLength: number;
  armLength: number;
  boxHeight: number;
  zeroPointPosition: string;
  testSurface: string;
  roomTemperature: number;
  timeOfDay: string;
  hoursAfterWaking: number;
  recentExercise: string;
  warmUpType: string;
  warmUpDuration: number;
  previousInjuries: string;
  hamstringTightness: number;
  lowerBackTightness: number;
  trials: Array<{
    trialNumber: number;
    reachDistance: number;
    discomfortLevel: number;
  }>;
  calculated: {
    bestReach: number;
    averageReach: number;
    rangeOfMotion: number;
    relativeFlexibility: number;
    flexibilityRating: string;
    overallFlexibilityScore: number;
    hamstringFlexibilityIndex: number;
    lowerBackFlexibilityIndex: number;
    functionalMobilityScore: number;
    flexibilityPercentile: number;
    ageGroupComparison: string;
    injuryRiskLevel: string;
    consistencyScore: number;
    improvementFromBaseline: number | null;
    improvementPotential: number;
    asymmetryIndex: number | null;
    tightnessScore: number | null;
    sportsPerformanceImpact: string;
    dailyActivityCapability: string;
  };
  recordedAt: string;
  notes: string;
}

// ============================================
// MAIN PROCESSING FUNCTION
// ============================================

/**
 * Main function to process and clean raw stats data
 * Removes IDs, nulls, and structures data for UI consumption
 */
export function processAthleteStats(rawData: any): CleanedAthleteStats {
  // Remove null/undefined values recursively
  const removeNulls = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined;
    if (Array.isArray(obj))
      return obj.map(removeNulls).filter((item) => item !== undefined);
    if (typeof obj === "object") {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        // Skip ID fields
        if (key === "id" || key === "statId" || key.endsWith("Id")) {
          return acc;
        }
        const cleaned = removeNulls(value);
        if (cleaned !== undefined && cleaned !== null) {
          acc[key] = cleaned;
        }
        return acc;
      }, {} as any);
    }
    return obj;
  };

  const cleaned = removeNulls(rawData);

  // Process all sections
  const profile = extractProfile(cleaned);
  const anthropometrics = extractAnthropometrics(cleaned);
  const aggregateScores = extractAggregateScores(cleaned);
  const tests = extractTests(cleaned);
  const injuries = cleaned.injuries || [];
  const timeline = generateTimeline(tests);

  return {
    profile,
    anthropometrics,
    aggregateScores,
    tests,
    injuries,
    timeline,
    recordedAt: cleaned.createdAt || new Date().toISOString(),
  };
}

// ============================================
// EXTRACTION HELPERS
// ============================================

function extractProfile(data: any): ProfileData {
  return {
    athleteId: data.athleteId || "",
    lastUpdated: {
      date: data.lastUpdatedAt || data.updatedAt || "",
      by: data.lastUpdatedByName || null,
      timestamp: data.lastUpdatedAt || null,
    },
  };
}

function extractAnthropometrics(data: any): AnthropometricData {
  return {
    basic: {
      height: data.height || 0,
      weight: data.weight || 0,
      age: data.age || 0,
      bodyFat: data.bodyFat || 0,
      bmi: data.bodyMassIndex || 0,
    },
    circumferences: {
      waist: data.waistCircumference || 0,
      neck: data.neckCircumference || 0,
      calf: data.calfCircumference || 0,
      biceps: data.bicepsCircumference || 0,
      thigh: data.thighCircumference || 0,
    },
    dimensions: {
      armSpan: data.armSpan || 0,
      legLength: data.legLength || 0,
    },
  };
}

function extractAggregateScores(data: any): AggregateScores {
  const strengthRecord = data.strength?.[0];
  const speedRecord = data.speed?.[0];
  const staminaRecord = data.stamina?.[0];

  return {
    strength: {
      muscleMass: strengthRecord?.muscleMass || 0,
      enduranceStrength: strengthRecord?.enduranceStrength || 0,
      explosivePower: strengthRecord?.explosivePower || 0,
    },
    speed: {
      sprintSpeed: speedRecord?.sprintSpeed,
      acceleration: speedRecord?.acceleration,
      agility: speedRecord?.agility,
      reactionTime: speedRecord?.reactionTime,
    },
    stamina: {
      cardiovascularFitness: staminaRecord?.cardiovascularFitness,
      recoveryEfficiency: staminaRecord?.recoveryEfficiency,
      overallFlexibility: staminaRecord?.overallFlexibility,
      vo2MaxScore: staminaRecord?.vo2MaxScore,
    },
  };
}

function extractTests(data: any): {
  strength: StrengthTestRecord[];
  speed: SpeedTestRecord[];
  stamina: StaminaTestRecord[];
} {
  return {
    strength: processStrengthTests(data.strength),
    speed: processSpeedTests(data.speed),
    stamina: processStaminaTests(data.stamina),
  };
}

function processStrengthTests(strengthArray: any[]): StrengthTestRecord[] {
  if (!strengthArray || strengthArray.length === 0) return [];

  return strengthArray.map((record) => ({
    testDate: record.testDate || record.createdAt,
    recordedAt: record.createdAt,
    tests: {
      countermovementJump: record.Countermovement_Jump,
      loadedSquatJump: record.Loaded_Squat_Jump,
      depthJump: record.Depth_Jump,
      ballisticBenchPress: record.Ballistic_Bench_Press,
      pushUp: record.Push_Up,
      ballisticPushUp: record.Ballistic_Push_Up,
      deadliftVelocity: record.Deadlift_Velocity,
      hipThrust: record.Barbell_Hip_Thrust,
      weightedPullUp: record.Weighted_Pull_up,
      barbellRow: record.Barbell_Row,
      plankHold: record.Plank_Hold,
    },
  }));
}

function processSpeedTests(speedArray: any[]): SpeedTestRecord[] {
  if (!speedArray || speedArray.length === 0) return [];

  return speedArray.map((record) => ({
    testDate: record.createdAt,
    recordedAt: record.createdAt,
    tests: {
      tenMeterSprint: record.Ten_Meter_Sprint,
      fourtyMeterDash: record.Fourty_Meter_Dash,
      repeatedSprintAbility: record.Repeated_Sprint_Ability,
      illinoisAgility: record.Illinois_Agility_Test,
      visualReaction: record.Visual_Reaction_Speed_Drill,
      reactiveTTest: record.Reactive_Agility_T_Test,
      standingLongJump: record.Standing_Long_Jump,
    },
  }));
}

function processStaminaTests(staminaArray: any[]): StaminaTestRecord[] {
  if (!staminaArray || staminaArray.length === 0) return [];

  return staminaArray.map((record) => ({
    testDate: record.createdAt,
    recordedAt: record.createdAt,
    tests: {
      beepTest: record.Beep_Test,
      yoYoTest: record.Yo_Yo_Test,
      cooperTest: record.Cooper_Test,
      sitAndReach: record.Sit_and_Reach_Test,
    },
  }));
}

function generateTimeline(tests: {
  strength: StrengthTestRecord[];
  speed: SpeedTestRecord[];
  stamina: StaminaTestRecord[];
}): TestTimelineEntry[] {
  const timeline: TestTimelineEntry[] = [];

  // Add strength tests
  tests.strength.forEach((record) => {
    Object.entries(record.tests).forEach(([testName, testData]) => {
      if (testData) {
        timeline.push({
          date: record.testDate,
          category: "strength",
          testName,
          keyMetric: getKeyMetric("strength", testName, testData),
          recordedAt: record.recordedAt,
        });
      }
    });
  });

  // Add speed tests
  tests.speed.forEach((record) => {
    Object.entries(record.tests).forEach(([testName, testData]) => {
      if (testData) {
        timeline.push({
          date: record.testDate,
          category: "speed",
          testName,
          keyMetric: getKeyMetric("speed", testName, testData),
          recordedAt: record.recordedAt,
        });
      }
    });
  });

  // Add stamina tests
  tests.stamina.forEach((record) => {
    Object.entries(record.tests).forEach(([testName, testData]) => {
      if (testData) {
        timeline.push({
          date: record.testDate,
          category: "stamina",
          testName,
          keyMetric: getKeyMetric("stamina", testName, testData),
          recordedAt: record.recordedAt,
        });
      }
    });
  });

  // Sort by date descending (newest first)
  return timeline.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function getKeyMetric(
  category: string,
  testName: string,
  testData: any
): string {
  // Extract the most important metric for each test
  switch (testName) {
    case "countermovementJump":
      return `${testData.bestAttempt?.jumpHeight?.toFixed(1)}cm`;
    case "tenMeterSprint":
      return `${testData.timeSeconds?.toFixed(2)}s`;
    case "beepTest":
      return `Level ${testData.levelReached}`;
    case "yoYoTest":
      return `${testData.calculated?.totalDistance}m`;
    // Add more cases as needed
    default:
      return "Completed";
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Filter tests by date range
 */
export function filterTestsByDateRange(
  stats: CleanedAthleteStats,
  startDate: Date,
  endDate: Date
): CleanedAthleteStats {
  const filterByDate = (tests: any[]) => {
    return tests.filter((test) => {
      const testDate = new Date(test.testDate);
      return testDate >= startDate && testDate <= endDate;
    });
  };

  return {
    ...stats,
    tests: {
      strength: filterByDate(stats.tests.strength),
      speed: filterByDate(stats.tests.speed),
      stamina: filterByDate(stats.tests.stamina),
    },
    timeline: stats.timeline.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    }),
  };
}

/**
 * Check if athlete has completed a specific test
 */
export function hasCompletedTest(
  stats: CleanedAthleteStats,
  category: "strength" | "speed" | "stamina",
  testName: string
): boolean {
  const tests = stats.tests[category];
  return tests.some((record) => {
    const testData = record.tests[testName as keyof typeof record.tests];
    return testData !== undefined && testData !== null;
  });
}

/**
 * Get all unique test dates
 */
export function getAllTestDates(stats: CleanedAthleteStats): string[] {
  const dates = new Set<string>();

  stats.tests.strength.forEach((t) => dates.add(t.testDate));
  stats.tests.speed.forEach((t) => dates.add(t.testDate));
  stats.tests.stamina.forEach((t) => dates.add(t.testDate));

  return Array.from(dates).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
}

/**
 * Get test count by category
 */
export function getTestCountByCategory(stats: CleanedAthleteStats): {
  strength: number;
  speed: number;
  stamina: number;
  total: number;
} {
  const strengthCount = stats.tests.strength.reduce((count, record) => {
    return count + Object.values(record.tests).filter(Boolean).length;
  }, 0);

  const speedCount = stats.tests.speed.reduce((count, record) => {
    return count + Object.values(record.tests).filter(Boolean).length;
  }, 0);

  const staminaCount = stats.tests.stamina.reduce((count, record) => {
    return count + Object.values(record.tests).filter(Boolean).length;
  }, 0);

  return {
    strength: strengthCount,
    speed: speedCount,
    stamina: staminaCount,
    total: strengthCount + speedCount + staminaCount,
  };
}
