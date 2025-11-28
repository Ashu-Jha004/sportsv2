// components/stats/tests/speed/VisualReactionCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { TrialsChart } from "../../shared/TrialsChart";
import { StatisticalSummary } from "../../shared/StatisticalSummary";
import { TestConditions } from "../../shared/TestConditions";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { VisualReactionTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Zap } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
interface VisualReactionCardProps {
  data: VisualReactionTest;
  recordedAt: string;
}

export function VisualReactionCard({
  data,
  recordedAt,
}: VisualReactionCardProps) {
  const { trials, calculated } = data;

  const getPerformanceColor = (rating: string) => {
    const colors: Record<string, string> = {
      Elite: "text-purple-600",
      Excellent: "text-green-600",
      Good: "text-blue-600",
      Average: "text-yellow-600",
      "Below Average": "text-orange-600",
    };
    return colors[rating] || "text-gray-600";
  };

  const getAccuracyColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600";
    if (percentage >= 85) return "text-blue-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-orange-600";
  };

  // Prepare chart data
  const chartData = trials.map((trial) => ({
    trial: trial.trialNumber,
    value: trial.reactionTime,
    label: trial.correct ? "✓" : "✗",
  }));

  return (
    <StatCard
      title="Visual Reaction Speed Drill"
      icon={Zap}
      iconColor="text-yellow-600"
      recordedAt={recordedAt}
      badge={{
        label: calculated.performanceRating,
        color: getPerformanceColor(calculated.performanceRating),
      }}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Reaction Time Performance
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Best Time"
              value={formatNumber(calculated.bestTime * 1000, 0)}
              unit="ms"
              icon="⚡"
              color="text-yellow-600"
              tooltip="Fastest reaction time"
            />
            <MetricDisplay
              label="Average Time"
              value={formatNumber(calculated.cleanedAverageTime * 1000, 0)}
              unit="ms"
              icon="📊"
              color="text-blue-600"
              tooltip="Mean excluding outliers"
            />
            <MetricDisplay
              label="Accuracy"
              value={formatNumber(calculated.accuracyPercentage, 1)}
              unit="%"
              icon="🎯"
              color={getAccuracyColor(calculated.accuracyPercentage)}
              tooltip="Percentage of correct responses"
            />
            <MetricDisplay
              label="Consistency"
              value={calculated.consistency}
              icon="📈"
              color="text-purple-600"
              tooltip="Based on coefficient of variation"
            />
          </MetricGrid>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h5 className="text-xs font-semibold text-yellow-900 mb-1">
              Cognitive Speed
            </h5>
            <div className="text-2xl font-bold text-yellow-600">
              {calculated.cognitiveSpeed}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-xs font-semibold text-blue-900 mb-1">
              Reliability Index
            </h5>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(calculated.reliabilityIndex, 2)}
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="text-xs font-semibold text-purple-900 mb-1">
              Improvement Index
            </h5>
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(calculated.improvementIndex, 2)}
            </div>
          </div>
        </div>

        {/* Trials Chart */}
        <TrialsChart
          data={chartData}
          unit="s"
          yAxisLabel="Reaction Time (seconds)"
          highlightBest={true}
        />

        {/* Accuracy Breakdown */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">
            Response Accuracy
          </h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {calculated.correctResponses}
                </div>
                <p className="text-sm text-green-700">Correct</p>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {calculated.totalTrials - calculated.correctResponses}
                </div>
                <p className="text-sm text-red-700">Incorrect</p>
              </div>
            </div>
          </div>

          {/* Accuracy Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Accuracy Rate</span>
              <span
                className={`font-bold ${getAccuracyColor(
                  calculated.accuracyPercentage
                )}`}
              >
                {formatNumber(calculated.accuracyPercentage, 1)}%
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  calculated.accuracyPercentage >= 95
                    ? "bg-green-500"
                    : calculated.accuracyPercentage >= 85
                    ? "bg-blue-500"
                    : calculated.accuracyPercentage >= 75
                    ? "bg-yellow-500"
                    : "bg-orange-500"
                }`}
                style={{ width: `${calculated.accuracyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Statistical Summary */}
        <StatisticalSummary
          data={{
            mean: calculated.averageTime,
            median: calculated.medianTime,
            stdDev: calculated.standardDeviation,
            min: calculated.bestTime,
            max: calculated.worstTime,
            cv: calculated.coefficientOfVariation,
          }}
          unit="s"
          decimals={3}
        />

        {/* Test Conditions */}
        <TestConditions
          conditions={{
            equipment: data.equipmentUsed,
            location: data.testingEnvironment,
            stimulusType: data.stimulusType,
            numberOfStimuli: data.numberOfStimuli,
            randomDelay: data.randomDelay ? "Yes" : "No",
            preparationTime: `${data.preparationTime}s`,
          }}
        />

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Trial-by-Trial Results",
              icon: "📋",
              content: (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="py-2 px-3 text-left">Trial</th>
                        <th className="py-2 px-3 text-right">Time (ms)</th>
                        <th className="py-2 px-3 text-center">Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trials.map((trial) => {
                        const isBest =
                          trial.reactionTime === calculated.bestTime;
                        return (
                          <tr
                            key={trial.trialNumber}
                            className={`border-b border-gray-100 ${
                              isBest ? "bg-yellow-50 font-semibold" : ""
                            }`}
                          >
                            <td className="py-2 px-3">
                              {isBest && "🏆 "}Trial {trial.trialNumber}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {formatNumber(trial.reactionTime * 1000, 0)} ms
                            </td>
                            <td className="py-2 px-3 text-center">
                              {trial.correct ? (
                                <span className="text-green-600 text-lg">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-red-600 text-lg">✗</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              title: "Advanced Metrics",
              icon: "📊",
              content: (
                <MetricGrid columns={2} gap="md">
                  {calculated.fatigueIndex !== null && (
                    <MetricDisplay
                      label="Fatigue Index"
                      value={formatNumber(calculated.fatigueIndex, 2)}
                      tooltip="Performance decline over trials"
                      size="sm"
                    />
                  )}
                  <MetricDisplay
                    label="Improvement Index"
                    value={formatNumber(calculated.improvementIndex, 2)}
                    tooltip="Learning/adaptation rate"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Outliers Detected"
                    value={calculated.outliers.length}
                    size="sm"
                  />
                  <MetricDisplay
                    label="IQR"
                    value={formatNumber(
                      calculated.interquartileRange * 1000,
                      0
                    )}
                    unit="ms"
                    tooltip="Interquartile range"
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
                    Visual reaction time standards:
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      Elite (&lt; 150ms):
                    </strong>{" "}
                    <span className="text-purple-800">
                      Professional athlete level
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Excellent (150-180ms):
                    </strong>{" "}
                    <span className="text-green-800">Very fast reactions</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">Good (180-220ms):</strong>{" "}
                    <span className="text-blue-800">Above average</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Average (220-270ms):
                    </strong>{" "}
                    <span className="text-yellow-800">Typical performance</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Below Average (&gt; 270ms):
                    </strong>{" "}
                    <span className="text-orange-800">Needs training</span>
                  </div>
                </div>
              ),
            },
            {
              title: "Athlete Details",
              icon: "👤",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Age"
                    value={data.athleteAge}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Gender"
                    value={data.athleteGender}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Dominant Hand"
                    value={data.dominantHand}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Athlete Condition"
                    value={data.athleteCondition}
                    size="sm"
                  />
                </MetricGrid>
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
