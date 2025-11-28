// components/stats/tests/strength/PushUpCard.tsx
"use client";

import React from "react";

import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { ProgressRing } from "../../shared/ProgressRing";
import { PushUpTest } from "../../../../lib/utils/statsDataProcessor";
import { Activity } from "lucide-react";
import { formatNumber, formatDuration } from "../../../../lib/utils/formatting";
import { calculatePerformanceLevel } from "../../../../lib/utils/performanceCalculations";

interface PushUpCardProps {
  data: PushUpTest;
  recordedAt: string;
}

export function PushUpCard({ data, recordedAt }: PushUpCardProps) {
  const { raw, calculated, meta } = data;

  const performanceLevel = calculatePerformanceLevel(
    calculated.strengthIndex,
    "pushUps",
    "strength"
  );

  const getRPEColor = (rpe: number) => {
    if (rpe <= 3) return "text-green-600";
    if (rpe <= 6) return "text-yellow-600";
    if (rpe <= 8) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <StatCard
      title="Push-Up Test"
      icon={Activity}
      iconColor="text-blue-600"
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
            Performance Summary
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Total Reps"
              value={calculated.totalReps}
              icon="🔢"
              color="text-purple-600"
              tooltip="Bodyweight + weighted repetitions"
            />
            <MetricDisplay
              label="Volume Load"
              value={formatNumber(calculated.volumeLoad, 0)}
              unit="kg"
              icon="⚖️"
              color="text-blue-600"
              tooltip="Total weight moved"
            />
            <MetricDisplay
              label="Strength Index"
              value={calculated.strengthIndex}
              icon="💪"
              color="text-green-600"
              tooltip="Overall strength score (0-100+)"
            />
            <MetricDisplay
              label="Density"
              value={formatNumber(calculated.density, 1)}
              unit="reps/s"
              icon="⚡"
              color="text-orange-600"
              tooltip="Reps per second of work"
            />
          </MetricGrid>
        </div>

        {/* Performance Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center">
            <ProgressRing
              percentage={Math.min(calculated.strengthIndex, 100)}
              size="lg"
              label="Strength Index"
            />
          </div>

          <div className="space-y-3">
            <MetricDisplay
              label="Bodyweight Adjusted Score"
              value={calculated.bodyweightAdjustedScore}
              color="text-blue-600"
            />
            <MetricDisplay
              label="Power Proxy"
              value={formatNumber(calculated.powerProxy, 0)}
              unit="W"
              color="text-purple-600"
              tooltip="Estimated power output"
            />
            <div className={`p-3 rounded-lg bg-gray-50 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">RPE (Effort)</span>
                <span className={`text-xl font-bold ${getRPEColor(raw.rpe)}`}>
                  {raw.rpe}/10
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getRPEColor(
                    raw.rpe
                  ).replace("text-", "bg-")}`}
                  style={{ width: `${raw.rpe * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Rep Breakdown",
              icon: "📊",
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2">
                        Bodyweight Reps
                      </h5>
                      <p className="text-3xl font-bold text-blue-600">
                        {raw.repsBodyweight}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        @ {formatNumber(raw.bodyWeightKg, 1)} kg
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="text-sm font-semibold text-purple-900 mb-2">
                        Weighted Reps
                      </h5>
                      <p className="text-3xl font-bold text-purple-600">
                        {raw.repsWeighted}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        @{" "}
                        {formatNumber(raw.bodyWeightKg + raw.weightedLoadKg, 1)}{" "}
                        kg
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">
                      Volume Calculation
                    </h5>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span>Bodyweight Volume:</span>
                        <span>
                          {raw.repsBodyweight} ×{" "}
                          {formatNumber(raw.bodyWeightKg, 1)} kg ={" "}
                          {formatNumber(
                            raw.repsBodyweight * raw.bodyWeightKg,
                            0
                          )}{" "}
                          kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weighted Volume:</span>
                        <span>
                          {raw.repsWeighted} ×{" "}
                          {formatNumber(
                            raw.bodyWeightKg + raw.weightedLoadKg,
                            1
                          )}{" "}
                          kg ={" "}
                          {formatNumber(
                            raw.repsWeighted *
                              (raw.bodyWeightKg + raw.weightedLoadKg),
                            0
                          )}{" "}
                          kg
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300 font-bold">
                        <span>Total Volume:</span>
                        <span className="text-blue-600">
                          {formatNumber(calculated.volumeLoad, 0)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: "Technical Details",
              icon: "🔬",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Set Duration"
                    value={formatDuration(raw.setDurationSeconds)}
                    size="sm"
                  />
                  <MetricDisplay label="Tempo" value={raw.tempo} size="sm" />
                  <MetricDisplay
                    label="Hand Position"
                    value={raw.handPosition}
                    size="sm"
                  />
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
                </MetricGrid>
              ),
            },
            {
              title: "Performance Level Guide",
              icon: "📚",
              content: (
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      Superhuman (100+):
                    </strong>{" "}
                    <span className="text-purple-800">
                      Elite level performance
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Advanced (70-99):
                    </strong>{" "}
                    <span className="text-green-800">
                      Very strong performance
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Intermediate (40-69):
                    </strong>{" "}
                    <span className="text-blue-800">
                      Good strength foundation
                    </span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Beginner (20-39):
                    </strong>{" "}
                    <span className="text-yellow-800">Building strength</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Novice (&lt;20):
                    </strong>{" "}
                    <span className="text-orange-800">Starting point</span>
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
