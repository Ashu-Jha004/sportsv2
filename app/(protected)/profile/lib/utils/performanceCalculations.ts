// lib/utils/performanceCalculations.ts
"use client";

/**
 * Advanced Performance Calculations & Analytics
 * Elite benchmarks, comparisons, statistical analysis, and insights
 */

// ============================================
// ELITE BENCHMARKS (Hardcoded World Records & Standards)
// ============================================

export const ELITE_BENCHMARKS = {
  // STRENGTH BENCHMARKS
  strength: {
    countermovementJump: {
      worldRecord: 63.5, // cm (Evan Ungar)
      elite: 55,
      good: 45,
      average: 35,
      unit: "cm",
      lowerIsBetter: false,
    },
    deadlift: {
      worldRecord: 501, // kg (Hafthor Bjornsson)
      elite: 300,
      good: 200,
      average: 150,
      unit: "kg",
      lowerIsBetter: false,
    },
    benchPress: {
      worldRecord: 350, // kg (Julius Maddox)
      elite: 180,
      good: 120,
      average: 80,
      unit: "kg",
      lowerIsBetter: false,
    },
    plankHold: {
      worldRecord: 32400, // seconds (9 hours - Daniel Scali)
      elite: 300,
      good: 180,
      average: 120,
      unit: "seconds",
      lowerIsBetter: false,
    },
    pullUps: {
      worldRecord: 7715, // reps in 24h (Andrew Shapiro)
      elite: 30, // consecutive
      good: 15,
      average: 8,
      unit: "reps",
      lowerIsBetter: false,
    },
    pushUps: {
      worldRecord: 46001, // reps in 24h (Charles Servizio)
      elite: 100, // consecutive
      good: 50,
      average: 30,
      unit: "reps",
      lowerIsBetter: false,
    },
  },

  // SPEED BENCHMARKS
  speed: {
    tenMeterSprint: {
      worldRecord: 1.5, // seconds
      elite: 1.7,
      good: 1.85,
      average: 2.0,
      unit: "seconds",
      lowerIsBetter: true,
    },
    fourtyMeterDash: {
      worldRecord: 4.22, // seconds (projected from Usain Bolt)
      elite: 4.5,
      good: 4.8,
      average: 5.2,
      unit: "seconds",
      lowerIsBetter: true,
    },
    hundredMeterSprint: {
      worldRecord: 9.58, // seconds (Usain Bolt)
      elite: 10.5,
      good: 11.5,
      average: 13.0,
      unit: "seconds",
      lowerIsBetter: true,
    },
    illinoisAgility: {
      worldRecord: 12.5, // seconds
      elite: 14.0,
      good: 16.0,
      average: 18.0,
      unit: "seconds",
      lowerIsBetter: true,
    },
    reactionTime: {
      worldRecord: 0.12, // seconds
      elite: 0.15,
      good: 0.2,
      average: 0.25,
      unit: "seconds",
      lowerIsBetter: true,
    },
    standingLongJump: {
      worldRecord: 3.71, // meters (Arne Tvervaag)
      elite: 3.0,
      good: 2.5,
      average: 2.0,
      unit: "meters",
      lowerIsBetter: false,
    },
  },

  // STAMINA BENCHMARKS
  stamina: {
    beepTestLevel: {
      worldRecord: 21, // level
      elite: 15,
      good: 12,
      average: 9,
      unit: "level",
      lowerIsBetter: false,
    },
    vo2Max: {
      worldRecord: 96, // ml/kg/min (Oskar Svendsen)
      elite: 70,
      good: 55,
      average: 45,
      unit: "ml/kg/min",
      lowerIsBetter: false,
    },
    cooperTest: {
      worldRecord: 4000, // meters in 12 min
      elite: 3200,
      good: 2800,
      average: 2400,
      unit: "meters",
      lowerIsBetter: false,
    },
    yoYoTest: {
      worldRecord: 6000, // meters
      elite: 4000,
      good: 3000,
      average: 2000,
      unit: "meters",
      lowerIsBetter: false,
    },
    flexibility: {
      worldRecord: 35, // cm reach beyond toes
      elite: 20,
      good: 10,
      average: 0,
      unit: "cm",
      lowerIsBetter: false,
    },
  },
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PerformanceLevel {
  level: "World Class" | "Elite" | "Good" | "Average" | "Below Average";
  color: string;
  bgColor: string;
  percentage: number;
  description: string;
}

export interface EliteComparison {
  percentageOfElite: number;
  difference: number;
  differenceFormatted: string;
  icon: "↑" | "↓" | "→";
  message: string;
  color: string;
}

export interface TrendAnalysis {
  trend: "improving" | "declining" | "stable";
  percentageChange: number;
  absoluteChange: number;
  icon: string;
  color: string;
  message: string;
}

export interface InjuryRiskAssessment {
  score: number;
  level: "Low" | "Moderate" | "High" | "Very High";
  color: string;
  bgColor: string;
  factors: {
    flexibility: number;
    strength: number;
    history: number;
  };
  recommendations: string[];
}

export interface PerformanceInsight {
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  icon: string;
  actionable: boolean;
  recommendation?: string;
}

// ============================================
// PERFORMANCE LEVEL CALCULATION
// ============================================

/**
 * Calculate performance level based on value and benchmarks
 */
export function calculatePerformanceLevel(
  value: number,
  testName: string,
  category: "strength" | "speed" | "stamina"
): PerformanceLevel {
  // Type-safe benchmark lookup
  const categoryBenchmarks = ELITE_BENCHMARKS[category];
  const benchmarks =
    categoryBenchmarks[testName as keyof typeof categoryBenchmarks];

  if (!benchmarks) {
    return {
      level: "Average",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      percentage: 50,
      description: "No benchmark available",
    };
  }

  const { worldRecord, elite, good, average, lowerIsBetter } = benchmarks;

  let level: PerformanceLevel["level"];
  let color: string;
  let bgColor: string;
  let percentage: number;
  let description: string;

  if (lowerIsBetter) {
    // Lower values are better (e.g., sprint times)
    if (value <= worldRecord) {
      level = "World Class";
      color = "text-purple-600";
      bgColor = "bg-purple-50";
      percentage = 100;
      description = "Outstanding! World-class performance";
    } else if (value <= elite) {
      level = "Elite";
      color = "text-green-600";
      bgColor = "bg-green-50";
      percentage = 90;
      description = "Excellent! Elite level performance";
    } else if (value <= good) {
      level = "Good";
      color = "text-blue-600";
      bgColor = "bg-blue-50";
      percentage = 75;
      description = "Good performance, above average";
    } else if (value <= average) {
      level = "Average";
      color = "text-yellow-600";
      bgColor = "bg-yellow-50";
      percentage = 60;
      description = "Average performance";
    } else {
      level = "Below Average";
      color = "text-orange-600";
      bgColor = "bg-orange-50";
      percentage = 40;
      description = "Below average, room for improvement";
    }
  } else {
    // Higher values are better (e.g., jump height, VO2 max)
    if (value >= worldRecord) {
      level = "World Class";
      color = "text-purple-600";
      bgColor = "bg-purple-50";
      percentage = 100;
      description = "Outstanding! World-class performance";
    } else if (value >= elite) {
      level = "Elite";
      color = "text-green-600";
      bgColor = "bg-green-50";
      percentage = 90;
      description = "Excellent! Elite level performance";
    } else if (value >= good) {
      level = "Good";
      color = "text-blue-600";
      bgColor = "bg-blue-50";
      percentage = 75;
      description = "Good performance, above average";
    } else if (value >= average) {
      level = "Average";
      color = "text-yellow-600";
      bgColor = "bg-yellow-50";
      percentage = 60;
      description = "Average performance";
    } else {
      level = "Below Average";
      color = "text-orange-600";
      bgColor = "bg-orange-50";
      percentage = 40;
      description = "Below average, room for improvement";
    }
  }

  return { level, color, bgColor, percentage, description };
}

// ============================================
// ELITE COMPARISON
// ============================================

/**
 * Compare athlete's performance to elite benchmark
 */
export function compareToElite(
  athleteValue: number,
  testName: string,
  category: "strength" | "speed" | "stamina"
): EliteComparison {
  // Type-safe benchmark lookup
  const categoryBenchmarks = ELITE_BENCHMARKS[category];
  const benchmarks =
    categoryBenchmarks[testName as keyof typeof categoryBenchmarks];

  if (!benchmarks) {
    return {
      percentageOfElite: 100,
      difference: 0,
      differenceFormatted: "0",
      icon: "→",
      message: "No benchmark available",
      color: "text-gray-600",
    };
  }

  const { elite: eliteBenchmark, lowerIsBetter, unit } = benchmarks;

  const difference = lowerIsBetter
    ? eliteBenchmark - athleteValue
    : athleteValue - eliteBenchmark;

  const percentageOfElite = lowerIsBetter
    ? (eliteBenchmark / athleteValue) * 100
    : (athleteValue / eliteBenchmark) * 100;

  const icon: "↑" | "↓" | "→" =
    Math.abs(difference) < 0.01 ? "→" : difference > 0 ? "↑" : "↓";

  const absDiff = Math.abs(difference);
  const differenceFormatted = `${absDiff.toFixed(2)} ${unit}`;

  let message: string;
  let color: string;

  if (percentageOfElite >= 100) {
    message = lowerIsBetter
      ? `${differenceFormatted} faster than elite level`
      : `${differenceFormatted} above elite level`;
    color = "text-green-600";
  } else if (percentageOfElite >= 90) {
    message = lowerIsBetter
      ? `${differenceFormatted} slower than elite, but very close`
      : `${differenceFormatted} below elite, but very close`;
    color = "text-blue-600";
  } else if (percentageOfElite >= 75) {
    message = lowerIsBetter
      ? `${differenceFormatted} slower than elite level`
      : `${differenceFormatted} below elite level`;
    color = "text-yellow-600";
  } else {
    message = lowerIsBetter
      ? `${differenceFormatted} slower than elite - significant room for improvement`
      : `${differenceFormatted} below elite - significant room for improvement`;
    color = "text-orange-600";
  }

  return {
    percentageOfElite: Math.round(percentageOfElite),
    difference,
    differenceFormatted,
    icon,
    message,
    color,
  };
}

// ============================================
// TREND ANALYSIS
// ============================================

/**
 * Calculate trend between current and previous values
 */
export function calculateTrend(
  currentValue: number,
  previousValue: number,
  lowerIsBetter: boolean = false
): TrendAnalysis {
  const change = currentValue - previousValue;
  const absoluteChange = Math.abs(change);
  const percentageChange = (absoluteChange / previousValue) * 100;

  let trend: TrendAnalysis["trend"];

  // Consider changes < 2% as stable
  if (Math.abs(percentageChange) < 2) {
    trend = "stable";
  } else if (lowerIsBetter) {
    trend = change < 0 ? "improving" : "declining";
  } else {
    trend = change > 0 ? "improving" : "declining";
  }

  const icon =
    trend === "improving" ? "📈" : trend === "declining" ? "📉" : "➡️";
  const color =
    trend === "improving"
      ? "text-green-600"
      : trend === "declining"
      ? "text-red-600"
      : "text-gray-600";

  let message: string;
  if (trend === "improving") {
    message = `Improved by ${percentageChange.toFixed(1)}% from last test`;
  } else if (trend === "declining") {
    message = `Declined by ${percentageChange.toFixed(1)}% from last test`;
  } else {
    message = "Performance stable (< 2% change)";
  }

  return {
    trend,
    percentageChange,
    absoluteChange,
    icon,
    color,
    message,
  };
}

// ============================================
// STATISTICAL CALCULATIONS
// ============================================

/**
 * Calculate percentile rank using normal distribution
 */
export function calculatePercentile(
  value: number,
  mean: number,
  standardDeviation: number
): number {
  const z = (value - mean) / standardDeviation;
  const percentile = normalCDF(z) * 100;
  return Math.round(Math.max(0, Math.min(100, percentile)));
}

/**
 * Normal cumulative distribution function (CDF)
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

/**
 * Calculate Z-score (standard score)
 */
export function calculateZScore(
  value: number,
  mean: number,
  standardDeviation: number
): number {
  return (value - mean) / standardDeviation;
}

/**
 * Calculate coefficient of variation (CV)
 */
export function calculateCV(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);
  return (stdDev / mean) * 100;
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return values.filter((val) => val < lowerBound || val > upperBound);
}

