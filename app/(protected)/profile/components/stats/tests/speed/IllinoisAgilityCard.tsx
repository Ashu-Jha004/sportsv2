// components/stats/tests/speed/IllinoisAgilityCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { AttemptsTable } from "../../shared/AttemptsTable";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { TestConditions } from "../../shared/TestConditions";
import { StatisticalSummary } from "../../shared/StatisticalSummary";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { IllinoisAgilityTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Activity } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import { calculatePerformanceLevel } from "@/app/(protected)/profile/lib/utils/performanceCalculations";

interface IllinoisAgilityCardProps {
  data: IllinoisAgilityTest;
  recordedAt: string;
}

export function IllinoisAgilityCard({
  data,
  recordedAt,
}: IllinoisAgilityCardProps) {
  const { attempts, calculated }: any = data;

  const performanceLevel = calculatePerformanceLevel(
    calculated.bestTime,
    "illinoisAgility",
    "speed"
  );

  // Find best attempt
  const bestAttemptIndex = attempts.findIndex(
    (a: any) => a.time === calculated.bestTime
  );

  const getConsistencyColor = (consistency: string) => {
    const colors: Record<string, string> = {
      Excellent: "text-green-600",
      Good: "text-blue-600",
      Fair: "text-yellow-600",
      Poor: "text-orange-600",
    };
    return colors[consistency] || "text-gray-600";
  };

  return (
    <StatCard
      title="Illinois Agility Test"
      icon={Activity}
      iconColor="text-blue-600"
      recordedAt={recordedAt}
      badge={{
        label: performanceLevel.level,
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
              label="Best Time"
              value={formatNumber(calculated.bestTime, 2)}
              unit="s"
              icon="🏆"
              color="text-blue-600"
              tooltip="Fastest attempt time"
            />
            <MetricDisplay
              label="Mean Time"
              value={formatNumber(calculated.meanTime, 2)}
              unit="s"
              icon="📊"
              color="text-purple-600"
              tooltip="Average across all attempts"
            />
            <MetricDisplay
              label="Consistency"
              value={calculated.speedConsistency}
              icon="🎯"
              color={getConsistencyColor(calculated.speedConsistency)}
              tooltip="Based on coefficient of variation"
            />
            <MetricDisplay
              label="Percentile"
              value={`${calculated.percentile}th`}
              icon="📈"
              color="text-green-600"
              tooltip="Ranking compared to norms"
            />
          </MetricGrid>
        </div>

        {/* Performance Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h5 className="text-sm font-semibold text-blue-900 mb-3">
              Performance Rating
            </h5>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {calculated.performanceRating}
              </div>
              <PerformanceBadge performance={performanceLevel} size="md" />
            </div>
          </div>

          <div className="p-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <h5 className="text-sm font-semibold text-purple-900 mb-3">
              Age Group Comparison
            </h5>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {calculated.ageGroupComparison}
              </div>
              <p className="text-sm text-purple-700">
                {calculated.normsDifference > 0 ? "+" : ""}
                {formatNumber(calculated.normsDifference, 2)}s from norm
              </p>
              <p className="text-xs text-purple-600 mt-1">
                ({calculated.normsPercentageDifference > 0 ? "+" : ""}
                {formatNumber(calculated.normsPercentageDifference, 1)}%)
              </p>
            </div>
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
                key: "time",
                label: "Time (s)",
                align: "right",
                format: (value) => formatNumber(value, 2),
              },
              {
                key: "valid",
                label: "Valid",
                align: "center",
                format: (value) => (value ? "✓" : "✗"),
              },
            ]}
            bestAttemptIndex={bestAttemptIndex}
          />
        </div>

        {/* Statistical Analysis */}
        <StatisticalSummary
          data={{
            mean: calculated.meanTime,
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
            surface: data.surfaceType,
            weather: data.weatherConditions,
            equipment: data.equipmentNotes,
            location: `${data.courseLength}m × ${data.courseWidth}m course`,
          }}
        />

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Advanced Statistics",
              icon: "📊",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Fatigue Index"
                    value={formatNumber(calculated.fatigueIndex, 1)}
                    tooltip="Performance decline from best to worst attempt"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Reliability Score"
                    value={formatNumber(calculated.reliabilityScore, 2)}
                    tooltip="Test-retest reliability measure"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Intra-Individual Variability"
                    value={formatNumber(
                      calculated.intraIndividualVariability,
                      2
                    )}
                    tooltip="Consistency within individual"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Variance"
                    value={formatNumber(calculated.variance, 3)}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Q1 (25th percentile)"
                    value={formatNumber(calculated.q1Time, 2)}
                    unit="s"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Q3 (75th percentile)"
                    value={formatNumber(calculated.q3Time, 2)}
                    unit="s"
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
                      Course Setup
                    </h6>
                    <ul className="space-y-1 text-gray-700 ml-4">
                      <li>• Length: {data.courseLength}m</li>
                      <li>• Width: {data.courseWidth}m</li>
                      <li>• Surface: {data.surfaceType}</li>
                      <li>• 4 cones down center line (3.3m apart)</li>
                      <li>• Start and finish at same point</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h6 className="font-semibold text-blue-900 mb-2">
                      Test Description
                    </h6>
                    <p className="text-blue-800">
                      Athlete lies prone at start, sprints 10m, weaves through 4
                      cones, sprints 10m, turns 180°, sprints back 10m, weaves
                      through cones again, and sprints final 10m to finish.
                      Total distance: ~60m with direction changes.
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
                    Illinois Agility Test standards (general population):
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      Excellent (&lt; 15.2s):
                    </strong>{" "}
                    <span className="text-purple-800">Outstanding agility</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Good (15.2-16.1s):
                    </strong>{" "}
                    <span className="text-green-800">Above average</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Average (16.2-18.1s):
                    </strong>{" "}
                    <span className="text-blue-800">Typical performance</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Fair (18.2-19.3s):
                    </strong>{" "}
                    <span className="text-yellow-800">Below average</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Poor (&gt; 19.3s):
                    </strong>{" "}
                    <span className="text-orange-800">Needs improvement</span>
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
                    label="Gender"
                    value={data.athleteGender}
                    size="sm"
                  />
                  <MetricDisplay label="Age" value={data.age} size="sm" />
                  <MetricDisplay
                    label="Body Weight"
                    value={formatNumber(data.bodyWeight, 1)}
                    unit="kg"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Test Conditions"
                    value={data.testConditions}
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
