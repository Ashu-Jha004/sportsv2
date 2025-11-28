// components/stats/shared/ComparisonBar.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { EliteComparison } from "../../../lib/utils/performanceCalculations";
import { getProgressBarColor } from "../../../lib/utils/formatting";

interface ComparisonBarProps {
  comparison: EliteComparison;
  athleteName?: string;
  className?: string;
}

export function ComparisonBar({
  comparison,
  athleteName = "You",
  className,
}: ComparisonBarProps) {
  const { percentageOfElite, message, icon, color } = comparison;
  const clampedPercentage = Math.min(Math.max(percentageOfElite, 0), 150); // Cap at 150%

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {athleteName} vs Elite
        </span>
        <span className={cn("font-semibold", color)}>
          {icon} {percentageOfElite}%
        </span>
      </div>

      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        {/* Elite benchmark line */}
        <div className="absolute left-0 top-0 bottom-0 w-full flex items-center">
          <div className="absolute left-0 h-full w-full opacity-20 bg-linear-to-r from-gray-300 to-green-500" />
          <div className="absolute left-full h-full w-px bg-green-600 -ml-px">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-green-600 whitespace-nowrap">
              Elite
            </div>
          </div>
        </div>

        {/* Athlete progress bar */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out rounded-full",
            getProgressBarColor(percentageOfElite)
          )}
          style={{ width: `${Math.min(clampedPercentage, 100)}%` }}
        >
          <div className="h-full flex items-center justify-end pr-2">
            <span className="text-xs font-bold text-white drop-shadow">
              {athleteName}
            </span>
          </div>
        </div>
      </div>

      <p className={cn("text-xs font-medium", color)}>{message}</p>
    </div>
  );
}