// ============================================
// BODY COMPOSITION CALCULATIONS
// ============================================

/**
 * Calculate relative strength (strength per kg bodyweight)
 */
export function calculateRelativeStrength(
  absoluteStrength: number,
  bodyweight: number
): number {
  return absoluteStrength / bodyweight;
}

/**
 * Calculate power-to-weight ratio
 */
export function calculatePowerToWeightRatio(
  power: number,
  bodyweight: number
): number {
  return power / bodyweight;
}

/**
 * Calculate lean body mass
 */
export function calculateLeanBodyMass(
  bodyweight: number,
  bodyFatPercentage: number
): number {
  return bodyweight * (1 - bodyFatPercentage / 100);
}

/**
 * Calculate BMI category
 */
export function getBMICategory(bmi: number): {
  category: string;
  color: string;
  description: string;
} {
  if (bmi < 18.5) {
    return {
      category: "Underweight",
      color: "text-blue-600",
      description: "Below healthy weight range",
    };
  } else if (bmi < 25) {
    return {
      category: "Normal",
      color: "text-green-600",
      description: "Healthy weight range",
    };
  } else if (bmi < 30) {
    return {
      category: "Overweight",
      color: "text-yellow-600",
      description: "Above healthy weight range",
    };
  } else {
    return {
      category: "Obese",
      color: "text-red-600",
      description: "Significantly above healthy weight",
    };
  }
}

