import type { StatsSnapshot } from "@/types/ai.types";

// Utility: Validate stats snapshot
export function validateStatsSnapshot(stats: any): stats is StatsSnapshot {
  return (
    stats &&
    typeof stats.athleteId === "string" &&
    typeof stats.athleteName === "string" &&
    typeof stats.recordedAt === "string" &&
    stats.categories &&
    typeof stats.categories === "object"
  );
}

// Utility: Sanitize user input
export function sanitizeUserInput(input: any): string {
  // Convert to string if not already
  const str = typeof input === "string" ? input : String(input || "");

  return str
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, 4000); // Hard limit
}
