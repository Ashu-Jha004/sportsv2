// components/stats/shared/InsightCard.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, Info } from "lucide-react";
import type { PerformanceInsight } from "../../../lib/utils/performanceCalculations";

interface InsightCardProps {
  insight: PerformanceInsight;
  className?: string;
}

export function InsightCard({ insight, className }: InsightCardProps) {
  const getVariantStyles = () => {
    switch (insight.type) {
      case "success":
        return {
          container: "border-green-200 bg-green-50",
          icon: <TrendingUp className="h-5 w-5 text-green-600" />,
          titleColor: "text-green-900",
          descColor: "text-green-800",
        };
      case "warning":
        return {
          container: "border-yellow-200 bg-yellow-50",
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          titleColor: "text-yellow-900",
          descColor: "text-yellow-800",
        };
      case "error":
        return {
          container: "border-red-200 bg-red-50",
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          titleColor: "text-red-900",
          descColor: "text-red-800",
        };
      case "info":
      default:
        return {
          container: "border-blue-200 bg-blue-50",
          icon: <Info className="h-5 w-5 text-blue-600" />,
          titleColor: "text-blue-900",
          descColor: "text-blue-800",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Alert className={cn(styles.container, "border-2", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{styles.icon}</div>
        <div className="flex-1 space-y-2">
          <AlertTitle className={cn("font-bold text-base", styles.titleColor)}>
            {insight.icon} {insight.title}
          </AlertTitle>
          <AlertDescription className={cn("text-sm", styles.descColor)}>
            {insight.message}
          </AlertDescription>
          {insight.recommendation && insight.actionable && (
            <div className="mt-3 pt-3 border-t border-current/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold mb-1">Recommendation:</p>
                  <p className="text-sm">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}
