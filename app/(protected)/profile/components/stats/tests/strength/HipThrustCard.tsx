// components/stats/tests/strength/HipThrustCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { ComparisonBar } from "../../shared/ComparisonBar";
import type { BarbellHipThrustTest } from "@/types/stats/athlete-stats.types";
import { TrendingUp } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import {
  calculatePerformanceLevel,
  compareToElite,
} from "../../../../lib/utils/performanceCalculations";

interface HipThrustCardProps {
  data: any;
  recordedAt: string;
}

export function HipThrustCard({ data, recordedAt }: HipThrustCardProps) {
  const relativeStrength = data.estimated1RM / data.bodyWeight;

  const performanceLevel = calculatePerformanceLevel(
    data.estimated1RM,
    "deadlift", // Using deadlift benchmarks as reference
    "strength"
  );

  const eliteComparison = compareToElite(
    data.estimated1RM,
    "deadlift",
    "strength"
  );

  const getRelativeStrengthRating = (ratio: number) => {
    if (ratio >= 3.0)
      return { label: "Elite", color: "text-purple-600", bg: "bg-purple-50" };
    if (ratio >= 2.5)
      return { label: "Advanced", color: "text-green-600", bg: "bg-green-50" };
    if (ratio >= 2.0)
      return {
        label: "Intermediate",
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    if (ratio >= 1.5)
      return { label: "Novice", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { label: "Beginner", color: "text-orange-600", bg: "bg-orange-50" };
  };

  const strengthRating = getRelativeStrengthRating(relativeStrength);

  return (
    <StatCard
      title="Barbell Hip Thrust"
      icon={TrendingUp}
      iconColor="text-pink-600"
      recordedAt={recordedAt}
      badge={{
        label: strengthRating.label,
        color: strengthRating.color,
      }}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Hip & Glute Strength
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Estimated 1RM"
              value={formatNumber(data.estimated1RM, 1)}
              unit="kg"
              icon="🏋️"
              color="text-pink-600"
              tooltip="Estimated one-rep maximum"
            />
            <MetricDisplay
              label="Load Used"
              value={formatNumber(data.loadKg, 1)}
              unit="kg"
              icon="⚖️"
              color="text-blue-600"
            />
            <MetricDisplay
              label="Reps"
              value={data.reps}
              icon="🔢"
              color="text-green-600"
            />
            <MetricDisplay
              label="Volume Load"
              value={formatNumber(data.volumeLoad, 0)}
              unit="kg"
              icon="📊"
              color="text-purple-600"
              tooltip="Total weight lifted (reps × load)"
            />
          </MetricGrid>
        </div>

        {/* Relative Strength Display */}
        <div
          className={`p-6 rounded-xl border-2 ${
            strengthRating.bg
          } border-${strengthRating.color.replace("text-", "")}-200`}
        >
          <div className="text-center">
            <h5
              className="text-sm font-semibold mb-3"
              style={{ color: strengthRating.color.replace("text-", "") }}
            >
              Relative Hip Strength
            </h5>
            <div className={`text-6xl font-bold mb-2 ${strengthRating.color}`}>
              {formatNumber(relativeStrength, 2)}×
            </div>
            <p className="text-sm text-gray-700 mb-4">
              {formatNumber(data.estimated1RM, 1)} kg ÷{" "}
              {formatNumber(data.bodyWeight, 1)} kg body weight
            </p>

            {/* Progress bar */}
            <div className="max-w-md mx-auto">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthRating.color.replace(
                    "text-",
                    "bg-"
                  )} transition-all duration-1000`}
                  style={{
                    width: `${Math.min((relativeStrength / 3.5) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.0×</span>
                <span>2.0×</span>
                <span>3.0×</span>
                <span>3.5×</span>
              </div>
            </div>
          </div>
        </div>

        {/* Elite Comparison */}
        <ComparisonBar
          comparison={eliteComparison}
          athleteName="Your Hip Thrust"
        />

        {/* Training Zones */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📊</span>
            Training Load Recommendations
          </h5>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
              <div>
                <span className="font-semibold text-red-900">Max Strength</span>
                <span className="text-xs text-red-700 block">
                  1-3 reps, 90-100% 1RM
                </span>
              </div>
              <span className="text-red-700 font-bold">
                {formatNumber(data.estimated1RM * 0.9, 1)} -{" "}
                {formatNumber(data.estimated1RM, 1)} kg
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
              <div>
                <span className="font-semibold text-orange-900">
                  Hypertrophy
                </span>
                <span className="text-xs text-orange-700 block">
                  6-12 reps, 70-85% 1RM
                </span>
              </div>
              <span className="text-orange-700 font-bold">
                {formatNumber(data.estimated1RM * 0.7, 1)} -{" "}
                {formatNumber(data.estimated1RM * 0.85, 1)} kg
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
              <div>
                <span className="font-semibold text-green-900">
                  Muscular Endurance
                </span>
                <span className="text-xs text-green-700 block">
                  15+ reps, 50-65% 1RM
                </span>
              </div>
              <span className="text-green-700 font-bold">
                {formatNumber(data.estimated1RM * 0.5, 1)} -{" "}
                {formatNumber(data.estimated1RM * 0.65, 1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Performance Analysis",
              icon: "📊",
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <h6 className="text-sm font-semibold text-pink-900 mb-2">
                        Test Load
                      </h6>
                      <p className="text-3xl font-bold text-pink-600">
                        {formatNumber(data.loadKg, 1)}
                        <span className="text-lg text-pink-500 ml-1">kg</span>
                      </p>
                      <p className="text-xs text-pink-700 mt-1">
                        {formatNumber(
                          (data.loadKg / data.estimated1RM) * 100,
                          0
                        )}
                        % of 1RM
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h6 className="text-sm font-semibold text-blue-900 mb-2">
                        Body Weight
                      </h6>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatNumber(data.bodyWeight, 1)}
                        <span className="text-lg text-blue-500 ml-1">kg</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h6 className="text-sm font-semibold text-purple-900 mb-3">
                      1RM Calculation
                    </h6>
                    <p className="text-sm text-purple-800 mb-2">
                      Using Epley Formula:
                    </p>
                    <div className="p-3 bg-white rounded border border-purple-200 font-mono text-sm">
                      1RM = Load × (1 + Reps/30)
                    </div>
                    <div className="p-3 bg-white rounded border border-purple-200 font-mono text-sm mt-2">
                      {formatNumber(data.loadKg, 1)} × (1 + {data.reps}/30) ={" "}
                      {formatNumber(data.estimated1RM, 1)} kg
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: "Strength Standards",
              icon: "📚",
              content: (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 mb-3">
                    Hip thrust relative strength standards (1RM / Body Weight):
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">Elite (3.0×+):</strong>{" "}
                    <span className="text-purple-800">
                      World-class hip and glute strength
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Advanced (2.5-3.0×):
                    </strong>{" "}
                    <span className="text-green-800">
                      Very strong posterior chain
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Intermediate (2.0-2.5×):
                    </strong>{" "}
                    <span className="text-blue-800">
                      Solid foundation established
                    </span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Novice (1.5-2.0×):
                    </strong>{" "}
                    <span className="text-yellow-800">Developing strength</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Beginner (&lt;1.5×):
                    </strong>{" "}
                    <span className="text-orange-800">
                      Building the foundation
                    </span>
                  </div>
                </div>
              ),
            },
            {
              title: "Exercise Benefits",
              icon: "💡",
              content: (
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="p-3 bg-blue-50 rounded">
                    <strong className="text-blue-900">
                      🍑 Glute Development:
                    </strong>
                    <p className="mt-1">
                      Primary exercise for gluteus maximus hypertrophy and
                      strength
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <strong className="text-green-900">
                      ⚡ Power Production:
                    </strong>
                    <p className="mt-1">
                      Improves hip extension power for sprinting and jumping
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <strong className="text-purple-900">
                      🏃 Athletic Performance:
                    </strong>
                    <p className="mt-1">
                      Enhances acceleration, top speed, and change of direction
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <strong className="text-orange-900">
                      🛡️ Injury Prevention:
                    </strong>
                    <p className="mt-1">
                      Strengthens posterior chain, reducing lower back and
                      hamstring injury risk
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
