// lib/utils/formatting.ts
"use client";

import { format, formatDistanceToNow, differenceInDays } from "date-fns";

/**
 * Formatting utilities for display
 * Dates, numbers, units, colors, and visual helpers
 */

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format test date in human-readable format
 */
export function formatTestDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  } catch {
    return "Date unknown";
  }
}

/**
 * Format test time (hour and minute)
 */
export function formatTestTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  } catch {
    return "";
  }
}

/**
 * Format date with time combined
 */
export function formatTestDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy • h:mm a");
  } catch {
    return "Date unknown";
  }
}

/**
 * Format date with relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Unknown time";
  }
}

/**
 * Get time ago in short format
 */
export function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const days = differenceInDays(new Date(), date);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  } catch {
    return "Unknown";
  }
}

/**
 * Format date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
  } catch {
    return "Invalid date range";
  }
}

// ============================================
// NUMBER FORMATTING
// ============================================

/**
 * Format number with decimals
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return "0.00";
  return value.toFixed(decimals);
}

/**
 * Format number with commas (e.g., 1,234.56)
 */
export function formatNumberWithCommas(
  value: number,
  decimals: number = 0
): string {
  if (isNaN(value)) return "0";
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M suffix
 */
export function formatCompactNumber(value: number): string {
  if (isNaN(value)) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

/**
 * Format ratio (e.g., 1.5:1)
 */
export function formatRatio(numerator: number, denominator: number): string {
  if (denominator === 0) return "N/A";
  return `${(numerator / denominator).toFixed(2)}:1`;
}

// ============================================
// UNIT FORMATTING
// ============================================

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format seconds to readable text (e.g., "2 min 30 sec")
 */
export function formatDurationText(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0 seconds";

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Format weight (kg)
 */
export function formatWeight(kg: number): string {
  if (isNaN(kg)) return "0 kg";
  return `${kg.toFixed(1)} kg`;
}

/**
 * Format weight with lbs option
 */
export function formatWeightWithUnit(
  kg: number,
  unit: "kg" | "lbs" = "kg"
): string {
  if (isNaN(kg)) return "0 kg";
  if (unit === "lbs") {
    const lbs = kg * 2.20462;
    return `${lbs.toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

/**
 * Format distance (meters)
 */
export function formatDistance(meters: number): string {
  if (isNaN(meters)) return "0 m";
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${meters.toFixed(0)} m`;
}

/**
 * Format height (cm)
 */
export function formatHeight(cm: number): string {
  if (isNaN(cm)) return "0 cm";
  return `${cm} cm`;
}

/**
 * Format height with ft/in option
 */
export function formatHeightWithUnit(
  cm: number,
  unit: "cm" | "ft" = "cm"
): string {
  if (isNaN(cm)) return "0 cm";
  if (unit === "ft") {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
}

/**
 * Format speed (m/s or km/h)
 */
export function formatSpeed(
  metersPerSecond: number,
  unit: "m/s" | "km/h" = "m/s"
): string {
  if (isNaN(metersPerSecond)) return "0 m/s";
  if (unit === "km/h") {
    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  }
  return `${metersPerSecond.toFixed(2)} m/s`;
}

/**
 * Format power (watts)
 */
export function formatPower(watts: number): string {
  if (isNaN(watts)) return "0 W";
  if (watts >= 1000) {
    return `${(watts / 1000).toFixed(2)} kW`;
  }
  return `${watts.toFixed(0)} W`;
}

/**
 * Format velocity (m/s)
 */
export function formatVelocity(ms: number): string {
  if (isNaN(ms)) return "0 m/s";
  return `${ms.toFixed(2)} m/s`;
}

/**
 * Format VO2 Max
 */
export function formatVO2Max(value: number): string {
  if (isNaN(value)) return "0 ml/kg/min";
  return `${value.toFixed(1)} ml/kg/min`;
}

/**
 * Format heart rate
 */
export function formatHeartRate(bpm: number): string {
  if (isNaN(bpm)) return "0 bpm";
  return `${Math.round(bpm)} bpm`;
}

/**
 * Format angle (degrees)
 */
export function formatAngle(degrees: number): string {
  if (isNaN(degrees)) return "0°";
  return `${degrees.toFixed(1)}°`;
}

// ============================================
// COLOR & STYLE HELPERS
// ============================================

/**
 * Get color class based on performance score (0-100)
 */
export function getPerformanceColor(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (score >= 90) {
    return {
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    };
  }
  if (score >= 75) {
    return {
      text: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    };
  }
  if (score >= 60) {
    return {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    };
  }
  if (score >= 40) {
    return {
      text: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    };
  }
  return {
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  };
}

/**
 * Get badge variant based on performance level
 */
export function getPerformanceBadgeVariant(
  level: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (level.toLowerCase()) {
    case "world class":
    case "elite":
      return "default";
    case "good":
    case "above average":
      return "secondary";
    case "below average":
    case "poor":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * Get trend color based on direction
 */
export function getTrendColor(trend: "improving" | "declining" | "stable"): {
  text: string;
  bg: string;
  icon: string;
} {
  switch (trend) {
    case "improving":
      return {
        text: "text-green-600",
        bg: "bg-green-50",
        icon: "📈",
      };
    case "declining":
      return {
        text: "text-red-600",
        bg: "bg-red-50",
        icon: "📉",
      };
    case "stable":
      return {
        text: "text-gray-600",
        bg: "bg-gray-50",
        icon: "➡️",
      };
  }
}

/**
 * Get progress bar color class
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage >= 90) return "bg-purple-500";
  if (percentage >= 75) return "bg-green-500";
  if (percentage >= 60) return "bg-blue-500";
  if (percentage >= 40) return "bg-yellow-500";
  return "bg-orange-500";
}

/**
 * Get gradient background for score cards
 */
export function getScoreGradient(score: number): string {
  if (score >= 90) return "from-purple-500 to-purple-600";
  if (score >= 75) return "from-green-500 to-green-600";
  if (score >= 60) return "from-blue-500 to-blue-600";
  if (score >= 40) return "from-yellow-500 to-yellow-600";
  return "from-orange-500 to-orange-600";
}

// ============================================
// TEXT HELPERS
// ============================================

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(text: string): string {
  return text
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(text: string): string {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Pluralize word based on count
 */
export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

/**
 * Format test name for display
 */
export function formatTestName(testName: string): string {
  // Handle snake_case
  if (testName.includes("_")) {
    return snakeToTitle(testName);
  }
  // Handle camelCase
  return camelToTitle(testName);
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if value is valid number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is valid date
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Safe number parse
 */
export function safeParseNumber(value: any, fallback: number = 0): number {
  const parsed = parseFloat(value);
  return isValidNumber(parsed) ? parsed : fallback;
}

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Format range display
 */
export function formatRange(
  min: number,
  max: number,
  unit: string = ""
): string {
  return `${formatNumber(min)} - ${formatNumber(max)}${unit ? " " + unit : ""}`;
}

/**
 * Format comparison text
 */
export function formatComparison(
  value: number,
  benchmark: number,
  lowerIsBetter: boolean = false
): string {
  const diff = Math.abs(value - benchmark);
  const better = lowerIsBetter ? value < benchmark : value > benchmark;

  if (diff < 0.01) return "Equal to benchmark";

  return better
    ? `${formatNumber(diff)} better than benchmark`
    : `${formatNumber(diff)} below benchmark`;
}

/**
 * Get icon for metric type
 */
export function getMetricIcon(metricType: string): string {
  const icons: Record<string, string> = {
    strength: "💪",
    power: "⚡",
    speed: "⚡",
    agility: "🏃",
    stamina: "❤️",
    endurance: "🔋",
    flexibility: "🤸",
    reaction: "⚡",
    jump: "🦘",
    sprint: "💨",
    distance: "📏",
    time: "⏱️",
    weight: "⚖️",
    heart: "❤️",
    vo2: "🫁",
    injury: "🏥",
  };

  return icons[metricType.toLowerCase()] || "📊";
}

/**
 * Format list with proper grammar
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(", ")}, and ${lastItem}`;
}

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format attempt label
 */
export function formatAttemptLabel(
  attemptNumber: number,
  total: number
): string {
  return `Attempt ${attemptNumber}/${total}`;
}

/**
 * Format trial label
 */
export function formatTrialLabel(trialNumber: number): string {
  return `Trial ${trialNumber}`;
}
