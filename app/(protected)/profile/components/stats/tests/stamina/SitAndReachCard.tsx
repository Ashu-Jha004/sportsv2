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
import { calculatePerformanceLevel } from "@/app/(protected)/profile/lib/utils/performanceCalculations";

interface SitAndReachCardProps {
  data: any;
  recordedAt: string;
}

export function SitAndReachCard({ data, recordedAt }: SitAndReachCardProps) {
  // Add null checks
  if (!data || !data.calculated) {
    return (
      <StatCard
        title="Sit and Reach Flexibility Test"
        icon={Activity}
        iconColor="text-cyan-600"
        recordedAt={recordedAt}
      >
        <div className="p-4 text-center text-gray-500">
          <p>No sit and reach data available</p>
        </div>
      </StatCard>
    );
  }

  const { trials, calculated } = data;

  // Transform trials to attempts format (your JSON uses "trials" not "attempts")
  const safeAttempts = Array.isArray(trials)
    ? trials.map((trial: any) => ({
        attemptNumber: trial.trialNumber,
        distance: trial.reachDistance,
        discomfortLevel: trial.discomfortLevel,
      }))
    : [];

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

  // Find best attempt - with null check
  const bestAttemptIndex = safeAttempts.findIndex(
    (a) => a?.distance === calculated.bestReach
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
          className={`p-8 rounded-2xl border-2 ${flexRating.bg} ${
            flexRating.color.includes("green")
              ? "border-green-200"
              : flexRating.color.includes("blue")
              ? "border-blue-200"
              : flexRating.color.includes("yellow")
              ? "border-yellow-200"
              : flexRating.color.includes("orange")
              ? "border-orange-200"
              : "border-red-200"
          }`}
        >
          <div className="text-center">
            <h5 className={`text-sm font-semibold mb-3 ${flexRating.color}`}>
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
              Flexibility Rating
            </h5>
            <div className="text-2xl font-bold text-purple-600">
              {calculated.flexibilityRating || "N/A"}
            </div>
          </div>
        </div>

        {/* Additional Metrics from Calculated */}
        {calculated && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {calculated.flexibilityPercentile && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <p className="text-xs text-blue-700 mb-1">Percentile</p>
                <p className="text-xl font-bold text-blue-600">
                  {calculated.flexibilityPercentile}th
                </p>
              </div>
            )}
            {calculated.injuryRiskLevel && (
              <div
                className={`p-3 rounded-lg border text-center ${
                  calculated.injuryRiskLevel === "High"
                    ? "bg-red-50 border-red-200"
                    : calculated.injuryRiskLevel === "Medium"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <p
                  className={`text-xs mb-1 ${
                    calculated.injuryRiskLevel === "High"
                      ? "text-red-700"
                      : calculated.injuryRiskLevel === "Medium"
                      ? "text-yellow-700"
                      : "text-green-700"
                  }`}
                >
                  Injury Risk
                </p>
                <p
                  className={`text-lg font-bold ${
                    calculated.injuryRiskLevel === "High"
                      ? "text-red-600"
                      : calculated.injuryRiskLevel === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {calculated.injuryRiskLevel}
                </p>
              </div>
            )}
            {calculated.overallFlexibilityScore && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                <p className="text-xs text-purple-700 mb-1">
                  Flexibility Score
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {calculated.overallFlexibilityScore}
                </p>
              </div>
            )}
            {calculated.consistencyScore && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="text-xs text-green-700 mb-1">Consistency</p>
                <p className="text-xl font-bold text-green-600">
                  {calculated.consistencyScore}%
                </p>
              </div>
            )}
          </div>
        )}

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
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-600"
                      : "bg-gradient-to-l from-red-500 to-red-600"
                  } transition-all duration-1000`}
                  style={{
                    width: `${Math.min(
                      Math.abs(calculated.bestReach / 40) * 50,
                      50
                    )}%`,
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
                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                      : "bg-gradient-to-l from-orange-500 to-orange-600"
                  } transition-all duration-1000`}
                  style={{
                    width: `${Math.min(
                      Math.abs(calculated.averageReach / 40) * 50,
                      50
                    )}%`,
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
              )} cm before your toes, indicating tight hamstrings and lower back. ${
                calculated.ageGroupComparison ||
                "This can increase injury risk and limit athletic performance."
              }`,
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

        {/* Attempts Table - Only show if we have attempts */}
        {safeAttempts.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              All Attempts
            </h4>
            <AttemptsTable
              attempts={safeAttempts}
              columns={[
                {
                  key: "attemptNumber",
                  label: "Trial",
                  align: "center",
                },
                {
                  key: "distance",
                  label: "Distance (cm)",
                  align: "right",
                  format: (value) =>
                    `${value > 0 ? "+" : ""}${formatNumber(value, 1)}`,
                },
                {
                  key: "discomfortLevel",
                  label: "Discomfort",
                  align: "center",
                  format: (value) => `${value}/10`,
                },
              ]}
              bestAttemptIndex={bestAttemptIndex}
            />
          </div>
        )}

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Flexibility Analysis",
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
                  {calculated.rangeOfMotion !== undefined && (
                    <MetricDisplay
                      label="Range of Motion"
                      value={formatNumber(calculated.rangeOfMotion, 1)}
                      unit="cm"
                      size="sm"
                    />
                  )}
                  {calculated.hamstringFlexibilityIndex && (
                    <MetricDisplay
                      label="Hamstring Flexibility"
                      value={calculated.hamstringFlexibilityIndex}
                      size="sm"
                    />
                  )}
                  {calculated.lowerBackFlexibilityIndex && (
                    <MetricDisplay
                      label="Lower Back Flexibility"
                      value={calculated.lowerBackFlexibilityIndex}
                      size="sm"
                    />
                  )}
                  {calculated.functionalMobilityScore && (
                    <MetricDisplay
                      label="Functional Mobility"
                      value={calculated.functionalMobilityScore}
                      size="sm"
                    />
                  )}
                </MetricGrid>
              ),
            },
            {
              title: "Test Conditions",
              icon: "🌡️",
              content: (
                <MetricGrid columns={2} gap="md">
                  {data.testVariant && (
                    <MetricDisplay
                      label="Test Variant"
                      value={data.testVariant}
                      size="sm"
                    />
                  )}
                  {data.warmUpType && (
                    <MetricDisplay
                      label="Warm-up Type"
                      value={data.warmUpType.replace("_", " ")}
                      size="sm"
                    />
                  )}
                  {data.warmUpDuration && (
                    <MetricDisplay
                      label="Warm-up Duration"
                      value={data.warmUpDuration}
                      unit="min"
                      size="sm"
                    />
                  )}
                  {data.testSurface && (
                    <MetricDisplay
                      label="Surface"
                      value={data.testSurface}
                      size="sm"
                    />
                  )}
                  {data.roomTemperature && (
                    <MetricDisplay
                      label="Temperature"
                      value={data.roomTemperature}
                      unit="°C"
                      size="sm"
                    />
                  )}
                  {data.timeOfDay && (
                    <MetricDisplay
                      label="Time of Day"
                      value={data.timeOfDay}
                      size="sm"
                    />
                  )}
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
