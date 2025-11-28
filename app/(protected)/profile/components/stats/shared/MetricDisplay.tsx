// components/stats/shared/MetricDisplay.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  tooltip?: string;
  className?: string;
}

export function MetricDisplay({
  label,
  value,
  unit,
  icon,
  color = "text-gray-900",
  size = "md",
  tooltip,
  className,
}: MetricDisplayProps) {
  const sizeClasses = {
    sm: {
      container: "p-2",
      value: "text-lg",
      label: "text-xs",
    },
    md: {
      container: "p-3",
      value: "text-2xl",
      label: "text-sm",
    },
    lg: {
      container: "p-4",
      value: "text-3xl",
      label: "text-base",
    },
  };

  return (
    <div
      className={cn(
        "rounded-lg bg-gray-50 border border-gray-100",
        sizeClasses[size].container,
        className
      )}
    >
      <div className="flex items-center gap-1 mb-1">
        <span
          className={cn("text-gray-600 font-medium", sizeClasses[size].label)}
        >
          {label}
        </span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div
        className={cn(
          "font-bold flex items-baseline gap-1",
          color,
          sizeClasses[size].value
        )}
      >
        {icon && <span className="text-xl">{icon}</span>}
        <span>{value}</span>
        {unit && (
          <span className="text-sm font-normal text-gray-500">{unit}</span>
        )}
      </div>
    </div>
  );
}
