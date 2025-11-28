// components/stats/tests/stamina/CooperTestCard.tsx
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

interface CooperTestCardProps {
  data: any;
  recordedAt: string;
}

export function CooperTestCard({ data, recordedAt }: CooperTestCardProps) {
  const performanceLevel = calculatePerformanceLevel(
    data.distanceCovered,
    "cooperTest",
    "stamina"
  );

  const eliteComparison = compareToElite(
    data.distanceCovered,
    "cooperTest",
    "stamina"
  );

  const insight = generateInsight(
    "Cooper Test",
    performanceLevel,
    eliteComparison
  );

  // Calculate average pace
  const avgPaceMinPerKm = 12 / (data.distanceCovered / 1000);
  const avgSpeed = data.distanceCovered / 1000 / (12 / 60); // km/h

  return (
    <StatCard
      title="Cooper 12-Minute Run Test"
      icon={Activity}
      iconColor="text-teal-600"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-teal-50 rounded-xl border-2 border-teal-200 text-center">
            <h5 className="text-sm font-semibold text-teal-900 mb-2">
              Distance Covered
            </h5>
            <div className="text-5xl font-bold text-teal-600 mb-1">
              {formatNumber(data.distanceCovered, 0)}
            </div>
            <p className="text-xs text-teal-700">meters</p>
            <p className="text-sm font-semibold text-teal-600 mt-2">
              {formatNumber(data.distanceCovered / 1000, 2)} km
            </p>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">
              Estimated VO₂ Max
            </h5>
            <div className="text-5xl font-bold text-blue-600 mb-1">
              {formatNumber(data.estimatedVO2Max, 1)}
            </div>
            <p className="text-xs text-blue-700">ml/kg/min</p>
          </div>

          <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200 text-center">
            <h5 className="text-sm font-semibold text-purple-900 mb-2">
              Average Pace
            </h5>
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {formatNumber(avgPaceMinPerKm, 2)}
            </div>
            <p className="text-xs text-purple-700">min/km</p>
          </div>

          <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
            <h5 className="text-sm font-semibold text-green-900 mb-2">
              Average Speed
            </h5>
            <div className="text-4xl font-bold text-green-600 mb-1">
              {formatNumber(avgSpeed, 1)}
            </div>
            <p className="text-xs text-green-700">km/h</p>
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

        {/* Pacing Analysis */}
        <div className="p-6 bg-linear-to-r from-teal-50 to-blue-50 rounded-xl border-2 border-teal-200">
          <h4 className="text-sm font-semibold text-teal-900 mb-3 flex items-center gap-2">
            <span>🏃</span>
            Pacing & Efficiency
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Average Pace</p>
              <p className="text-2xl font-bold text-teal-600">
                {Math.floor(avgPaceMinPerKm)}:
                {String(Math.round((avgPaceMinPerKm % 1) * 60)).padStart(
                  2,
                  "0"
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">per kilometer</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Estimated VO₂ Max</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(data.estimatedVO2Max, 1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">ml/kg/min</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-900">
            <strong>Formula:</strong> VO₂ Max = (Distance - 504.9) / 44.73
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
                  <MetricGrid columns={2} gap="md">
                    <MetricDisplay
                      label="Distance Covered"
                      value={formatNumber(data.distanceCovered, 0)}
                      unit="m"
                      size="sm"
                    />
                    <MetricDisplay
                      label="In Kilometers"
                      value={formatNumber(data.distanceCovered / 1000, 3)}
                      unit="km"
                      size="sm"
                    />
                    <MetricDisplay
                      label="Average Speed"
                      value={formatNumber(avgSpeed, 2)}
                      unit="km/h"
                      size="sm"
                    />
                    <MetricDisplay
                      label="Estimated VO₂ Max"
                      value={formatNumber(data.estimatedVO2Max, 1)}
                      unit="ml/kg/min"
                      size="sm"
                    />
                  </MetricGrid>

                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h6 className="text-sm font-semibold text-teal-900 mb-2">
                      Pace Breakdown
                    </h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per 400m:</span>
                        <span className="font-semibold">
                          {formatNumber(
                            (12 * 60) / (data.distanceCovered / 400),
                            1
                          )}
                          s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per 1km:</span>
                        <span className="font-semibold">
                          {Math.floor(avgPaceMinPerKm)}:
                          {String(
                            Math.round((avgPaceMinPerKm % 1) * 60)
                          ).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per mile:</span>
                        <span className="font-semibold">
                          {formatNumber(avgPaceMinPerKm * 1.60934, 2)} min
                        </span>
                      </div>
                    </div>
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
                    Cooper Test distance standards for males (18-29 years):
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      Excellent (2800m+):
                    </strong>{" "}
                    <span className="text-purple-800">Elite endurance</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Good (2400-2799m):
                    </strong>{" "}
                    <span className="text-green-800">
                      Above average fitness
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Average (2200-2399m):
                    </strong>{" "}
                    <span className="text-blue-800">Typical fitness level</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Fair (1600-2199m):
                    </strong>{" "}
                    <span className="text-yellow-800">Below average</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Poor (&lt;1600m):
                    </strong>{" "}
                    <span className="text-orange-800">
                      Needs significant improvement
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Note: Standards vary by age and gender. Consult age-specific
                    tables for accurate assessment.
                  </p>
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
                      How to Perform
                    </h6>
                    <ul className="space-y-1 text-gray-700 ml-4">
                      <li>• Run/jog for exactly 12 minutes</li>
                      <li>• Cover as much distance as possible</li>
                      <li>• Maintain steady, sustainable pace</li>
                      <li>• Use 400m track or measured course</li>
                      <li>• Warm up properly before test</li>
                      <li>• Record total distance covered</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <h6 className="font-semibold text-teal-900 mb-2">
                      Historical Context
                    </h6>
                    <p className="text-teal-800">
                      Developed by Dr. Kenneth Cooper in 1968, this test was
                      designed to assess aerobic fitness for military personnel.
                      It's now widely used in sports and fitness.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h6 className="font-semibold text-blue-900 mb-2">
                      Benefits
                    </h6>
                    <p className="text-blue-800">
                      Simple to administer, requires minimal equipment, provides
                      reliable VO₂ Max estimation, and tests pacing strategy
                      alongside endurance.
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
