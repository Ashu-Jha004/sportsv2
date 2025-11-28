// components/stats/tests/speed/ReactiveTTestCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { AttemptsTable } from "../../shared/AttemptsTable";
import { StatisticalSummary } from "../../shared/StatisticalSummary";
import { TestConditions } from "../../shared/TestConditions";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { ReactiveTTestTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Activity } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
interface ReactiveTTestCardProps {
  data: ReactiveTTestTest;
  recordedAt: string;
}

export function ReactiveTTestCard({
  data,
  recordedAt,
}: ReactiveTTestCardProps) {
  const { attempts, calculated } = data;

  const getPerformanceColor = (rating: string) => {
    const colors: Record<string, string> = {
      Elite: "text-purple-600",
      Excellent: "text-green-600",
      Good: "text-blue-600",
      Average: "text-yellow-600",
      Poor: "text-orange-600",
    };
    return colors[rating] || "text-gray-600";
  };

  const getConsistencyColor = (consistency: string) => {
    const colors: Record<string, string> = {
      Excellent: "text-green-600",
      Good: "text-blue-600",
      Fair: "text-yellow-600",
      Poor: "text-orange-600",
    };
    return colors[consistency] || "text-gray-600";
  };

  // Find best attempt
  const bestAttemptIndex = attempts.findIndex(
    (a) => a.totalTime === calculated.bestTime
  );

  return (
    <StatCard
      title="Reactive Agility T-Test"
      icon={Activity}
      iconColor="text-orange-600"
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
            Performance Summary
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Best Time"
              value={formatNumber(calculated.bestTime, 2)}
              unit="s"
              icon="🏆"
              color="text-orange-600"
              tooltip="Fastest attempt including penalties"
            />
            <MetricDisplay
              label="Average Time"
              value={formatNumber(calculated.averageTime, 2)}
              unit="s"
              icon="📊"
              color="text-blue-600"
            />
            <MetricDisplay
              label="Accuracy"
              value={formatNumber(calculated.accuracyPercentage, 1)}
              unit="%"
              icon="🎯"
              color="text-green-600"
              tooltip="Correct directional responses"
            />
            <MetricDisplay
              label="Consistency"
              value={calculated.consistency}
              icon="📈"
              color={getConsistencyColor(calculated.consistency)}
            />
          </MetricGrid>
        </div>

        {/* Decision vs Movement Time */}
        {calculated.averageDecisionTime &&
          calculated.averageMovementTime !== null && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                <h5 className="text-sm font-semibold text-purple-900 mb-2">
                  Avg Decision Time
                </h5>
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {formatNumber(calculated.averageDecisionTime * 1000, 0)}
                  <span className="text-lg text-purple-500 ml-1">ms</span>
                </div>
                <p className="text-xs text-purple-700">
                  Cognitive processing time
                </p>
              </div>

              <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h5 className="text-sm font-semibold text-blue-900 mb-2">
                  Avg Movement Time
                </h5>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {formatNumber(calculated.averageMovementTime, 2)}
                  <span className="text-lg text-blue-500 ml-1">s</span>
                </div>
                <p className="text-xs text-blue-700">Physical execution time</p>
              </div>
            </div>
          )}

        {/* Cognitive Agility Score */}
        <div className="p-6 bg-linear-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <h5 className="text-sm font-semibold text-orange-900 mb-2">
                Cognitive Agility Score
              </h5>
              <div className="text-4xl font-bold text-orange-600">
                {formatNumber(calculated.cognitiveAgilityScore, 1)}
              </div>
            </div>

            <div className="text-center">
              <h5 className="text-sm font-semibold text-blue-900 mb-2">
                Change of Direction Speed
              </h5>
              <div className="text-4xl font-bold text-blue-600">
                {formatNumber(calculated.changeOfDirectionSpeed, 2)}
              </div>
            </div>

            <div className="text-center">
              <h5 className="text-sm font-semibold text-purple-900 mb-2">
                Reactive Cognitive Cost
              </h5>
              <div className="text-4xl font-bold text-purple-600">
                {formatNumber(calculated.reactiveCognitiveCost, 1)}
                <span className="text-lg text-purple-500 ml-1">%</span>
              </div>
              <p className="text-xs text-purple-700 mt-1">
                Time added by decision-making
              </p>
            </div>
          </div>
        </div>

        {/* Accuracy Breakdown */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">
            Response Accuracy
          </h5>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded border border-green-200 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {calculated.correctResponses}
              </div>
              <p className="text-sm text-green-700">Correct</p>
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-200 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {calculated.totalAttempts - calculated.correctResponses}
              </div>
              <p className="text-sm text-red-700">Incorrect</p>
            </div>
            <div className="p-3 bg-orange-50 rounded border border-orange-200 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {formatNumber(calculated.totalPenaltyTime, 1)}
                <span className="text-sm">s</span>
              </div>
              <p className="text-sm text-orange-700">Total Penalties</p>
            </div>
          </div>

          {/* Accuracy Progress Bar */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Accuracy Rate</span>
            <span className="font-bold text-green-600">
              {formatNumber(calculated.accuracyPercentage, 1)}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-1000"
              style={{ width: `${calculated.accuracyPercentage}%` }}
            />
          </div>
        </div>

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
                key: "totalTime",
                label: "Total Time (s)",
                align: "right",
                format: (value) => formatNumber(value, 2),
              },
              {
                key: "decisionTime",
                label: "Decision (ms)",
                align: "right",
                format: (value) => formatNumber(value * 1000, 0),
              },
              {
                key: "cuedDirection",
                label: "Direction",
                align: "center",
                format: (value) => value.toUpperCase(),
              },
              {
                key: "responseCorrect",
                label: "Correct",
                align: "center",
                format: (value) => (value ? "✓" : "✗"),
              },
              {
                key: "penaltySeconds",
                label: "Penalty (s)",
                align: "right",
                format: (value) => (value > 0 ? `+${value}` : "-"),
              },
            ]}
            bestAttemptIndex={bestAttemptIndex}
          />
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
          decimals={2}
        />

        {/* Test Conditions */}
        <TestConditions
          conditions={{
            testMode: data.testMode,
            surface: data.surfaceType,
            footwear: data.footwear,
            cueType: data.cueType,
            cueDelay: `${data.cueDelay}s`,
            courseDistance: `${data.courseDistance}m`,
            coneSpacing: `${data.coneSpacing}m`,
          }}
        />

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Advanced Metrics",
              icon: "📊",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Decision:Movement Ratio"
                    value={
                      calculated.decisionToMovementRatio !== null
                        ? formatNumber(calculated.decisionToMovementRatio, 3)
                        : "N/A"
                    }
                    tooltip="Ratio of cognitive to physical time"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Est. Traditional T-Test"
                    value={formatNumber(calculated.estimatedTraditionalTime, 2)}
                    unit="s"
                    tooltip="Estimated time without reactive component"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Learning Curve"
                    value={formatNumber(calculated.learningCurve, 2)}
                    tooltip="Performance improvement over attempts"
                    size="sm"
                  />
                  {calculated.fatigueIndex !== null && (
                    <MetricDisplay
                      label="Fatigue Index"
                      value={formatNumber(calculated.fatigueIndex, 2)}
                      tooltip="Performance decline indicator"
                      size="sm"
                    />
                  )}
                  <MetricDisplay
                    label="Reliability Score"
                    value={formatNumber(calculated.reliabilityScore, 2)}
                    tooltip="Test-retest reliability"
                    size="sm"
                  />
                </MetricGrid>
              ),
            },
            {
              title: "Test Protocol",
              icon: "📋",
              content: (
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h6 className="font-semibold text-gray-900 mb-2">
                      Reactive T-Test Setup
                    </h6>
                    <ul className="space-y-1 text-gray-700 ml-4">
                      <li>• Standard T-test course ({data.courseDistance}m)</li>
                      <li>• Visual or auditory cue for direction</li>
                      <li>• Athlete responds to cue during test</li>
                      <li>• Penalty for incorrect direction</li>
                      <li>• Tests both physical and cognitive agility</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h6 className="font-semibold text-blue-900 mb-2">
                      Key Differences
                    </h6>
                    <p className="text-blue-800">
                      Unlike traditional T-test, reactive version adds
                      decision-making under time pressure, making it more
                      sport-specific for scenarios requiring rapid cognitive
                      processing during movement.
                    </p>
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
                    Reactive T-Test standards (vary by cue delay and sport):
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">Elite:</strong>{" "}
                    <span className="text-purple-800">
                      Fast times with &gt;90% accuracy
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">Excellent:</strong>{" "}
                    <span className="text-green-800">
                      Good speed and 85-90% accuracy
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">Good:</strong>{" "}
                    <span className="text-blue-800">
                      Balanced speed and accuracy (80-85%)
                    </span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">Average:</strong>{" "}
                    <span className="text-yellow-800">
                      Moderate performance
                    </span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">Poor:</strong>{" "}
                    <span className="text-orange-800">
                      Slow times or low accuracy (&lt;75%)
                    </span>
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
                    label="Primary Sport"
                    value={data.primarySport}
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
