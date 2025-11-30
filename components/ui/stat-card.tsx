"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const variantClasses = {
    default: "border-blue-200 bg-blue-50/50",
    success: "border-green-200 bg-green-50/50",
    warning: "border-orange-200 bg-orange-50/50",
    error: "border-red-200 bg-red-50/50",
  };

  const iconVariantClasses = {
    default: "text-blue-600",
    success: "text-green-600",
    warning: "text-orange-600",
    error: "text-red-600",
  };

  return (
    <Card
      className={cn(
        "p-4 border-2 transition-all duration-200 hover:shadow-md",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-semibold mt-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-2 rounded-lg bg-white/80",
            iconVariantClasses[variant]
          )}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
    </Card>
  );
}
