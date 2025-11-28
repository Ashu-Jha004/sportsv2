// components/stats/tests/speed/TenMeterSprintCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { ComparisonBar } from "../../shared/ComparisonBar";
import { InsightCard } from "../../shared/InsightCard";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import type { TenMeterSprintTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Zap } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import {
  calculatePerformanceLevel,
  compareToElite,
  generateInsight,
} from "../../../../lib/utils/performanceCalculations";

interface TenMeterSprintCardProps {
  data: TenMeterSprintTest;
  recordedAt: string;
}

export function TenMeterSprintCard({
  data,
  recordedAt,
}: TenMeterSprintCardProps) {
  const performanceLevel = calculatePerformanceLevel(
    data.timeSeconds,
    "tenMeterSprint",
    "speed"
  );

  const eliteComparison = compareToElite(
    data.timeSeconds,
    "tenMeterSprint",
    "speed"
  );

  const insight = generateInsight(
    "10-Meter Sprint",
    performanceLevel,
    eliteComparison
  );

  // Calculate average speed
  const avgSpeed = 10 / data.timeSeconds; // m/s

  return (
    <StatCard
      title="10-Meter Sprint"
      icon={Zap}
      iconColor="text-yellow-600"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200 text-center">
            <h5 className="text-sm font-semibold text-yellow-900 mb-2">
              Sprint Time
            </h5>
            <div className="text-5xl font-bold text-yellow-600 mb-2">
              {formatNumber(data.timeSeconds, 2)}
              <span className="text-lg text-yellow-500 ml-1">s</span>
            </div>
            <p className="text-xs text-yellow-700">10 meters</p>
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
              Performance Level
            </h5>
            <div className="flex items-center justify-center h-20">
              <PerformanceBadge
                performance={performanceLevel}
                showPercentage
                size="lg"
              />
            </div>
          </div>
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
                      The 10-meter sprint is a test of{" "}
                      <strong>acceleration ability</strong> and
                      <strong> explosive speed</strong>. It primarily measures:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Initial acceleration from a standing start</li>
                      <li>• Force production in the first steps</li>
                      <li>• Power-to-weight ratio</li>
                      <li>• Neuromuscular coordination</li>
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
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm">
                        <strong className="text-green-900">
                          Speed (km/h):
                        </strong>
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {formatNumber(avgSpeed * 3.6, 1)} km/h
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
                    10-meter sprint time standards:
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      World Class (&lt; 1.50s):
                    </strong>{" "}
                    <span className="text-purple-800">
                      Elite sprinter level
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Elite (1.50-1.70s):
                    </strong>{" "}
                    <span className="text-green-800">
                      Professional athlete level
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Good (1.70-1.85s):
                    </strong>{" "}
                    <span className="text-blue-800">Competitive athlete</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Average (1.85-2.00s):
                    </strong>{" "}
                    <span className="text-yellow-800">
                      Recreational athlete
                    </span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Below Average (&gt; 2.00s):
                    </strong>{" "}
                    <span className="text-orange-800">
                      Focus on acceleration training
                    </span>
                  </div>
                </div>
              ),
            },
            {
              title: "Training Recommendations",
              icon: "💡",
              content: (
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="p-3 bg-blue-50 rounded">
                    <strong className="text-blue-900">
                      🏋️ Strength Training:
                    </strong>
                    <p className="mt-1">
                      Focus on squats, deadlifts, and Olympic lifts for
                      explosive power
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <strong className="text-green-900">⚡ Plyometrics:</strong>
                    <p className="mt-1">
                      Box jumps, bounds, and depth jumps to improve reactive
                      strength
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <strong className="text-purple-900">
                      🏃 Sprint Drills:
                    </strong>
                    <p className="mt-1">
                      Acceleration drills, resisted sprints, and technical work
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <strong className="text-orange-900">⚙️ Technique:</strong>
                    <p className="mt-1">
                      Body lean, arm drive, and proper force application
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
