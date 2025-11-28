// components/stats/shared/TrialsChart.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "../../../lib/utils/formatting";

interface DataPoint {
  trial: number;
  value: number;
  label?: string;
}

interface TrialsChartProps {
  data: DataPoint[];
  unit?: string;
  yAxisLabel?: string;
  highlightBest?: boolean;
  className?: string;
}

export function TrialsChart({
  data,
  unit = "",
  yAxisLabel = "Value",
  highlightBest = true,
  className,
}: TrialsChartProps) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  const bestIndex = values.indexOf(highlightBest ? Math.max(...values) : -1);

  // Add padding to the range
  const paddedMax = maxValue + range * 0.1;
  const paddedMin = minValue - range * 0.1;
  const paddedRange = paddedMax - paddedMin;

  // Calculate point positions
  const getX = (index: number) => {
    const width = 100; // percentage
    return (index / (data.length - 1)) * width;
  };

  const getY = (value: number) => {
    const height = 100; // percentage
    return height - ((value - paddedMin) / paddedRange) * height;
  };

  // Generate SVG path
  const pathData = data
    .map((point, index) => {
      const x = getX(index);
      const y = getY(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Trial Progression
        </h4>
        <span className="text-xs text-gray-500">{yAxisLabel}</span>
      </div>

      <div className="relative h-48 bg-gray-50 rounded-lg border border-gray-200 p-4">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}

          {/* Area under curve */}
          <path
            d={`${pathData} L ${getX(data.length - 1)} 100 L 0 100 Z`}
            fill="url(#gradient)"
            opacity="0.2"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data points */}
          {data.map((point, index) => (
            <g key={index}>
              <circle
                cx={getX(index)}
                cy={getY(point.value)}
                r={index === bestIndex ? "3" : "2"}
                fill={index === bestIndex ? "#16a34a" : "#3b82f6"}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{formatNumber(paddedMax, 1)}</span>
          <span>{formatNumber((paddedMax + paddedMin) / 2, 1)}</span>
          <span>{formatNumber(paddedMin, 1)}</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-500 pt-2">
          {data.map((point, index) => (
            <span key={index}>T{point.trial}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-gray-600">Trial Value</span>
        </div>
        {highlightBest && (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-gray-600">Best Performance</span>
          </div>
        )}
      </div>
    </div>
  );
}
