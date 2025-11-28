// components/stats/tests/strength/BarbellRowCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { BarbellRowTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { TrendingUp } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";

interface BarbellRowCardProps {
  data: BarbellRowTest;
  recordedAt: string;
}

export function BarbellRowCard({ data, recordedAt }: BarbellRowCardProps) {
  const relativeStrength = data.relativeStrength;

  const getRelativeStrengthRating = (ratio: number) => {
    if (ratio >= 1.0)
      return { label: "Elite", color: "text-purple-600", bg: "bg-purple-50" };
    if (ratio >= 0.8)
      return { label: "Advanced", color: "text-green-600", bg: "bg-green-50" };
    if (ratio >= 0.6)
      return {
        label: "Intermediate",
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    if (ratio >= 0.4)
      return { label: "Novice", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { label: "Beginner", color: "text-orange-600", bg: "bg-orange-50" };
  };

  const strengthRating = getRelativeStrengthRating(relativeStrength);

  return (
    <StatCard
      title="Barbell Row"
      icon={TrendingUp}
      iconColor="text-teal-600"
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
            Horizontal Pulling Strength
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Estimated 1RM"
              value={formatNumber(data.estimated1RM, 1)}
              unit="kg"
              icon="🏋️"
              color="text-teal-600"
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
              Relative Rowing Strength
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
                    width: `${Math.min((relativeStrength / 1.2) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.4×</span>
                <span>0.6×</span>
                <span>0.8×</span>
                <span>1.0×+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Training Recommendations */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📊</span>
            Training Load Guidelines
          </h5>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
              <div>
                <span className="font-semibold text-red-900">
                  Strength Focus
                </span>
                <span className="text-xs text-red-700 block">
                  3-5 reps, 85-95% 1RM
                </span>
              </div>
              <span className="text-red-700 font-bold">
                {formatNumber(data.estimated1RM * 0.85, 1)} -{" "}
                {formatNumber(data.estimated1RM * 0.95, 1)} kg
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
              <div>
                <span className="font-semibold text-orange-900">
                  Hypertrophy
                </span>
                <span className="text-xs text-orange-700 block">
                  8-12 reps, 65-80% 1RM
                </span>
              </div>
              <span className="text-orange-700 font-bold">
                {formatNumber(data.estimated1RM * 0.65, 1)} -{" "}
                {formatNumber(data.estimated1RM * 0.8, 1)} kg
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
              <div>
                <span className="font-semibold text-green-900">Endurance</span>
                <span className="text-xs text-green-700 block">
                  15+ reps, 40-60% 1RM
                </span>
              </div>
              <span className="text-green-700 font-bold">
                {formatNumber(data.estimated1RM * 0.4, 1)} -{" "}
                {formatNumber(data.estimated1RM * 0.6, 1)} kg
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
                <div className="space-y-4">
                  <MetricGrid columns={2} gap="md">
                    <MetricDisplay
                      label="Body Weight"
                      value={formatNumber(data.bodyWeight, 1)}
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

                  <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <h6 className="text-sm font-semibold text-teal-900 mb-3">
                      1RM Estimation
                    </h6>
                    <p className="text-sm text-teal-800 mb-2">
                      Using Brzycki Formula:
                    </p>
                    <div className="p-3 bg-white rounded border border-teal-200 font-mono text-sm">
                      1RM = Load / (1.0278 - 0.0278 × Reps)
                    </div>
                    <div className="p-3 bg-white rounded border border-teal-200 font-mono text-sm mt-2">
                      {formatNumber(data.loadKg, 1)} / (1.0278 - 0.0278 ×{" "}
                      {data.reps}) = {formatNumber(data.estimated1RM, 1)} kg
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: "Exercise Benefits",
              icon: "💪",
              content: (
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="p-3 bg-blue-50 rounded">
                    <strong className="text-blue-900">
                      🔷 Upper Back Development:
                    </strong>
                    <p className="mt-1">
                      Builds thickness in lats, rhomboids, and traps
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <strong className="text-green-900">
                      ⚖️ Balanced Development:
                    </strong>
                    <p className="mt-1">
                      Counters excessive pressing, improves posture
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <strong className="text-purple-900">
                      💪 Functional Strength:
                    </strong>
                    <p className="mt-1">
                      Improves pulling power for sports and daily activities
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <strong className="text-orange-900">
                      🛡️ Shoulder Health:
                    </strong>
                    <p className="mt-1">
                      Strengthens posterior shoulder, reduces injury risk
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: "Muscle Groups Targeted",
              icon: "🎯",
              content: (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Latissimus Dorsi</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500"
                        style={{ width: "90%" }}
                      />
                    </div>
                    <span className="text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Rhomboids</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: "85%" }}
                      />
                    </div>
                    <span className="text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Trapezius</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: "80%" }}
                      />
                    </div>
                    <span className="text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Biceps</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: "70%" }}
                      />
                    </div>
                    <span className="text-gray-600">Secondary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Posterior Deltoids</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
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
