// components/stats/shared/MetricGrid.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MetricGridProps {
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export function MetricGrid({
  columns = 3,
  gap = "md",
  children,
  className,
}: MetricGridProps) {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div
      className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
    >
      {children}
    </div>
  );
}
