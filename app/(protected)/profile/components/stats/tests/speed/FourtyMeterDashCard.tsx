// components/stats/tests/speed/FourtyMeterDashCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { ComparisonBar } from "../../shared/ComparisonBar";
import { InsightCard } from "../../shared/InsightCard";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import type { FourtyMeterDashTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Zap } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import {
  calculatePerformanceLevel,
  compareToElite,
  generateInsight,
} from "../../../../lib/utils/performanceCalculations";

interface FourtyMeterDashCardProps {
  data: FourtyMeterDashTest;
  recordedAt: string;
}

export function FourtyMeterDashCard({
  data,
  recordedAt,
}: FourtyMeterDashCardProps) {
  const performanceLevel = calculatePerformanceLevel(
    data.timeSeconds,
    "fourtyMeterDash",
    "speed"
  );

  const eliteComparison = compareToElite(
    data.timeSeconds,
    "fourtyMeterDash",
    "speed"
  );

  const insight = generateInsight(
    "40-Meter Dash",
    performanceLevel,
    eliteComparison
  );

  // Calculate average speed
  const avgSpeed = 40 / data.timeSeconds; // m/s
  const topSpeedEstimate = avgSpeed * 1.15; // Estimated top speed is ~15% higher

  return (
    <StatCard
      title="40-Meter Dash"
      icon={Zap}
      iconColor="text-green-600"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
            <h5 className="text-sm font-semibold text-green-900 mb-2">
              Sprint Time
            </h5>
            <div className="text-5xl font-bold text-green-600 mb-2">
              {formatNumber(data.timeSeconds, 2)}
              <span className="text-lg text-green-500 ml-1">s</span>
            </div>
            <p className="text-xs text-green-700">40 meters</p>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">
              Average Speed
            </h5>
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {formatNumber(avgSpeed, 2)}
              <span className="text-lg text-blue-500 ml-1">m/s</span>
            </div>
            <p className="text-xs text-blue-700">
              {formatNumber(avgSpeed * 3.6, 1)} km/h
            </p>
          </div>

          <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200 text-center">
            <h5 className="text-sm font-semibold text-purple-900 mb-2">
              Est. Top Speed
            </h5>
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {formatNumber(topSpeedEstimate, 2)}
              <span className="text-lg text-purple-500 ml-1">m/s</span>
            </div>
            <p className="text-xs text-purple-700">
              {formatNumber(topSpeedEstimate * 3.6, 1)} km/h
            </p>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="flex justify-center">
          <PerformanceBadge
            performance={performanceLevel}
            showPercentage
            size="lg"
          />
        </div>

        {/* Elite Comparison */}
        <ComparisonBar comparison={eliteComparison} />

        {/* Insight */}
        <InsightCard insight={insight} />

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Test Analysis",
              icon: "📊",
              content: (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h6 className="text-sm font-semibold text-gray-900 mb-3">
                      What This Test Measures
                    </h6>
                    <p className="text-sm text-gray-700 mb-2">
                      The 40-meter dash measures both{" "}
                      <strong>acceleration</strong> and
                      <strong> maximum velocity</strong> development. Key
                      components:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Acceleration phase (0-20m)</li>
                      <li>• Transition to upright running (20-30m)</li>
                      <li>• Maximum velocity phase (30-40m)</li>
                      <li>• Sustained power output</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm">
                        <strong className="text-blue-900">
                          Average Speed:
                        </strong>
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatNumber(avgSpeed, 2)} m/s
                      </p>
                      <p className="text-xs text-blue-700">
                        ({formatNumber(avgSpeed * 3.6, 1)} km/h)
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                      <p className="text-sm">
                        <strong className="text-purple-900">
                          Est. Top Speed:
                        </strong>
                      </p>
                      <p className="text-lg font-bold text-purple-600">
                        {formatNumber(topSpeedEstimate, 2)} m/s
                      </p>
                      <p className="text-xs text-purple-700">
                        ({formatNumber(topSpeedEstimate * 3.6, 1)} km/h)
                      </p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: "Performance Standards",
              icon: "📚",
              content: (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 mb-3">
                    40-meter dash time standards:
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      World Class (&lt; 4.22s):
                    </strong>{" "}
                    <span className="text-purple-800">
                      Olympic sprinter level (Usain Bolt: ~4.22s)
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Elite (4.22-4.50s):
                    </strong>{" "}
                    <span className="text-green-800">
                      Professional track athlete
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Good (4.50-4.80s):
                    </strong>{" "}
                    <span className="text-blue-800">
                      Competitive field sport athlete
                    </span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Average (4.80-5.20s):
                    </strong>{" "}
                    <span className="text-yellow-800">
                      Recreational athlete
                    </span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Below Average (&gt; 5.20s):
                    </strong>{" "}
                    <span className="text-orange-800">
                      Needs speed development
                    </span>
                  </div>
                </div>
              ),
            },
            {
              title: "Speed Development Tips",
              icon: "💡",
              content: (
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="p-3 bg-blue-50 rounded">
                    <strong className="text-blue-900">
                      🏃 Acceleration Work:
                    </strong>
                    <p className="mt-1">
                      Short sprints (10-20m) with full recovery between reps
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <strong className="text-green-900">
                      ⚡ Max Velocity Training:
                    </strong>
                    <p className="mt-1">
                      Flying sprints, downhill sprints, overspeed training
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <strong className="text-purple-900">
                      💪 Strength Foundation:
                    </strong>
                    <p className="mt-1">
                      Heavy squats, deadlifts, and Olympic lifts build force
                      production
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <strong className="text-orange-900">
                      🎯 Technical Mastery:
                    </strong>
                    <p className="mt-1">
                      Proper sprint mechanics, arm action, and ground contact
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
