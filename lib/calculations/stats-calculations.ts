/**
 * Sports Science Calculation Library
 * Industry-standard formulas for athlete performance metrics
 * All formulas are documented with sources
 */

// ============================================
// BASIC MEASUREMENTS
// ============================================

/**
 * Calculate Body Mass Index (BMI)
 * Formula: weight (kg) / (height (m))²
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

/**
 * Get BMI classification
 */
export function getBMIClassification(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// ============================================
// JUMP HEIGHT CALCULATIONS
// ============================================

/**
 * Calculate jump height from flight time
 * Formula: h = (g × t²) / 8
 * Where: g = 9.81 m/s², t = flight time (seconds)
 * Source: Hawkin Dynamics, Bosco et al. (1983)
 */
export function calculateJumpHeightFromFlightTime(
  flightTimeSeconds: number
): number {
  const g = 9.81; // gravity in m/s²
  const heightMeters = (g * Math.pow(flightTimeSeconds, 2)) / 8;
  return Number((heightMeters * 100).toFixed(2)); // convert to cm
}

/**
 * Calculate jump height from reach difference
 * Formula: Jump Height = Jump Reach - Standing Reach
 */
export function calculateJumpHeightFromReach(
  jumpReachCm: number,
  standingReachCm: number
): number {
  return Number((jumpReachCm - standingReachCm).toFixed(2));
}

/**
 * Calculate takeoff velocity from jump height
 * Formula: v = √(2 × g × h)
 * Where: g = 9.81 m/s², h = height in meters
 */
export function calculateTakeoffVelocity(jumpHeightCm: number): number {
  const g = 9.81;
  const heightM = jumpHeightCm / 100;
  const velocity = Math.sqrt(2 * g * heightM);
  return Number(velocity.toFixed(3)); // m/s
}

// ============================================
// POWER CALCULATIONS
// ============================================

/**
 * Calculate peak power from countermovement jump
 * Sayers Equation: Peak Power (W) = 60.7 × jump height (cm) + 45.3 × body mass (kg) - 2055
 * Source: Sayers et al. (1999) - Cross-validation study
 * Validity: R² = 0.78, SEE = 355.7W
 */
export function calculateCMJPeakPower(
  jumpHeightCm: number,
  bodyMassKg: number
): number {
  const peakPower = 60.7 * jumpHeightCm + 45.3 * bodyMassKg - 2055;
  return Number(Math.max(0, peakPower).toFixed(2)); // ensure non-negative
}

/**
 * Calculate peak power for loaded jumps
 * Formula: Peak Power (W) = 60.7 × jump height (cm) + 45.3 × total mass (kg) - 2055
 * Total mass = body mass + external load
 */
export function calculateLoadedJumpPeakPower(
  jumpHeightCm: number,
  bodyMassKg: number,
  loadKg: number
): number {
  const totalMass = bodyMassKg + loadKg;
  return calculateCMJPeakPower(jumpHeightCm, totalMass);
}

/**
 * Calculate relative peak power (power-to-weight ratio)
 * Formula: Relative Power = Absolute Power / Body Mass
 * Unit: W/kg
 */
export function calculateRelativePower(
  absolutePowerW: number,
  bodyMassKg: number
): number {
  return Number((absolutePowerW / bodyMassKg).toFixed(2));
}

/**
 * Calculate power output from velocity-based training
 * Formula: Power = Force × Velocity
 * For vertical jumps: Power = (mass × g) × velocity
 */
export function calculatePowerFromVelocity(
  massKg: number,
  velocityMs: number
): number {
  const g = 9.81;
  const power = massKg * g * velocityMs;
  return Number(power.toFixed(2));
}

/**
 * Calculate ballistic bench press power output
 * Formula: Power = (mass × gravity × displacement) / time
 * Alternative: Power = mass × acceleration × velocity (if acceleration data available)
 */
export function calculateBallisticBenchPressPower(
  loadKg: number,
  displacementM: number,
  timeSeconds: number
): number {
  const g = 9.81;
  const power = (loadKg * g * displacementM) / timeSeconds;
  return Number(power.toFixed(2));
}

// ============================================
// REACTIVE STRENGTH INDEX (RSI)
// ============================================

/**
 * Calculate Reactive Strength Index
 * Formula: RSI = Jump Height (cm) / Ground Contact Time (s)
 * Higher RSI = better reactive strength (ability to quickly utilize stretch-shortening cycle)
 * Good RSI: > 2.0, Excellent RSI: > 2.5
 * Source: GymAware, Flanagan & Comyns (2008)
 */
export function calculateRSI(
  jumpHeightCm: number,
  groundContactTimeSeconds: number
): number {
  if (groundContactTimeSeconds === 0) return 0;
  return Number((jumpHeightCm / groundContactTimeSeconds).toFixed(3));
}

/**
 * Get RSI rating
 */
export function getRSIRating(rsi: number): string {
  if (rsi >= 2.5) return "excellent";
  if (rsi >= 2.0) return "good";
  if (rsi >= 1.5) return "average";
  if (rsi >= 1.0) return "fair";
  return "poor";
}

// ============================================
// PUSH-UP CALCULATIONS
// ============================================

/**
 * Calculate average seconds per rep
 */
export function calculateAvgSecondsPerRep(
  totalTimeSeconds: number,
  repsCompleted: number
): number {
  if (repsCompleted === 0) return 0;
  return Number((totalTimeSeconds / repsCompleted).toFixed(2));
}

/**
 * Calculate reps per minute
 */
export function calculateRepsPerMinute(
  totalTimeSeconds: number,
  repsCompleted: number
): number {
  if (totalTimeSeconds === 0) return 0;
  return Number(((repsCompleted / totalTimeSeconds) * 60).toFixed(2));
}

/**
 * Calculate power index for push-ups
 * Formula: Power Index = (Reps × Mass) / Time
 * Higher index = better power endurance
 */
export function calculatePushUpPowerIndex(
  repsCompleted: number,
  massKg: number,
  totalTimeSeconds: number
): number {
  if (totalTimeSeconds === 0) return 0;
  // Assume 64% of body weight is lifted in push-up (Ebben et al., 2011)
  const effectiveMass = massKg * 0.64;
  const powerIndex = (repsCompleted * effectiveMass) / totalTimeSeconds;
  return Number(powerIndex.toFixed(2));
}

// ============================================
// ONE REP MAX ESTIMATION
// ============================================

/**
 * Estimate 1RM using Brzycki formula
 * Formula: 1RM = weight / (1.0278 - 0.0278 × reps)
 * Valid for reps < 10
 */
export function estimate1RMBrzycki(
  weightKg: number,
  repsCompleted: number
): number {
  if (repsCompleted >= 10) {
    console.warn("Brzycki formula less accurate for reps >= 10");
  }
  const oneRM = weightKg / (1.0278 - 0.0278 * repsCompleted);
  return Number(oneRM.toFixed(2));
}

/**
 * Estimate 1RM using Epley formula
 * Formula: 1RM = weight × (1 + reps / 30)
 */
export function estimate1REpley(
  weightKg: number,
  repsCompleted: number
): number {
  const oneRM = weightKg * (1 + repsCompleted / 30);
  return Number(oneRM.toFixed(2));
}

/**
 * Find optimal load (load at which peak power was highest)
 */
export function findOptimalLoad(
  attempts: Array<{ load: number; peakPower: number }>
): number {
  if (attempts.length === 0) return 0;

  const maxPowerAttempt = attempts.reduce((max, current) =>
    current.peakPower > max.peakPower ? current : max
  );

  return maxPowerAttempt.load;
}

// ============================================
// SPRINT & SPEED CALCULATIONS
// ============================================

/**
 * Calculate average velocity
 * Formula: Velocity = Distance / Time
 */
export function calculateAverageVelocity(
  distanceMeters: number,
  timeSeconds: number
): number {
  if (timeSeconds === 0) return 0;
  return Number((distanceMeters / timeSeconds).toFixed(3)); // m/s
}

/**
 * Calculate acceleration from split times
 * Formula: a = Δv / Δt
 * Assumes starting from rest (v₀ = 0)
 */
export function calculateAcceleration(
  distanceMeters: number,
  timeSeconds: number
): number {
  if (timeSeconds === 0) return 0;
  // v = d/t, a = v/t (simplified for uniform acceleration from rest)
  const velocity = distanceMeters / timeSeconds;
  const acceleration = velocity / timeSeconds;
  return Number(acceleration.toFixed(3)); // m/s²
}

/**
 * Calculate peak velocity from split times
 * Uses the fastest split segment
 */
export function calculatePeakVelocity(
  splitTimes: Record<string, number> // e.g., {"10m": 1.8, "20m": 3.2}
): number {
  const distances = Object.keys(splitTimes)
    .map((key) => parseFloat(key.replace(/[^\d.]/g, "")))
    .sort((a, b) => a - b);

  if (distances.length < 2) return 0;

  let maxVelocity = 0;

  for (let i = 1; i < distances.length; i++) {
    const segmentDistance = distances[i] - distances[i - 1];
    const segmentTime =
      splitTimes[`${distances[i]}m`] - splitTimes[`${distances[i - 1]}m`];
    const velocity = segmentDistance / segmentTime;
    maxVelocity = Math.max(maxVelocity, velocity);
  }

  return Number(maxVelocity.toFixed(3));
}

/**
 * Calculate fatigue index for repeated sprint ability
 * Formula: Fatigue Index (%) = ((Average Time - Best Time) / Best Time) × 100
 * Lower is better (less fatigue)
 */
export function calculateFatigueIndex(sprintTimes: number[]): number {
  if (sprintTimes.length === 0) return 0;

  const bestTime = Math.min(...sprintTimes);
  const averageTime =
    sprintTimes.reduce((sum, time) => sum + time, 0) / sprintTimes.length;

  const fatigueIndex = ((averageTime - bestTime) / bestTime) * 100;
  return Number(fatigueIndex.toFixed(2));
}

// ============================================
// AGILITY TEST RATINGS
// ============================================

/**
 * Get T-Test agility rating
 * Source: Pauole et al. (2000)
 * Males: <9.5s = Excellent, 9.5-10.5s = Good, 10.5-11.5s = Average
 * Females: <10.5s = Excellent, 10.5-11.5s = Good, 11.5-12.5s = Average
 */
export function getTTestRating(
  timeSeconds: number,
  gender: "MALE" | "FEMALE" | "OTHER"
): "excellent" | "good" | "average" | "below_average" | "poor" {
  if (gender === "MALE") {
    if (timeSeconds < 9.5) return "excellent";
    if (timeSeconds < 10.5) return "good";
    if (timeSeconds < 11.5) return "average";
    if (timeSeconds < 12.5) return "below_average";
    return "poor";
  } else if (gender === "FEMALE") {
    if (timeSeconds < 10.5) return "excellent";
    if (timeSeconds < 11.5) return "good";
    if (timeSeconds < 12.5) return "average";
    if (timeSeconds < 13.5) return "below_average";
    return "poor";
  }

  // For "OTHER", use average of male/female standards
  if (timeSeconds < 10.0) return "excellent";
  if (timeSeconds < 11.0) return "good";
  if (timeSeconds < 12.0) return "average";
  if (timeSeconds < 13.0) return "below_average";
  return "poor";
}

/**
 * Get Illinois Agility Test rating
 * Males: <15.2s = Excellent, 15.2-16.1s = Above Avg, 16.2-18.1s = Average
 * Females: <17.0s = Excellent, 17.0-17.9s = Above Avg, 18.0-21.7s = Average
 */
export function getIllinoisAgilityRating(
  timeSeconds: number,
  gender: "MALE" | "FEMALE" | "OTHER"
): "excellent" | "above_average" | "average" | "below_average" | "poor" {
  if (gender === "MALE") {
    if (timeSeconds < 15.2) return "excellent";
    if (timeSeconds < 16.1) return "above_average";
    if (timeSeconds < 18.1) return "average";
    if (timeSeconds < 20.0) return "below_average";
    return "poor";
  } else if (gender === "FEMALE") {
    if (timeSeconds < 17.0) return "excellent";
    if (timeSeconds < 17.9) return "above_average";
    if (timeSeconds < 21.7) return "average";
    if (timeSeconds < 24.0) return "below_average";
    return "poor";
  }

  // For "OTHER", use average
  if (timeSeconds < 16.0) return "excellent";
  if (timeSeconds < 17.0) return "above_average";
  if (timeSeconds < 20.0) return "average";
  if (timeSeconds < 22.0) return "below_average";
  return "poor";
}

// ============================================
// VO2 MAX CALCULATIONS
// ============================================

/**
 * Calculate VO2max from Beep Test
 * Ramsbottom Formula: VO2max = 3.46 × (Level + Shuttles/(Level × 0.4325 + 7.0048)) + 12.2
 * Source: Ramsbottom et al. (1988)
 */
export function calculateVO2MaxFromBeepTest(
  level: number,
  shuttles: number
): number {
  const vo2Max = 3.46 * (level + shuttles / (level * 0.4325 + 7.0048)) + 12.2;
  return Number(vo2Max.toFixed(2));
}

/**
 * Calculate VO2max from Cooper Test (12-minute run)
 * Formula: VO2max (ml/kg/min) = (22.351 × distance in km) - 11.288
 * Alternative: VO2max = (distance in meters - 504.9) / 44.73
 */
export function calculateVO2MaxFromCooperTest(distanceMeters: number): number {
  const distanceKm = distanceMeters / 1000;
  const vo2Max = 22.351 * distanceKm - 11.288;
  return Number(vo2Max.toFixed(2));
}

/**
 * Calculate VO2max from Yo-Yo Test
 * Formula varies by test version, this is for Yo-Yo IR1
 * VO2max = IR1 distance (m) × 0.0084 + 36.4
 */
export function calculateVO2MaxFromYoYoTest(distanceMeters: number): number {
  const vo2Max = distanceMeters * 0.0084 + 36.4;
  return Number(vo2Max.toFixed(2));
}

/**
 * Get VO2max fitness rating by age and gender
 * Source: American Heart Association standards
 */
export function getVO2MaxRating(
  vo2Max: number,
  age: number,
  gender: "MALE" | "FEMALE" | "OTHER"
): "very_poor" | "poor" | "fair" | "good" | "excellent" | "superior" {
  // Simplified age bracket: 18-25 years (adjust for other ages as needed)
  if (gender === "MALE") {
    if (vo2Max < 38) return "very_poor";
    if (vo2Max < 44) return "poor";
    if (vo2Max < 51) return "fair";
    if (vo2Max < 56) return "good";
    if (vo2Max < 61) return "excellent";
    return "superior";
  } else if (gender === "FEMALE") {
    if (vo2Max < 27) return "very_poor";
    if (vo2Max < 32) return "poor";
    if (vo2Max < 38) return "fair";
    if (vo2Max < 43) return "good";
    if (vo2Max < 49) return "excellent";
    return "superior";
  }

  // For "OTHER", use average
  if (vo2Max < 32) return "very_poor";
  if (vo2Max < 38) return "poor";
  if (vo2Max < 44) return "fair";
  if (vo2Max < 49) return "good";
  if (vo2Max < 55) return "excellent";
  return "superior";
}

// ============================================
// HEART RATE CALCULATIONS
// ============================================

/**
 * Calculate maximum heart rate (age-predicted)
 * Formula: HRmax = 220 - age
 * Note: This is an estimation; actual max HR varies individually
 */
export function calculateMaxHeartRate(age: number): number {
  return 220 - age;
}

/**
 * Calculate heart rate reserve (HRR)
 * Formula: HRR = HRmax - HRrest
 */
export function calculateHeartRateReserve(
  maxHR: number,
  restingHR: number
): number {
  return maxHR - restingHR;
}

/**
 * Calculate target heart rate zone
 * Formula: Target HR = ((HRmax - HRrest) × intensity%) + HRrest
 * Intensity: 0.5-0.6 (light), 0.6-0.7 (moderate), 0.7-0.85 (vigorous), 0.85-1.0 (maximum)
 */
export function calculateTargetHeartRate(
  maxHR: number,
  restingHR: number,
  intensityPercent: number
): number {
  const hrr = maxHR - restingHR;
  return Math.round(hrr * (intensityPercent / 100) + restingHR);
}

/**
 * Calculate heart rate recovery score
 * Good recovery: HR drops 12+ bpm in first minute
 */
export function calculateHRRecoveryScore(
  peakHR: number,
  hrAt1Min: number
): number {
  return peakHR - hrAt1Min;
}

/**
 * Get recovery rating
 */
export function getHRRecoveryRating(recoveryScore: number): string {
  if (recoveryScore >= 25) return "excellent";
  if (recoveryScore >= 18) return "good";
  if (recoveryScore >= 12) return "average";
  if (recoveryScore >= 6) return "below_average";
  return "poor";
}

// ============================================
// FLEXIBILITY RATINGS
// ============================================

/**
 * Get Sit and Reach Test rating (cm from toe line)
 * Males: >14cm = Excellent, 11-14cm = Good, 0-10cm = Average, <0cm = Poor
 * Females: >15cm = Excellent, 12-15cm = Good, 1-11cm = Average, <1cm = Poor
 */
export function getSitAndReachRating(
  distanceCm: number,
  gender: "MALE" | "FEMALE" | "OTHER"
): "excellent" | "good" | "average" | "fair" | "poor" {
  if (gender === "MALE") {
    if (distanceCm > 14) return "excellent";
    if (distanceCm >= 11) return "good";
    if (distanceCm >= 0) return "average";
    if (distanceCm >= -5) return "fair";
    return "poor";
  } else if (gender === "FEMALE") {
    if (distanceCm > 15) return "excellent";
    if (distanceCm >= 12) return "good";
    if (distanceCm >= 1) return "average";
    if (distanceCm >= -4) return "fair";
    return "poor";
  }

  // For "OTHER"
  if (distanceCm > 14) return "excellent";
  if (distanceCm >= 11) return "good";
  if (distanceCm >= 0) return "average";
  if (distanceCm >= -4) return "fair";
  return "poor";
}

/**
 * Get Active Straight Leg Raise rating (degrees from horizontal)
 * >80° = Excellent, 70-80° = Good, 60-70° = Average, <60° = Poor
 */
export function getASLRRating(
  angleDegrees: number
): "excellent" | "good" | "average" | "poor" {
  if (angleDegrees > 80) return "excellent";
  if (angleDegrees >= 70) return "good";
  if (angleDegrees >= 60) return "average";
  return "poor";
}

/**
 * Get Knee to Wall rating (cm from wall)
 * >12cm = Excellent, 10-12cm = Good, 8-10cm = Average, <8cm = Poor
 */
export function getKneeToWallRating(
  distanceCm: number
): "excellent" | "good" | "average" | "poor" {
  if (distanceCm > 12) return "excellent";
  if (distanceCm >= 10) return "good";
  if (distanceCm >= 8) return "average";
  return "poor";
}

// ============================================
// AGGREGATE SCORE CALCULATIONS (0-100)
// ============================================

/**
 * Normalize a value to 0-100 scale using min-max normalization
 * Formula: normalized = ((value - min) / (max - min)) × 100
 */
export function normalizeToScale(
  value: number,
  min: number,
  max: number,
  invert: boolean = false
): number {
  const clamped = Math.max(min, Math.min(max, value));
  let normalized = ((clamped - min) / (max - min)) * 100;

  if (invert) {
    normalized = 100 - normalized; // for metrics where lower is better (e.g., time)
  }

  return Number(normalized.toFixed(2));
}

/**
 * Calculate overall strength score from multiple tests
 * Weights different tests based on importance
 */
export function calculateStrengthScore(data: {
  cmjPeakPower?: number;
  loadedJumpPower?: number;
  benchPressPower?: number;
  deadlift1RM?: number;
  pullUps?: number;
}): { muscleMass: number; enduranceStrength: number; explosivePower: number } {
  // These ranges should be adjusted based on athlete population norms
  const scores = {
    muscleMass: 0,
    enduranceStrength: 0,
    explosivePower: 0,
  };

  const weights: number[] = [];

  // Explosive Power (from jumps and ballistic movements)
  if (data.cmjPeakPower) {
    scores.explosivePower += normalizeToScale(data.cmjPeakPower, 2000, 6000);
    weights.push(1);
  }
  if (data.loadedJumpPower) {
    scores.explosivePower += normalizeToScale(data.loadedJumpPower, 2500, 7000);
    weights.push(1);
  }
  if (data.benchPressPower) {
    scores.explosivePower += normalizeToScale(data.benchPressPower, 300, 1500);
    weights.push(1);
  }

  if (weights.length > 0) {
    scores.explosivePower = scores.explosivePower / weights.length;
  }

  weights.length = 0;

  // Muscle Mass/Strength (from max strength tests)
  if (data.deadlift1RM) {
    scores.muscleMass += normalizeToScale(data.deadlift1RM, 60, 250);
    weights.push(1);
  }

  if (weights.length > 0) {
    scores.muscleMass = scores.muscleMass / weights.length;
  } else {
    scores.muscleMass = 50; // default if no data
  }

  weights.length = 0;

  // Endurance Strength (from bodyweight endurance tests)
  if (data.pullUps) {
    scores.enduranceStrength += normalizeToScale(data.pullUps, 0, 30);
    weights.push(1);
  }

  if (weights.length > 0) {
    scores.enduranceStrength = scores.enduranceStrength / weights.length;
  } else {
    scores.enduranceStrength = 50; // default
  }

  return {
    muscleMass: Number(scores.muscleMass.toFixed(2)),
    enduranceStrength: Number(scores.enduranceStrength.toFixed(2)),
    explosivePower: Number(scores.explosivePower.toFixed(2)),
  };
}

/**
 * Calculate overall speed & agility score
 */
export function calculateSpeedAgilityScore(data: {
  tenMeterTime?: number;
  fourtyMeterTime?: number;
  tTestTime?: number;
  illinoisTime?: number;
  reactionTime?: number;
}): {
  sprintSpeed: number;
  acceleration: number;
  agility: number;
  reactionTime: number;
} {
  const scores = {
    sprintSpeed: 0,
    acceleration: 0,
    agility: 0,
    reactionTime: 0,
  };

  // Sprint Speed (lower time = better, so invert)
  if (data.fourtyMeterTime) {
    scores.sprintSpeed = normalizeToScale(data.fourtyMeterTime, 4.5, 6.5, true);
  } else {
    scores.sprintSpeed = 50;
  }

  // Acceleration (10m sprint)
  if (data.tenMeterTime) {
    scores.acceleration = normalizeToScale(data.tenMeterTime, 1.5, 2.2, true);
  } else {
    scores.acceleration = 50;
  }

  // Agility (average of T-test and Illinois)
  const agilityScores: number[] = [];
  if (data.tTestTime) {
    agilityScores.push(normalizeToScale(data.tTestTime, 9.0, 13.0, true));
  }
  if (data.illinoisTime) {
    agilityScores.push(normalizeToScale(data.illinoisTime, 15.0, 22.0, true));
  }
  scores.agility =
    agilityScores.length > 0
      ? agilityScores.reduce((a, b) => a + b, 0) / agilityScores.length
      : 50;

  // Reaction Time (ms, lower is better)
  if (data.reactionTime) {
    scores.reactionTime = normalizeToScale(data.reactionTime, 150, 350, true);
  } else {
    scores.reactionTime = 50;
  }

  return {
    sprintSpeed: Number(scores.sprintSpeed.toFixed(2)),
    acceleration: Number(scores.acceleration.toFixed(2)),
    agility: Number(scores.agility.toFixed(2)),
    reactionTime: Number(scores.reactionTime.toFixed(2)),
  };
}

/**
 * Calculate overall stamina & recovery score
 */
export function calculateStaminaRecoveryScore(data: {
  vo2Max?: number;
  hrRecoveryScore?: number;
  sitAndReach?: number;
}): {
  cardiovascularFitness: number;
  recoveryEfficiency: number;
  overallFlexibility: number;
  vo2MaxScore: number;
} {
  const scores = {
    cardiovascularFitness: 0,
    recoveryEfficiency: 0,
    overallFlexibility: 0,
    vo2MaxScore: 0,
  };

  // VO2 Max
  if (data.vo2Max) {
    scores.vo2MaxScore = normalizeToScale(data.vo2Max, 30, 70);
    scores.cardiovascularFitness = scores.vo2MaxScore;
  } else {
    scores.vo2MaxScore = 50;
    scores.cardiovascularFitness = 50;
  }

  // Recovery Efficiency
  if (data.hrRecoveryScore) {
    scores.recoveryEfficiency = normalizeToScale(data.hrRecoveryScore, 5, 30);
  } else {
    scores.recoveryEfficiency = 50;
  }

  // Flexibility
  if (data.sitAndReach !== undefined) {
    scores.overallFlexibility = normalizeToScale(data.sitAndReach, -10, 20);
  } else {
    scores.overallFlexibility = 50;
  }

  return {
    cardiovascularFitness: Number(scores.cardiovascularFitness.toFixed(2)),
    recoveryEfficiency: Number(scores.recoveryEfficiency.toFixed(2)),
    overallFlexibility: Number(scores.overallFlexibility.toFixed(2)),
    vo2MaxScore: Number(scores.vo2MaxScore.toFixed(2)),
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Find best attempt from array of attempts
 */
export function findBestAttempt<T extends { attemptNumber: number }>(
  attempts: T[],
  compareKey: keyof T,
  higherIsBetter: boolean = true
): T | null {
  if (attempts.length === 0) return null;

  return attempts.reduce((best, current) => {
    const bestValue = best[compareKey] as number;
    const currentValue = current[compareKey] as number;

    if (higherIsBetter) {
      return currentValue > bestValue ? current : best;
    } else {
      return currentValue < bestValue ? current : best;
    }
  });
}

/**
 * Calculate average from array of numbers
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Number((sum / numbers.length).toFixed(2));
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const avg = calculateAverage(numbers);
  const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2));
  const avgSquaredDiff = calculateAverage(squaredDiffs);
  return Number(Math.sqrt(avgSquaredDiff).toFixed(3));
}

/**
 * Calculate coefficient of variation (CV%)
 * Measures consistency/reliability of repeated measurements
 * CV% = (SD / Mean) × 100
 * Lower CV% = more consistent performance
 */
export function calculateCoefficientOfVariation(numbers: number[]): number {
  const mean = calculateAverage(numbers);
  if (mean === 0) return 0;
  const sd = calculateStandardDeviation(numbers);
  return Number(((sd / mean) * 100).toFixed(2));
}
