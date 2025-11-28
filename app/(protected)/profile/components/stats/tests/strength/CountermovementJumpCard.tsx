// components/stats/tests/strength/CountermovementJumpCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { AttemptsTable } from "../../shared/AttemptsTable";
import { ComparisonBar } from "../../shared/ComparisonBar";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { InsightCard } from "../../shared/InsightCard";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { CountermovementJumpTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { TrendingUp } from "lucide-react";
import {
  formatNumber,
  formatPower,
  formatVelocity,
} from "../../../../lib/utils/formatting";
import {
  calculatePerformanceLevel,
  compareToElite,
  generateInsight,
} from "../../../../lib/utils/performanceCalculations";

interface CountermovementJumpCardProps {
  data: CountermovementJumpTest;
  recordedAt: string;
}

export function CountermovementJumpCard({
  data,
  recordedAt,
}: CountermovementJumpCardProps) {
  const { attempts, bestAttempt } = data;

  // Calculate performance level
  const performanceLevel = calculatePerformanceLevel(
    bestAttempt.jumpHeight,
    "countermovementJump",
    "strength"
  );

  const eliteComparison = compareToElite(
    bestAttempt.jumpHeight,
    "countermovementJump",
    "strength"
  );

  const insight = generateInsight(
    "Countermovement Jump",
    performanceLevel,
    eliteComparison
  );

  // Find best attempt index
  const bestAttemptIndex = attempts.findIndex(
    (a) => a.attemptNumber === bestAttempt.attemptNumber
  );

  return (
    <StatCard
      title="Countermovement Jump"
      icon={TrendingUp}
      iconColor="text-purple-600"
      recordedAt={recordedAt}
      badge={{
        label: performanceLevel.level,
        color: performanceLevel.color,
      }}
      collapsible
      defaultExpanded={true}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Best Performance Metrics
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Jump Height"
              value={formatNumber(bestAttempt.jumpHeight, 2)}
              unit="cm"
              icon="🦘"
              color="text-purple-600"
              size="md"
              tooltip="Vertical jump height achieved"
            />
            <MetricDisplay
              label="Peak Power"
              value={formatNumber(bestAttempt.peakPower, 0)}
              unit="W"
              icon="⚡"
              color="text-blue-600"
              size="md"
              tooltip="Maximum power output during jump"
            />
            <MetricDisplay
              label="Peak Velocity"
              value={formatNumber(bestAttempt.peakVelocity, 2)}
              unit="m/s"
              icon="🚀"
              color="text-green-600"
              size="md"
              tooltip="Maximum takeoff velocity"
            />
            <MetricDisplay
              label="Relative Power"
              value={formatNumber(bestAttempt.relativePeakPower, 1)}
              unit="W/kg"
              icon="📊"
              color="text-orange-600"
              size="md"
              tooltip="Power output per kilogram of body weight"
            />
          </MetricGrid>
        </div>

        {/* Performance Badge */}
        <div className="flex justify-center">
          <PerformanceBadge performance={performanceLevel} showPercentage />
        </div>

        {/* Elite Comparison */}
        <ComparisonBar comparison={eliteComparison} />

        {/* Insight */}
        <InsightCard insight={insight} />

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "All Attempts",
              icon: "📋",
              content: (
                <AttemptsTable
                  attempts={attempts}
                  columns={[
                    {
                      key: "attemptNumber",
                      label: "#",
                      align: "center",
                    },
                    {
                      key: "load",
                      label: "Load (kg)",
                      align: "right",
                      format: (value) => formatNumber(value, 0),
                    },
                    {
                      key: "standingReach",
                      label: "Standing Reach (cm)",
                      align: "right",
                      format: (value) => formatNumber(value, 0),
                    },
                    {
                      key: "jumpReach",
                      label: "Jump Reach (cm)",
                      align: "right",
                      format: (value) => formatNumber(value, 0),
                    },
                    {
                      key: "flightTime",
                      label: "Flight Time (s)",
                      align: "right",
                      format: (value) => formatNumber(value, 3),
                    },
                  ]}
                  bestAttemptIndex={bestAttemptIndex}
                />
              ),
            },
            {
              title: "Power Analysis",
              icon: "⚡",
              content: (
                <div className="space-y-4">
                  <MetricGrid columns={2} gap="sm">
                    <MetricDisplay
                      label="Absolute Peak Power"
                      value={formatNumber(bestAttempt.peakPower, 0)}
                      unit="W"
                      size="sm"
                    />
                    <MetricDisplay
                      label="Relative Peak Power"
                      value={formatNumber(bestAttempt.relativePeakPower, 1)}
                      unit="W/kg"
                      size="sm"
                    />
                  </MetricGrid>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-900">
                      <strong>Analysis:</strong> Peak power is a key indicator
                      of explosive strength. Higher relative power (W/kg)
                      indicates better power-to-weight ratio, crucial for
                      athletic performance.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: "Technical Details",
              icon: "🔬",
              content: (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">
                      Jump Height Calculation
                    </p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                      h = (v² / 2g)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Where v is takeoff velocity and g is gravity (9.81 m/s²)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Power Calculation</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                      P = F × v
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Force (mass × acceleration) multiplied by velocity
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: "Raw Data",
              icon: "💾",
              content: <RawDataViewer data={data} />,
            },
          ]}
          defaultOpen={[]}
        />
      </div>
    </StatCard>
  );
}
