// components/stats/shared/SectionHeader.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("p-2 rounded-lg bg-gray-50", iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
