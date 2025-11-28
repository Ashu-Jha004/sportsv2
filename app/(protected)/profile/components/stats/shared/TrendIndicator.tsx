// components/stats/shared/TrendIndicator.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TrendAnalysis } from "../../../lib/utils/performanceCalculations";
import { getTrendColor } from "../../../lib/utils/formatting";

interface TrendIndicatorProps {
  trend: TrendAnalysis;
  showMessage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrendIndicator({
  trend,
  showMessage = false,
  size = "md",
  className,
}: TrendIndicatorProps) {
  const { icon, color, message, percentageChange } = trend;
  const trendColors = getTrendColor(trend.trend);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold",
          trendColors.bg,
          color,
          sizeClasses[size]
        )}
      >
        <span>{icon}</span>
        <span>
          {trend.trend === "stable"
            ? "Stable"
            : `${percentageChange.toFixed(1)}%`}
        </span>
      </div>
      {showMessage && (
        <p className={cn("text-xs font-medium", color)}>{message}</p>
      )}
    </div>
  );
}