// ============================================
// INJURY RISK ASSESSMENT
// ============================================

/**
 * Calculate comprehensive injury risk score
 */
export function calculateInjuryRisk(
  flexibility: number,
  strength: number,
  previousInjuryCount: number,
  trainingLoad?: number
): InjuryRiskAssessment {
  // Factor calculations (0-1 scale)
  const flexibilityFactor = Math.max(0, 50 - flexibility) / 50;
  const strengthFactor = Math.max(0, 50 - strength) / 50;
  const injuryHistoryFactor = Math.min(previousInjuryCount / 5, 1);
  const trainingLoadFactor = trainingLoad
    ? Math.min(trainingLoad / 100, 1)
    : 0.5;

  // Weighted score (0-100)
  const score =
    (flexibilityFactor * 0.3 +
      strengthFactor * 0.25 +
      injuryHistoryFactor * 0.35 +
      trainingLoadFactor * 0.1) *
    100;

  let level: InjuryRiskAssessment["level"];
  let color: string;
  let bgColor: string;
  let recommendations: string[];

  if (score < 25) {
    level = "Low";
    color = "text-green-600";
    bgColor = "bg-green-50";
    recommendations = [
      "Maintain current training routine",
      "Continue flexibility work",
      "Monitor any discomfort",
    ];
  } else if (score < 50) {
    level = "Moderate";
    color = "text-yellow-600";
    bgColor = "bg-yellow-50";
    recommendations = [
      "Increase flexibility training",
      "Focus on injury prevention exercises",
      "Monitor training volume",
      "Consider sports massage",
    ];
  } else if (score < 75) {
    level = "High";
    color = "text-orange-600";
    bgColor = "bg-orange-50";
    recommendations = [
      "Prioritize flexibility and mobility work",
      "Reduce training intensity temporarily",
      "Strengthen weak areas",
      "Consult with sports therapist",
      "Review training program",
    ];
  } else {
    level = "Very High";
    color = "text-red-600";
    bgColor = "bg-red-50";
    recommendations = [
      "⚠️ Immediate consultation with sports medicine professional",
      "Significantly reduce training load",
      "Focus on rehabilitation exercises",
      "Address flexibility deficits urgently",
      "Review injury history with specialist",
    ];
  }

  return {
    score: Math.round(score),
    level,
    color,
    bgColor,
    factors: {
      flexibility: Math.round(flexibilityFactor * 100),
      strength: Math.round(strengthFactor * 100),
      history: Math.round(injuryHistoryFactor * 100),
    },
    recommendations,
  };
}

