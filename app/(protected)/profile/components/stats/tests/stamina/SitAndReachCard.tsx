// components/stats/tests/stamina/SitAndReachCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { AttemptsTable } from "../../shared/AttemptsTable";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { InsightCard } from "../../shared/InsightCard";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { Activity } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import { calculatePerformanceLevel } from "../../../../lib/utils/performanceCalculations";

interface SitAndReachCardProps {
  data: any;
  recordedAt: string;
}

export function SitAndReachCard({ data, recordedAt }: SitAndReachCardProps) {
  const { attempts, calculated } = data;

  const performanceLevel = calculatePerformanceLevel(
    calculated.bestReach,
    "sitAndReach",
    "stamina"
  );

  const getFlexibilityRating = (distance: number) => {
    if (distance >= 20)
      return { label: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (distance >= 10)
      return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (distance >= 0)
      return { label: "Average", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (distance >= -10)
      return { label: "Fair", color: "text-orange-600", bg: "bg-orange-50" };
    return { label: "Poor", color: "text-red-600", bg: "bg-red-50" };
  };

  const flexRating = getFlexibilityRating(calculated.bestReach);

  // Find best attempt
  const bestAttemptIndex = attempts.findIndex(
    (a: any) => a.distance === calculated.bestReach
  );

  return (
    <StatCard
      title="Sit and Reach Flexibility Test"
      icon={Activity}
      iconColor="text-cyan-600"
      recordedAt={recordedAt}
      badge={{
        label: flexRating.label,
        color: flexRating.color,
      }}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metric - Large Display */}
        <div
          className={`p-8 rounded-2xl border-2 ${
            flexRating.bg
          } border-${flexRating.color.replace("text-", "")}-200`}
        >
          <div className="text-center">
            <h5
              className="text-sm font-semibold mb-3"
              style={{ color: flexRating.color.replace("text-", "") }}
            >
              Best Reach Distance
            </h5>
            <div className={`text-7xl font-bold mb-2 ${flexRating.color}`}>
              {calculated.bestReach > 0 ? "+" : ""}
              {formatNumber(calculated.bestReach, 1)}
              <span className="text-2xl ml-2">cm</span>
            </div>
            <div className="text-lg text-gray-600 mt-2">
              {calculated.bestReach > 0
                ? `${formatNumber(calculated.bestReach, 1)} cm beyond toes`
                : `${formatNumber(
                    Math.abs(calculated.bestReach),
                    1
                  )} cm before toes`}
            </div>

            <div className="mt-6">
              <PerformanceBadge performance={performanceLevel} size="lg" />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <h5 className="text-xs font-semibold text-cyan-900 mb-2">
              Best Reach
            </h5>
            <div className="text-3xl font-bold text-cyan-600">
              {calculated.bestReach > 0 ? "+" : ""}
              {formatNumber(calculated.bestReach, 1)}
              <span className="text-sm ml-1">cm</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-xs font-semibold text-blue-900 mb-2">
              Average Reach
            </h5>
            <div className="text-3xl font-bold text-blue-600">
              {calculated.averageReach > 0 ? "+" : ""}
              {formatNumber(calculated.averageReach, 1)}
              <span className="text-sm ml-1">cm</span>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="text-xs font-semibold text-purple-900 mb-2">
              Consistency
            </h5>
            <div className="text-3xl font-bold text-purple-600">
              {calculated.consistency}
            </div>
          </div>
        </div>

        {/* Visual Comparison */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-4">
            Reach Distance Comparison
          </h5>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Best Reach</span>
                <span className="font-semibold text-cyan-600">
                  {calculated.bestReach > 0 ? "+" : ""}
                  {formatNumber(calculated.bestReach, 1)} cm
                </span>
              </div>
              <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-gray-400" />
                </div>
                <div
                  className={`h-full ${
                    calculated.bestReach >= 0
                      ? "bg-linear-to-r from-cyan-500 to-cyan-600"
                      : "bg-linear-to-l from-red-500 to-red-600"
                  } transition-all duration-1000`}
                  style={{
                    width: `${50 + (calculated.bestReach / 40) * 50}%`,
                    marginLeft: calculated.bestReach >= 0 ? "50%" : "auto",
                    marginRight: calculated.bestReach < 0 ? "50%" : "auto",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Average Reach</span>
                <span className="font-semibold text-blue-600">
                  {calculated.averageReach > 0 ? "+" : ""}
                  {formatNumber(calculated.averageReach, 1)} cm
                </span>
              </div>
              <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-gray-400" />
                </div>
                <div
                  className={`h-full ${
                    calculated.averageReach >= 0
                      ? "bg-linear-to-r from-blue-500 to-blue-600"
                      : "bg-linear-to-l from-orange-500 to-orange-600"
                  } transition-all duration-1000`}
                  style={{
                    width: `${50 + (calculated.averageReach / 40) * 50}%`,
                    marginLeft: calculated.averageReach >= 0 ? "50%" : "auto",
                    marginRight: calculated.averageReach < 0 ? "50%" : "auto",
                  }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Zero point = toes level | Positive = beyond toes | Negative = before
            toes
          </p>
        </div>

        {/* Insights */}
        {calculated.bestReach < 0 && (
          <InsightCard
            insight={{
              title: "Limited Hamstring Flexibility",
              message: `Your reach is ${formatNumber(
                Math.abs(calculated.bestReach),
                1
              )} cm before your toes, indicating tight hamstrings and lower back. This can increase injury risk and limit athletic performance.`,
              type: "warning",
              icon: "⚠️",
              actionable: true,
              recommendation:
                "Incorporate daily stretching routines focusing on hamstrings, hip flexors, and lower back. Consider yoga or dynamic stretching before workouts.",
            }}
          />
        )}

        {calculated.bestReach >= 15 && (
          <InsightCard
            insight={{
              title: "Excellent Flexibility",
              message:
                "You have above-average hamstring and lower back flexibility. This helps with injury prevention and movement efficiency.",
              type: "success",
              icon: "✅",
              actionable: false,
            }}
          />
        )}

        {/* Attempts Table */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            All Attempts
          </h4>
          <AttemptsTable
            attempts={attempts}
            columns={[
              {
                key: "attemptNumber",
                label: "Attempt",
                align: "center",
              },
              {
                key: "distance",
                label: "Distance (cm)",
                align: "right",
                format: (value) =>
                  `${value > 0 ? "+" : ""}${formatNumber(value, 1)}`,
              },
            ]}
            bestAttemptIndex={bestAttemptIndex}
          />
        </div>

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Statistical Analysis",
              icon: "📊",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Best Reach"
                    value={formatNumber(calculated.bestReach, 1)}
                    unit="cm"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Average Reach"
                    value={formatNumber(calculated.averageReach, 1)}
                    unit="cm"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Worst Reach"
                    value={formatNumber(calculated.worstReach, 1)}
                    unit="cm"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Range"
                    value={formatNumber(calculated.range, 1)}
                    unit="cm"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Standard Deviation"
                    value={formatNumber(calculated.standardDeviation, 2)}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Consistency"
                    value={calculated.consistency}
                    size="sm"
                  />
                </MetricGrid>
              ),
            },
            {
              title: "Performance Standards",
              icon: "📚",
              content: (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 mb-3">
                    Sit and Reach standards for adults:
                  </p>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Excellent (20+ cm):
                    </strong>{" "}
                    <span className="text-green-800">Superior flexibility</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">Good (10-19 cm):</strong>{" "}
                    <span className="text-blue-800">
                      Above average flexibility
                    </span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Average (0-9 cm):
                    </strong>{" "}
                    <span className="text-yellow-800">Typical flexibility</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Fair (-10 to -1 cm):
                    </strong>{" "}
                    <span className="text-orange-800">
                      Below average, needs improvement
                    </span>
                  </div>
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <strong className="text-red-900">
                      Poor (&lt; -10 cm):
                    </strong>{" "}
                    <span className="text-red-800">
                      Limited flexibility, high injury risk
                    </span>
                  </div>
                </div>
              ),
            },
            {
              title: "Test Protocol",
              icon: "📋",
              content: (
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h6 className="font-semibold text-gray-900 mb-2">
                      How to Perform
                    </h6>
                    <ul className="space-y-1 text-gray-700 ml-4">
                      <li>• Sit with legs extended straight</li>
                      <li>• Feet flat against sit-and-reach box</li>
                      <li>• Knees must remain straight (not bent)</li>
                      <li>• Slowly reach forward with both hands</li>
                      <li>• Hold maximum reach for 2 seconds</li>
                      <li>• Zero point is at toe level</li>
                      <li>• Positive = beyond toes, Negative = before toes</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <h6 className="font-semibold text-cyan-900 mb-2">
                      What It Measures
                    </h6>
                    <p className="text-cyan-800">
                      The sit and reach test measures flexibility of the lower
                      back and hamstring muscles. Good flexibility in these
                      areas is important for preventing injuries and maintaining
                      proper posture.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h6 className="font-semibold text-blue-900 mb-2">
                      Improving Your Score
                    </h6>
                    <ul className="space-y-1 text-blue-800 ml-4">
                      <li>• Daily static stretching (hold 30-60 seconds)</li>
                      <li>• Dynamic stretching before workouts</li>
                      <li>• Yoga or Pilates classes</li>
                      <li>• Foam rolling for muscle release</li>
                      <li>• Gradual progression - don't force it</li>
                    </ul>
                  </div>
                </div>
              ),
            },
            {
              title: "Muscle Groups Assessed",
              icon: "💪",
              content: (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Hamstrings</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: "95%" }}
                      />
                    </div>
                    <span className="text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Lower Back</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: "90%" }}
                      />
                    </div>
                    <span className="text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Calves</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: "70%" }}
                      />
                    </div>
                    <span className="text-gray-600">Secondary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Hip Flexors</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: "65%" }}
                      />
                    </div>
                    <span className="text-gray-600">Secondary</span>
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
