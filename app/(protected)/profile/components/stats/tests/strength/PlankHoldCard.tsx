// components/stats/tests/strength/PlankHoldCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { InsightCard } from "../../shared/InsightCard";
import type { PlankHoldTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Clock } from "lucide-react";
import { formatDuration, formatNumber } from "../../../../lib/utils/formatting";

interface PlankHoldCardProps {
  data: PlankHoldTest;
  recordedAt: string;
}

export function PlankHoldCard({ data, recordedAt }: PlankHoldCardProps) {
  // Add null checks and default values
  if (!data || !data.raw || !data.calculated) {
    return (
      <StatCard
        title="Plank Hold"
        icon={Clock}
        iconColor="text-green-600"
        recordedAt={recordedAt}
      >
        <div className="p-4 text-center text-gray-500">
          <p>No plank hold data available</p>
        </div>
      </StatCard>
    );
  }

  const { raw, calculated, meta } = data;

  // Safe access with defaults
  const bodyweightDuration = raw?.bodyweightDurationSeconds ?? 0;
  const weightedDuration = raw?.weightedDurationSeconds ?? 0;
  const weightedLoad = raw?.weightedLoadKg ?? 0;
  const formQuality = raw?.formQualityScore ?? 0;
  const totalHoldTime = calculated?.totalHoldTimeSeconds ?? 0;
  const enduranceRatio = calculated?.enduranceRatio ?? 0;
  const fatiguePercent = calculated?.fatiguePercent ?? 0;
  const intensityIndex = calculated?.weightedIntensityIndex ?? 0;

  const getCoreEnduranceRating = (totalTime: number) => {
    if (totalTime >= 300) return { label: "Elite", color: "text-purple-600" };
    if (totalTime >= 180)
      return { label: "Excellent", color: "text-green-600" };
    if (totalTime >= 120) return { label: "Good", color: "text-blue-600" };
    if (totalTime >= 60) return { label: "Average", color: "text-yellow-600" };
    return { label: "Needs Work", color: "text-orange-600" };
  };

  const rating = getCoreEnduranceRating(totalHoldTime);

  return (
    <StatCard
      title="Plank Hold"
      icon={Clock}
      iconColor="text-green-600"
      recordedAt={recordedAt}
      badge={{
        label: rating.label,
        color: rating.color,
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
              label="Total Hold Time"
              value={formatDuration(totalHoldTime)}
              icon="⏱️"
              color="text-green-600"
              tooltip="Combined bodyweight + weighted hold time"
            />
            <MetricDisplay
              label="Endurance Ratio"
              value={formatNumber(enduranceRatio, 2)}
              icon="📊"
              color="text-blue-600"
              tooltip="Weighted time / Bodyweight time"
            />
            <MetricDisplay
              label="Fatigue %"
              value={formatNumber(fatiguePercent, 1)}
              unit="%"
              icon="📉"
              color="text-orange-600"
              tooltip="Performance decline with added load"
            />
            <MetricDisplay
              label="Intensity Index"
              value={intensityIndex}
              icon="💪"
              color="text-purple-600"
              tooltip="Overall intensity score"
            />
          </MetricGrid>
        </div>

        {/* Duration Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="text-center">
              <h5 className="text-sm font-semibold text-blue-900 mb-2">
                Bodyweight Hold
              </h5>
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {formatDuration(bodyweightDuration)}
              </div>
              <p className="text-sm text-blue-700">
                {bodyweightDuration} seconds
              </p>
            </div>
          </div>

          <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="text-center">
              <h5 className="text-sm font-semibold text-purple-900 mb-2">
                Weighted Hold {weightedLoad > 0 && `(+${weightedLoad} kg)`}
              </h5>
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {formatDuration(weightedDuration)}
              </div>
              <p className="text-sm text-purple-700">
                {weightedDuration} seconds
              </p>
            </div>
          </div>
        </div>

        {/* Visual Comparison */}
        {totalHoldTime > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">
              Hold Time Comparison
            </h5>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Bodyweight</span>
                  <span className="font-semibold">
                    {formatDuration(bodyweightDuration)}
                  </span>
                </div>
                <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-3"
                    style={{
                      width: `${(bodyweightDuration / totalHoldTime) * 100}%`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {formatNumber(
                        (bodyweightDuration / totalHoldTime) * 100,
                        0
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {weightedDuration > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Weighted (+{weightedLoad} kg)
                    </span>
                    <span className="font-semibold">
                      {formatDuration(weightedDuration)}
                    </span>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-purple-500 to-purple-600 flex items-center justify-end pr-3"
                      style={{
                        width: `${(weightedDuration / totalHoldTime) * 100}%`,
                      }}
                    >
                      <span className="text-xs font-bold text-white">
                        {formatNumber(
                          (weightedDuration / totalHoldTime) * 100,
                          0
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights */}
        {fatiguePercent > 70 && (
          <InsightCard
            insight={{
              title: "High Fatigue Index",
              message: `Your performance dropped ${formatNumber(
                fatiguePercent,
                1
              )}% with added load. This suggests core endurance under load needs attention.`,
              type: "warning",
              icon: "⚠️",
              actionable: true,
              recommendation:
                "Focus on progressive overload training. Start with lighter loads and gradually increase weight while maintaining form.",
            }}
          />
        )}

        {enduranceRatio > 0.7 && (
          <InsightCard
            insight={{
              title: "Excellent Load Tolerance",
              message:
                "You maintained over 70% of your bodyweight hold time with added load. This indicates strong core endurance.",
              type: "success",
              icon: "✅",
              actionable: false,
            }}
          />
        )}

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Form Quality Assessment",
              icon: "✅",
              content: (
                <div className="space-y-4">
                  <MetricGrid columns={2} gap="md">
                    <MetricDisplay
                      label="Form Quality Score"
                      value={`${formQuality}/5`}
                      color={
                        formQuality >= 4 ? "text-green-600" : "text-yellow-600"
                      }
                      size="sm"
                    />
                    <MetricDisplay
                      label="Hip Drop"
                      value={raw?.hipDrop || "N/A"}
                      color={
                        raw?.hipDrop === "none"
                          ? "text-green-600"
                          : "text-orange-600"
                      }
                      size="sm"
                    />
                    {raw?.rpe && (
                      <MetricDisplay
                        label="RPE (Effort)"
                        value={`${raw.rpe}/10`}
                        size="sm"
                      />
                    )}
                  </MetricGrid>

                  {raw?.painAreas && raw.painAreas !== "none" && (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-sm text-red-900">
                        <strong>⚠️ Pain Areas:</strong> {raw.painAreas}
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Consider consulting with a healthcare professional if
                        pain persists.
                      </p>
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: "Performance Standards",
              icon: "📚",
              content: (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 mb-3">
                    Plank hold time standards (total hold):
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      Elite (300+ sec):
                    </strong>{" "}
                    <span className="text-purple-800">
                      World-class core endurance
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Excellent (180-299 sec):
                    </strong>{" "}
                    <span className="text-green-800">
                      Very strong core stability
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Good (120-179 sec):
                    </strong>{" "}
                    <span className="text-blue-800">
                      Above average endurance
                    </span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Average (60-119 sec):
                    </strong>{" "}
                    <span className="text-yellow-800">
                      Baseline fitness level
                    </span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Needs Work (&lt;60 sec):
                    </strong>{" "}
                    <span className="text-orange-800">
                      Focus on building core strength
                    </span>
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

        {raw?.notes && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900">
              <strong>Notes:</strong> {raw.notes}
            </p>
          </div>
        )}

        {raw?.videoUrl && (
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
