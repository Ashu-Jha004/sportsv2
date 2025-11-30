import { SPORT_BANNERS, SportType, SPORT_COLORS } from "./constants";

// Sport banner utility
export function getSportBanner(sport: string | undefined): string {
  if (!sport) return SPORT_BANNERS.DEFAULT;
  const sportUpper = sport.toUpperCase() as SportType;
  return SPORT_BANNERS[sportUpper] || SPORT_BANNERS.DEFAULT;
}

// Sport color utility
export function getSportColor(sport: string): string {
  const sportUpper = sport.toUpperCase() as SportType;
  return SPORT_COLORS[sportUpper] || SPORT_COLORS.DEFAULT;
}

// Format numbers for display (1.2K, 5.6M)
export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
}

// Format dates
export function formatDate(
  date: string | Date | undefined,
  style: "short" | "medium" | "long" = "medium"
): string {
  if (!date) return "Recently";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "Recently";

  const options: Intl.DateTimeFormatOptions = {
    ...(style === "short" && { month: "short", year: "numeric" }),
    ...(style === "medium" && { month: "long", year: "numeric" }),
    ...(style === "long" && { month: "long", year: "numeric", day: "numeric" }),
  };

  return dateObj.toLocaleDateString("en-US", options);
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