// ============================================
// PERFORMANCE INSIGHTS GENERATION
// ============================================

/**
 * Generate AI-powered insight based on test performance
 */
export function generateInsight(
  testName: string,
  performanceLevel: PerformanceLevel,
  comparison: EliteComparison
): PerformanceInsight {
  const { level, percentage } = performanceLevel;
  const { percentageOfElite } = comparison;

  let title: string;
  let message: string;
  let type: PerformanceInsight["type"];
  let icon: string;
  let actionable: boolean;
  let recommendation: string | undefined;

  if (level === "World Class") {
    title = "World-Class Performance! 🏆";
    message = `Your ${testName} is exceptional, performing at ${percentage}% of maximum potential and ${percentageOfElite}% of elite standards.`;
    type = "success";
    icon = "🏆";
    actionable = false;
  } else if (level === "Elite") {
    title = "Elite Performance! ⭐";
    message = `Outstanding ${testName}! You're in the top 10% of athletes. Keep up the excellent training.`;
    type = "success";
    icon = "⭐";
    actionable = true;
    recommendation =
      "Focus on consistency and minor technique refinements to reach world-class level.";
  } else if (level === "Good") {
    title = "Above Average Performance ✅";
    message = `Your ${testName} is solid at ${percentageOfElite}% of elite level. You have clear potential for improvement.`;
    type = "info";
    icon = "✅";
    actionable = true;
    recommendation =
      "Targeted training in this area could help you reach elite status. Consider working with a specialist coach.";
  } else if (level === "Average") {
    title = "Average Performance 📊";
    message = `Your ${testName} is at ${percentage}% capacity. This is a key area for improvement to elevate your overall performance.`;
    type = "warning";
    icon = "📊";
    actionable = true;
    recommendation =
      "Prioritize this in your training program. Consistent work here will yield significant gains.";
  } else {
    title = "Needs Attention ⚠️";
    message = `Your ${testName} is below average at ${percentageOfElite}% of elite level. This represents a significant opportunity for improvement.`;
    type = "error";
    icon = "⚠️";
    actionable = true;
    recommendation =
      "Focus intensive training here. Consider professional guidance to address fundamentals and build a strong foundation.";
  }

  return {
    title,
    message,
    type,
    icon,
    actionable,
    recommendation,
  };
}

