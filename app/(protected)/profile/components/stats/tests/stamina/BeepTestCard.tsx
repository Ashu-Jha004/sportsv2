// components/stats/tests/stamina/BeepTestCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { ComparisonBar } from "../../shared/ComparisonBar";
import { InsightCard } from "../../shared/InsightCard";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import { Activity } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import {
  calculatePerformanceLevel,
  compareToElite,
  generateInsight,
} from "../../../../lib/utils/performanceCalculations";

interface BeepTestCardProps {
  data: any;
  recordedAt: string;
}

export function BeepTestCard({ data, recordedAt }: BeepTestCardProps) {
  // Add null checks and access calculated values
  if (!data || !data.calculated) {
    return (
      <StatCard
        title="Beep Test (Multi-Stage Fitness Test)"
        icon={Activity}
        iconColor="text-purple-600"
        recordedAt={recordedAt}
      >
        <div className="p-4 text-center text-gray-500">
          <p>No beep test data available</p>
        </div>
      </StatCard>
    );
  }

  // Extract values from calculated object
  const vo2Max = data.calculated.estimatedVO2Max || 0;
  const totalDistance = data.calculated.totalDistance || 0;
  const finalSpeed = data.calculated.finalSpeed || 0;
  const totalShuttles = data.calculated.totalShuttles || 0;
  const testDuration = data.calculated.totalTime || 0;
  const levelReached = data.levelReached || 0;
  const shuttlesInFinalLevel = data.shuttlesInFinalLevel || 0;

  const performanceLevel = calculatePerformanceLevel(
    vo2Max,
    "beepTest",
    "stamina"
  );

  const eliteComparison = compareToElite(vo2Max, "beepTest", "stamina");

  const insight = generateInsight(
    "Beep Test",
    performanceLevel,
    eliteComparison
  );

  const getVO2MaxCategory = (vo2Max: number) => {
    if (vo2Max >= 60) return { label: "Superior", color: "text-purple-600" };
    if (vo2Max >= 52) return { label: "Excellent", color: "text-green-600" };
    if (vo2Max >= 47) return { label: "Good", color: "text-blue-600" };
    if (vo2Max >= 42) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Poor", color: "text-orange-600" };
  };

  const vo2Category = getVO2MaxCategory(vo2Max);

  return (
    <StatCard
      title="Beep Test (Multi-Stage Fitness Test)"
      icon={Activity}
      iconColor="text-purple-600"
      recordedAt={recordedAt}
      badge={{
        label: vo2Category.label,
        color: vo2Category.color,
      }}
      collapsible
      defaultExpanded={true}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200 text-center">
            <h5 className="text-sm font-semibold text-purple-900 mb-2">
              VO₂ Max
            </h5>
            <div className="text-5xl font-bold text-purple-600 mb-1">
              {formatNumber(vo2Max, 1)}
            </div>
            <p className="text-xs text-purple-700">ml/kg/min</p>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">
              Level Reached
            </h5>
            <div className="text-5xl font-bold text-blue-600 mb-1">
              {levelReached}
            </div>
            <p className="text-xs text-blue-700">Max level</p>
          </div>

          <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
            <h5 className="text-sm font-semibold text-green-900 mb-2">
              Shuttles
            </h5>
            <div className="text-5xl font-bold text-green-600 mb-1">
              {totalShuttles}
            </div>
            <p className="text-xs text-green-700">Total completed</p>
          </div>

          <div className="p-6 bg-orange-50 rounded-xl border-2 border-orange-200 text-center">
            <h5 className="text-sm font-semibold text-orange-900 mb-2">
              Total Distance
            </h5>
            <div className="text-4xl font-bold text-orange-600 mb-1">
              {formatNumber(totalDistance, 0)}
              <span className="text-lg">m</span>
            </div>
            <p className="text-xs text-orange-700">
              {formatNumber(totalDistance / 1000, 2)} km
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

        {/* VO2 Max Explanation */}
        <div className="p-6 bg-linear-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
          <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <span>💡</span>
            Understanding VO₂ Max
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            VO₂ Max is the maximum rate of oxygen consumption during exercise.
            It's considered the gold standard for measuring cardiovascular
            fitness and aerobic endurance.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Your VO₂ Max</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatNumber(vo2Max, 1)}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Category</p>
              <p className={`text-2xl font-bold ${vo2Category.color}`}>
                {vo2Category.label}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {data.calculated && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.calculated.caloriesBurned && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                <p className="text-xs text-red-700 mb-1">Calories Burned</p>
                <p className="text-xl font-bold text-red-600">
                  {formatNumber(data.calculated.caloriesBurned, 0)}
                </p>
              </div>
            )}
            {data.calculated.percentileRank && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <p className="text-xs text-blue-700 mb-1">Percentile Rank</p>
                <p className="text-xl font-bold text-blue-600">
                  {data.calculated.percentileRank}th
                </p>
              </div>
            )}
            {data.calculated.fitnessAge && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="text-xs text-green-700 mb-1">Fitness Age</p>
                <p className="text-xl font-bold text-green-600">
                  {data.calculated.fitnessAge}
                </p>
              </div>
            )}
            {data.calculated.vo2MaxRating && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                <p className="text-xs text-purple-700 mb-1">Rating</p>
                <p className="text-lg font-bold text-purple-600">
                  {data.calculated.vo2MaxRating}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Test Details",
              icon: "📊",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Level Reached"
                    value={levelReached}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Shuttles in Final Level"
                    value={shuttlesInFinalLevel}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Total Shuttles"
                    value={totalShuttles}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Total Distance"
                    value={formatNumber(totalDistance, 0)}
                    unit="m"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Test Duration"
                    value={formatNumber(testDuration / 60, 1)}
                    unit="min"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Final Speed"
                    value={formatNumber(finalSpeed, 1)}
                    unit="km/h"
                    size="sm"
                  />
                </MetricGrid>
              ),
            },
            {
              title: "Advanced Metrics",
              icon: "📈",
              content: (
                <MetricGrid columns={2} gap="md">
                  {data.calculated.metabolicEquivalent && (
                    <MetricDisplay
                      label="Metabolic Equivalent (METs)"
                      value={formatNumber(
                        data.calculated.metabolicEquivalent,
                        1
                      )}
                      size="sm"
                    />
                  )}
                  {data.calculated.heartRateReserve && (
                    <MetricDisplay
                      label="Heart Rate Reserve"
                      value={data.calculated.heartRateReserve}
                      unit="bpm"
                      size="sm"
                    />
                  )}
                  {data.calculated.anaerobicThreshold && (
                    <MetricDisplay
                      label="Anaerobic Threshold"
                      value={formatNumber(
                        data.calculated.anaerobicThreshold,
                        1
                      )}
                      unit="ml/kg/min"
                      size="sm"
                    />
                  )}
                  {data.calculated.performanceIndex && (
                    <MetricDisplay
                      label="Performance Index"
                      value={data.calculated.performanceIndex}
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
                  {data.surfaceType && (
                    <MetricDisplay
                      label="Surface"
                      value={data.surfaceType.replace("_", " ")}
                      size="sm"
                    />
                  )}
                  {data.temperature && (
                    <MetricDisplay
                      label="Temperature"
                      value={data.temperature}
                      unit="°C"
                      size="sm"
                    />
                  )}
                  {data.altitude !== undefined && (
                    <MetricDisplay
                      label="Altitude"
                      value={data.altitude}
                      unit="m"
                      size="sm"
                    />
                  )}
                  {data.humidity !== undefined && (
                    <MetricDisplay
                      label="Humidity"
                      value={data.humidity}
                      unit="%"
                      size="sm"
                    />
                  )}
                  {data.rpeScore && (
                    <MetricDisplay
                      label="RPE Score"
                      value={`${data.rpeScore}/10`}
                      size="sm"
                    />
                  )}
                  {data.testTerminationReason && (
                    <MetricDisplay
                      label="Test End Reason"
                      value={data.testTerminationReason.replace("_", " ")}
                      size="sm"
                    />
                  )}
                </MetricGrid>
              ),
            },
            {
              title: "VO₂ Max Standards",
              icon: "📚",
              content: (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 mb-3">
                    VO₂ Max standards (ml/kg/min) for adults:
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">Superior (60+):</strong>{" "}
                    <span className="text-purple-800">Elite athlete level</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Excellent (52-59):
                    </strong>{" "}
                    <span className="text-green-800">Very high fitness</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">Good (47-51):</strong>{" "}
                    <span className="text-blue-800">Above average fitness</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">Fair (42-46):</strong>{" "}
                    <span className="text-yellow-800">Average fitness</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">Poor (&lt;42):</strong>{" "}
                    <span className="text-orange-800">
                      Below average, needs improvement
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
                      How It Works
                    </h6>
                    <ul className="space-y-1 text-gray-700 ml-4">
                      <li>• 20-meter shuttle runs</li>
                      <li>• Progressively increasing speed</li>
                      <li>• Audio beeps signal pace</li>
                      <li>• Start at 8.5 km/h (Level 1)</li>
                      <li>• Speed increases 0.5 km/h each level</li>
                      <li>• Test continues until exhaustion</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h6 className="font-semibold text-blue-900 mb-2">
                      Benefits
                    </h6>
                    <p className="text-blue-800">
                      The beep test assesses cardiovascular endurance, mental
                      toughness, and pacing ability. It's widely used in sports
                      for measuring aerobic fitness.
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
