import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSportColor } from "@/lib/design-system/utils";
import type { SportType } from "@/lib/design-system/constants";

interface SportBadgeProps {
  sport: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SportBadge({
  sport,
  variant = "primary",
  size = "md",
  className,
}: SportBadgeProps) {
  const color = getSportColor(sport);
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 h-5",
    md: "text-sm px-3 py-1 h-7",
    lg: "text-base px-4 py-1.5 h-9",
  };

  const variantStyles = {
    primary: `bg-[${color}]15 text-[${color}] border-[${color}]`,
    secondary: `bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200`,
  };

  return (
    <Badge
      className={cn(
        "font-semibold uppercase tracking-wide shadow-md",
        sizeClasses[size],
        variantStyles[variant],
        className
      )}
    >
      {sport}
    </Badge>
  );
}
