// components/stats/shared/PerformanceBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PerformanceLevel } from "../../../lib/utils/performanceCalculations";

interface PerformanceBadgeProps {
  performance: PerformanceLevel;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PerformanceBadge({
  performance,
  showPercentage = false,
  size = "md",
  className,
}: PerformanceBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const getIcon = (level: string) => {
    switch (level) {
      case "World Class":
        return "🏆";
      case "Elite":
        return "⭐";
      case "Good":
        return "✅";
      case "Average":
        return "📊";
      case "Below Average":
        return "⚠️";
      default:
        return "";
    }
  };

  return (
    <Badge
      className={cn(
        "font-semibold",
        performance.bgColor,
        performance.color,
        sizeClasses[size],
        className
      )}
    >
      <span className="mr-1">{getIcon(performance.level)}</span>
      {performance.level}
      {showPercentage && (
        <span className="ml-1 opacity-80">({performance.percentage}%)</span>
      )}
    </Badge>
  );
}
