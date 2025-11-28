// components/stats/tests/strength/WeightedPullUpCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { ProgressRing } from "../../shared/ProgressRing";
import type { WeightedPullUpTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { TrendingUp } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import { calculatePerformanceLevel } from "@/app/(protected)/profile/lib/utils/performanceCalculations";

interface WeightedPullUpCardProps {
  data: WeightedPullUpTest;
  recordedAt: string;
}

export function WeightedPullUpCard({
  data,
  recordedAt,
}: WeightedPullUpCardProps) {
  const { raw, calculated, meta } = data;

  const performanceLevel = calculatePerformanceLevel(
    calculated.strengthIndex,
    "pullUps",
    "strength"
  );

  const getGripColor = (grip: string) => {
    const colors: Record<string, string> = {
      shoulder: "bg-blue-50 text-blue-700 border-blue-200",
      wide: "bg-purple-50 text-purple-700 border-purple-200",
      narrow: "bg-green-50 text-green-700 border-green-200",
      neutral: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return colors[grip] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <StatCard
      title="Weighted Pull-Up"
      icon={TrendingUp}
      iconColor="text-cyan-600"
      recordedAt={recordedAt}
      badge={{
        label: calculated.performanceLevel,
        color: performanceLevel.color,
      }}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Upper Body Pulling Strength
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Reps Completed"
              value={raw.repsCompleted}
              icon="🔢"
              color="text-cyan-600"
            />
            <MetricDisplay
              label="Strength Index"
              value={calculated.strengthIndex}
              icon="💪"
              color="text-blue-600"
              tooltip="Overall strength score"
            />
            <MetricDisplay
              label="Power Score"
              value={calculated.powerScore}
              icon="⚡"
              color="text-purple-600"
            />
            <MetricDisplay
              label="Endurance Ratio"
              value={formatNumber(calculated.enduranceRatio, 2)}
              icon="🔋"
              color="text-green-600"
            />
          </MetricGrid>
        </div>

        {/* Performance Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center">
            <ProgressRing
              percentage={Math.min(calculated.strengthIndex * 10, 100)}
              size="lg"
              label="Strength Index"
              color={performanceLevel.color.replace("text-", "#")}
            />
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <h5 className="text-sm font-semibold text-cyan-900 mb-2">
                Bodyweight Adjusted Score
              </h5>
              <div className="text-4xl font-bold text-cyan-600">
                {calculated.bodyweightAdjustedScore}
              </div>
              <p className="text-xs text-cyan-700 mt-2">
                Normalized performance metric
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${getGripColor(raw.grip)}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Grip Type</span>
                <span className="text-lg font-bold capitalize">{raw.grip}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Body Weight</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatNumber(raw.bodyWeightKg, 1)} kg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Level Guide */}
        <div className="p-4 bg-linear-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span>📊</span>
            Your Performance: {calculated.performanceLevel}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
            <div
              className={`p-2 rounded text-center ${
                calculated.performanceLevel === "Elite"
                  ? "bg-purple-100 border-2 border-purple-400"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="font-bold text-purple-900">Elite</div>
              <div className="text-purple-700">20+ reps</div>
            </div>
            <div
              className={`p-2 rounded text-center ${
                calculated.performanceLevel === "Advanced"
                  ? "bg-green-100 border-2 border-green-400"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="font-bold text-green-900">Advanced</div>
              <div className="text-green-700">15-19 reps</div>
            </div>
            <div
              className={`p-2 rounded text-center ${
                calculated.performanceLevel === "Intermediate"
                  ? "bg-blue-100 border-2 border-blue-400"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="font-bold text-blue-900">Intermediate</div>
              <div className="text-blue-700">10-14 reps</div>
            </div>
            <div
              className={`p-2 rounded text-center ${
                calculated.performanceLevel === "Novice"
                  ? "bg-yellow-100 border-2 border-yellow-400"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="font-bold text-yellow-900">Novice</div>
              <div className="text-yellow-700">5-9 reps</div>
            </div>
            <div
              className={`p-2 rounded text-center ${
                calculated.performanceLevel === "Beginner"
                  ? "bg-orange-100 border-2 border-orange-400"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="font-bold text-orange-900">Beginner</div>
              <div className="text-orange-700">1-4 reps</div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Technical Details",
              icon: "🔬",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Reps Completed"
                    value={raw.repsCompleted}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Body Weight"
                    value={formatNumber(raw.bodyWeightKg, 1)}
                    unit="kg"
                    size="sm"
                  />
                  <MetricDisplay label="Grip Type" value={raw.grip} size="sm" />
                  <MetricDisplay
                    label="Technique Score"
                    value={`${raw.techniqueScore}/5`}
                    size="sm"
                    color={
                      raw.techniqueScore >= 4
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  />
                  <MetricDisplay
                    label="RPE"
                    value={`${raw.rpe}/10`}
                    size="sm"
                  />
                </MetricGrid>
              ),
            },
            {
              title: "Grip Variations",
              icon: "✋",
              content: (
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Shoulder Width (Pronated):
                    </strong>
                    <p className="text-blue-800 mt-1">
                      Standard grip, balanced lat and bicep engagement
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">Wide Grip:</strong>
                    <p className="text-purple-800 mt-1">
                      Emphasizes lats, more challenging
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Narrow Grip (Chin-Up):
                    </strong>
                    <p className="text-green-800 mt-1">
                      More bicep involvement, typically easier
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">Neutral Grip:</strong>
                    <p className="text-orange-800 mt-1">
                      Palms facing each other, joint-friendly
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: "Muscle Groups Targeted",
              icon: "💪",
              content: (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Latissimus Dorsi</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: "95%" }}
                      />
                    </div>
                    <span className="text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Biceps</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: "85%" }}
                      />
                    </div>
                    <span className="text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Rhomboids</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: "75%" }}
                      />
                    </div>
                    <span className="text-gray-600">Secondary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Trapezius</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: "70%" }}
                      />
                    </div>
                    <span className="text-gray-600">Secondary</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Core</span>
                    <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: "60%" }}
                      />
                    </div>
                    <span className="text-gray-600">Stabilizer</span>
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

        {raw.notes && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900">
              <strong>Notes:</strong> {raw.notes}
            </p>
          </div>
        )}

        {raw.videoUrl && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 mb-2">
              <strong>📹 Video Available</strong>
            </p>
            <a
              href={raw.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Recording →
            </a>
          </div>
        )}
      </div>
    </StatCard>
  );
}
