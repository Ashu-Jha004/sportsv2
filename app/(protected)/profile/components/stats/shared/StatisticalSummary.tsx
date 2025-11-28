// components/stats/shared/StatisticalSummary.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MetricDisplay } from "./MetricDisplay";
import { MetricGrid } from "./MetricGrid";

interface StatisticalData {
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  range?: number;
  cv?: number;
  variance?: number;
  [key: string]: number | undefined;
}

interface StatisticalSummaryProps {
  data: StatisticalData;
  unit?: string;
  decimals?: number;
  className?: string;
}

export function StatisticalSummary({
  data,
  unit = "",
  decimals = 2,
  className,
}: StatisticalSummaryProps) {
  const metrics: Array<{
    label: string;
    value: number | undefined;
    tooltip: string;
    show: boolean;
  }> = [
    {
      label: "Mean",
      value: data.mean,
      tooltip: "Average value across all measurements",
      show: data.mean !== undefined,
    },
    {
      label: "Median",
      value: data.median,
      tooltip: "Middle value when measurements are sorted",
      show: data.median !== undefined,
    },
    {
      label: "Std Dev",
      value: data.stdDev,
      tooltip: "Standard deviation - measure of variability",
      show: data.stdDev !== undefined,
    },
    {
      label: "Min",
      value: data.min,
      tooltip: "Lowest recorded value",
      show: data.min !== undefined,
    },
    {
      label: "Max",
      value: data.max,
      tooltip: "Highest recorded value",
      show: data.max !== undefined,
    },
    {
      label: "Range",
      value: data.range,
      tooltip: "Difference between max and min",
      show: data.range !== undefined,
    },
    {
      label: "CV",
      value: data.cv,
      tooltip: "Coefficient of variation - relative variability",
      show: data.cv !== undefined,
    },
  ];

  const visibleMetrics = metrics.filter((m) => m.show);

  if (visibleMetrics.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>📊</span>
        Statistical Summary
      </h4>
      <MetricGrid columns={3} gap="sm">
        {visibleMetrics.map((metric) => (
          <MetricDisplay
            key={metric.label}
            label={metric.label}
            value={metric.value!.toFixed(decimals)}
            unit={metric.label === "CV" ? "%" : unit}
            tooltip={metric.tooltip}
            size="sm"
          />
        ))}
      </MetricGrid>
    </div>
  );
}
