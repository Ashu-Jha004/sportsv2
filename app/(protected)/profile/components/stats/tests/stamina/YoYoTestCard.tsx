// components/stats/tests/stamina/YoYoTestCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";

import { Activity } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import { calculatePerformanceLevel } from "@/app/(protected)/profile/lib/utils/performanceCalculations";

interface YoYoTestCardProps {
  data: any;
  recordedAt: string;
}

export function YoYoTestCard({ data, recordedAt }: YoYoTestCardProps) {
  const performanceLevel = calculatePerformanceLevel(
    data.totalDistance,
    "yoYoTest",
    "stamina"
  );

  const getRecoveryCapacityRating = (distance: number) => {
    if (distance >= 2000) return { label: "Elite", color: "text-purple-600" };
    if (distance >= 1600)
      return { label: "Excellent", color: "text-green-600" };
    if (distance >= 1200) return { label: "Good", color: "text-blue-600" };
    if (distance >= 800) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Needs Improvement", color: "text-orange-600" };
  };

  const recoveryRating = getRecoveryCapacityRating(data.totalDistance);

  return (
    <StatCard
      title="Yo-Yo Intermittent Recovery Test"
      icon={Activity}
      iconColor="text-pink-600"
      recordedAt={recordedAt}
      badge={{
        label: recoveryRating.label,
        color: recoveryRating.color,
      }}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-pink-50 rounded-xl border-2 border-pink-200 text-center">
            <h5 className="text-sm font-semibold text-pink-900 mb-2">
              Total Distance
            </h5>
            <div className="text-5xl font-bold text-pink-600 mb-1">
              {formatNumber(data.totalDistance, 0)}
            </div>
            <p className="text-xs text-pink-700">meters</p>
          </div>

          <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200 text-center">
            <h5 className="text-sm font-semibold text-purple-900 mb-2">
              Level Reached
            </h5>
            <div className="text-5xl font-bold text-purple-600 mb-1">
              {data.levelReached}
            </div>
            <p className="text-xs text-purple-700">Max level</p>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">
              Shuttles
            </h5>
            <div className="text-5xl font-bold text-blue-600 mb-1">
              {data.shuttlesCompleted}
            </div>
            <p className="text-xs text-blue-700">Total completed</p>
          </div>

          <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
            <h5 className="text-sm font-semibold text-green-900 mb-2">
              Estimated VO₂ Max
            </h5>
            <div className="text-4xl font-bold text-green-600 mb-1">
              {formatNumber(data.estimatedVO2Max, 1)}
            </div>
            <p className="text-xs text-green-700">ml/kg/min</p>
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

        {/* Recovery Capacity Analysis */}
        <div className="p-6 bg-linear-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200">
          <h4 className="text-sm font-semibold text-pink-900 mb-3 flex items-center gap-2">
            <span>🔄</span>
            Intermittent Recovery Capacity
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            The Yo-Yo test measures your ability to repeatedly perform
            high-intensity exercise with short recovery periods - crucial for
            team sports and interval training.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">Distance</p>
              <p className="text-xl font-bold text-pink-600">
                {formatNumber(data.totalDistance, 0)}m
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">Level</p>
              <p className="text-xl font-bold text-purple-600">
                {data.levelReached}.{data.shuttlesInFinalLevel}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">Rating</p>
              <p className={`text-xl font-bold ${recoveryRating.color}`}>
                {recoveryRating.label}
              </p>
            </div>
          </div>
        </div>

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
                    value={data.levelReached}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Shuttles in Final Level"
                    value={data.shuttlesInFinalLevel}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Total Shuttles"
                    value={data.shuttlesCompleted}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Total Distance"
                    value={formatNumber(data.totalDistance, 0)}
                    unit="m"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Final Speed"
                    value={formatNumber(data.finalSpeed, 1)}
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
              ),
            },
            {
              title: "Performance Standards",
              icon: "📚",
              content: (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 mb-3">
                    Yo-Yo IR1 distance standards:
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">Elite (2000m+):</strong>{" "}
                    <span className="text-purple-800">
                      Professional athlete level
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Excellent (1600-1999m):
                    </strong>{" "}
                    <span className="text-green-800">
                      Very high intermittent fitness
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Good (1200-1599m):
                    </strong>{" "}
                    <span className="text-blue-800">
                      Above average recovery capacity
                    </span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Fair (800-1199m):
                    </strong>{" "}
                    <span className="text-yellow-800">Average fitness</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Needs Improvement (&lt;800m):
                    </strong>{" "}
                    <span className="text-orange-800">
                      Focus on interval training
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
                      Yo-Yo IR1 Protocol
                    </h6>
                    <ul className="space-y-1 text-gray-700 ml-4">
                      <li>• 2 × 20m shuttle runs</li>
                      <li>• 10-second active recovery between shuttles</li>
                      <li>• Progressively increasing speed</li>
                      <li>• Start at 10 km/h</li>
                      <li>• Speed increases with each level</li>
                      <li>• Test ends when unable to maintain pace</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h6 className="font-semibold text-pink-900 mb-2">
                      Key Difference from Beep Test
                    </h6>
                    <p className="text-pink-800">
                      Unlike the continuous beep test, the Yo-Yo includes
                      10-second recovery periods. This makes it more specific to
                      team sports that require repeated high-intensity efforts
                      with brief recovery.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h6 className="font-semibold text-blue-900 mb-2">
                      Sport Applications
                    </h6>
                    <p className="text-blue-800">
                      Highly relevant for soccer, basketball, rugby, hockey, and
                      other team sports requiring repeated sprints and
                      recoveries.
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
