// components/stats/shared/StatCard.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTestDateTime, getTimeAgo } from "../../../lib/utils/formatting";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  recordedAt?: string;
  conductedBy?: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    color?: string;
  };
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function StatCard({
  title,
  icon: Icon,
  iconColor = "text-blue-600",
  recordedAt,
  conductedBy,
  badge,
  children,
  className,
  collapsible = false,
  defaultExpanded = true,
}: StatCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {Icon && (
              <div className={cn("p-2 rounded-lg bg-gray-50", iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {recordedAt && (
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>📅 {formatTestDateTime(recordedAt)}</span>
                  <span className="text-gray-300">•</span>
                  <span>{getTimeAgo(recordedAt)}</span>
                </div>
              )}
              {conductedBy && (
                <p className="text-xs text-gray-500 mt-0.5">
                  👤 Conducted by: {conductedBy}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {badge && (
              <Badge
                variant={badge.variant || "default"}
                className={cn("text-xs", badge.color)}
              >
                {badge.label}
              </Badge>
            )}

            {collapsible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                <svg
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isExpanded ? "rotate-180" : ""
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      {(!collapsible || isExpanded) && (
        <CardContent className="pt-0">{children}</CardContent>
      )}
    </Card>
  );
}
