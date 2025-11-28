// components/stats/shared/ProgressRing.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  percentage: number;
  size?: "sm" | "md" | "lg" | "xl";
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = "md",
  strokeWidth,
  color,
  label,
  showPercentage = true,
  className,
}: ProgressRingProps) {
  const sizes = {
    sm: { dimension: 60, stroke: 4, text: "text-xs" },
    md: { dimension: 100, stroke: 6, text: "text-sm" },
    lg: { dimension: 140, stroke: 8, text: "text-base" },
    xl: { dimension: 180, stroke: 10, text: "text-lg" },
  };

  const config = sizes[size];
  const finalStrokeWidth = strokeWidth || config.stroke;
  const radius = (config.dimension - finalStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Get color based on percentage if not provided
  const getColor = () => {
    if (color) return color;
    if (percentage >= 90) return "#9333ea"; // purple
    if (percentage >= 75) return "#16a34a"; // green
    if (percentage >= 60) return "#2563eb"; // blue
    if (percentage >= 40) return "#ca8a04"; // yellow
    return "#ea580c"; // orange
  };

  const strokeColor = getColor();

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <svg
        width={config.dimension}
        height={config.dimension}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={finalStrokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={finalStrokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        {/* Center text */}
        {showPercentage && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy="0.3em"
            className={cn("font-bold transform rotate-90", config.text)}
            fill={strokeColor}
          >
            {Math.round(percentage)}%
          </text>
        )}
      </svg>
      {label && (
        <span className="text-sm font-medium text-gray-700 text-center">
          {label}
        </span>
      )}
    </div>
  );
}