/**
 * Generate comprehensive performance summary
 */
export function generatePerformanceSummary(
  strengthScore: number,
  speedScore: number,
  staminaScore: number
): {
  overall: string;
  strengths: string[];
  weaknesses: string[];
  priority: string;
} {
  const scores = [
    { name: "Strength", value: strengthScore },
    { name: "Speed", value: speedScore },
    { name: "Stamina", value: staminaScore },
  ].sort((a, b) => b.value - a.value);

  const avgScore = (strengthScore + speedScore + staminaScore) / 3;

  let overall: string;
  if (avgScore >= 80) {
    overall =
      "Excellent overall performance profile with well-rounded capabilities.";
  } else if (avgScore >= 65) {
    overall = "Good overall performance with room for targeted improvements.";
  } else if (avgScore >= 50) {
    overall =
      "Average performance profile with significant improvement potential.";
  } else {
    overall =
      "Developing performance profile - focus on building fundamentals across all areas.";
  }

  const strengths = scores
    .slice(0, 2)
    .map((s) => `${s.name} (${s.value.toFixed(1)}%)`);

  const weaknesses = scores
    .slice(-1)
    .map((s) => `${s.name} (${s.value.toFixed(1)}%)`);

  const priority = `Focus on improving ${scores[2].name} to create a more balanced athletic profile.`;

  return {
    overall,
    strengths,
    weaknesses,
    priority,
  };
}
