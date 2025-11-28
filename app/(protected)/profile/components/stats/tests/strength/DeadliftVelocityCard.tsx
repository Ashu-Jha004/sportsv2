// components/stats/tests/strength/DeadliftVelocityCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { ComparisonBar } from "../../shared/ComparisonBar";
import type { DeadliftVelocityTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { TrendingUp } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import {
  calculatePerformanceLevel,
  compareToElite,
} from "../../../../lib/utils/performanceCalculations";

interface DeadliftVelocityCardProps {
  data: DeadliftVelocityTest;
  recordedAt: string;
}

export function DeadliftVelocityCard({
  data,
  recordedAt,
}: DeadliftVelocityCardProps) {
  const performanceLevel = calculatePerformanceLevel(
    data.oneRepMaxKg,
    "deadlift",
    "strength"
  );

  const eliteComparison = compareToElite(
    data.oneRepMaxKg,
    "deadlift",
    "strength"
  );

  return (
    <StatCard
      title="Deadlift Velocity"
      icon={TrendingUp}
      iconColor="text-indigo-600"
      recordedAt={recordedAt}
      badge={{
        label: performanceLevel.level,
        color: performanceLevel.color,
      }}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Strength Performance
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Estimated 1RM"
              value={formatNumber(data.oneRepMaxKg, 1)}
              unit="kg"
              icon="🏋️"
              color="text-indigo-600"
              tooltip="Estimated one-rep maximum"
            />
            <MetricDisplay
              label="Load Used"
              value={formatNumber(data.loadUsedKg, 1)}
              unit="kg"
              icon="⚖️"
              color="text-blue-600"
            />
            <MetricDisplay
              label="Peak Velocity"
              value={formatNumber(data.peakVelocity, 2)}
              unit="m/s"
              icon="🚀"
              color="text-green-600"
              tooltip="Maximum bar velocity"
            />
            <MetricDisplay
              label="Power"
              value={formatNumber(data.power, 0)}
              unit="W"
              icon="⚡"
              color="text-orange-600"
            />
          </MetricGrid>
        </div>

        {/* Relative Strength */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200">
            <h5 className="text-sm font-semibold text-indigo-900 mb-2">
              Relative Strength
            </h5>
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {formatNumber(data.relativeStrength, 2)}×
            </div>
            <p className="text-sm text-indigo-700">
              {formatNumber(data.oneRepMaxKg, 1)} kg ÷{" "}
              {formatNumber(data.bodyWeight, 1)} kg
            </p>
            <div className="mt-3 p-2 bg-white rounded text-xs">
              {data.relativeStrength >= 2.5 && "Elite strength levels 🏆"}
              {data.relativeStrength >= 2.0 &&
                data.relativeStrength < 2.5 &&
                "Advanced strength ⭐"}
              {data.relativeStrength >= 1.5 &&
                data.relativeStrength < 2.0 &&
                "Intermediate level 💪"}
              {data.relativeStrength < 1.5 && "Building strength foundation 📈"}
            </div>
          </div>

          <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
            <h5 className="text-sm font-semibold text-green-900 mb-2">
              Velocity to Load Ratio
            </h5>
            <div className="text-5xl font-bold text-green-600 mb-2">
              {formatNumber(data.velocityToLoadRatio, 4)}
            </div>
            <p className="text-sm text-green-700">
              {formatNumber(data.peakVelocity, 2)} m/s ÷{" "}
              {formatNumber(data.loadUsedKg, 1)} kg
            </p>
            <div className="mt-3 p-2 bg-white rounded text-xs text-green-800">
              Higher ratios indicate better explosive strength
            </div>
          </div>
        </div>

        {/* Elite Comparison */}
        <ComparisonBar comparison={eliteComparison} athleteName="Your 1RM" />

        {/* Velocity-Based Training Zones */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📊</span>
            Velocity-Based Training Zones
          </h5>
          <p className="text-xs text-gray-600 mb-3">
            Based on your estimated 1RM velocity:{" "}
            {formatNumber(data.estimatedVelocity1RM, 2)} m/s
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span className="font-medium text-red-900">
                Max Strength (90-100%)
              </span>
              <span className="text-red-700">
                {formatNumber(data.oneRepMaxKg * 0.9, 1)} -{" "}
                {formatNumber(data.oneRepMaxKg, 1)} kg
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
              <span className="font-medium text-orange-900">
                Strength-Speed (80-90%)
              </span>
              <span className="text-orange-700">
                {formatNumber(data.oneRepMaxKg * 0.8, 1)} -{" "}
                {formatNumber(data.oneRepMaxKg * 0.9, 1)} kg
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <span className="font-medium text-yellow-900">
                Power (70-80%)
              </span>
              <span className="text-yellow-700">
                {formatNumber(data.oneRepMaxKg * 0.7, 1)} -{" "}
                {formatNumber(data.oneRepMaxKg * 0.8, 1)} kg
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="font-medium text-green-900">
                Speed-Strength (60-70%)
              </span>
              <span className="text-green-700">
                {formatNumber(data.oneRepMaxKg * 0.6, 1)} -{" "}
                {formatNumber(data.oneRepMaxKg * 0.7, 1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Performance Details",
              icon: "📋",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Reps Performed"
                    value={data.reps}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Body Weight"
                    value={formatNumber(data.bodyWeight, 1)}
                    unit="kg"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Bar Displacement"
                    value={formatNumber(data.barDisplacement, 2)}
                    unit="m"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Volume Load"
                    value={formatNumber(data.volumeLoad, 0)}
                    unit="kg"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Technique Score"
                    value={`${data.techniqueScore}/5`}
                    size="sm"
                    color={
                      data.techniqueScore >= 4
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  />
                </MetricGrid>
              ),
            },
            {
              title: "Velocity-Based Calculations",
              icon: "🔬",
              content: (
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-gray-50 rounded">
                    <h6 className="font-semibold text-gray-900 mb-2">
                      1RM Estimation
                    </h6>
                    <p className="text-gray-700 mb-2">
                      Based on velocity-load relationship, your estimated 1RM is
                      calculated from the velocity at which you moved the test
                      load.
                    </p>
                    <div className="p-2 bg-white rounded border border-gray-200 font-mono text-xs">
                      1RM ≈ Load / (1 - (Velocity / Max Velocity))
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p>
                      <strong>Peak Velocity:</strong>{" "}
                      {formatNumber(data.peakVelocity, 2)} m/s at{" "}
                      {formatNumber(data.loadUsedKg, 1)} kg
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <p>
                      <strong>Estimated 1RM Velocity:</strong>{" "}
                      {formatNumber(data.estimatedVelocity1RM, 2)} m/s
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

        {data.notes && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900">
              <strong>Notes:</strong> {data.notes}
            </p>
          </div>
        )}
      </div>
    </StatCard>
  );
}
