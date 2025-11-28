// components/stats/tests/speed/StandingLongJumpCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { PerformanceBadge } from "../../shared/PerformanceBadge";
import { ComparisonBar } from "../../shared/ComparisonBar";
import { InsightCard } from "../../shared/InsightCard";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { StandingLongJumpTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { TrendingUp } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";
import {
  calculatePerformanceLevel,
  compareToElite,
  generateInsight,
} from "../../../../lib/utils/performanceCalculations";

interface StandingLongJumpCardProps {
  data: StandingLongJumpTest;
  recordedAt: string;
}

export function StandingLongJumpCard({
  data,
  recordedAt,
}: StandingLongJumpCardProps) {
  const performanceLevel = calculatePerformanceLevel(
    data.distanceMeters,
    "standingLongJump",
    "speed"
  );

  const eliteComparison = compareToElite(
    data.distanceMeters,
    "standingLongJump",
    "speed"
  );

  const insight = generateInsight(
    "Standing Long Jump",
    performanceLevel,
    eliteComparison
  );

  return (
    <StatCard
      title="Standing Long Jump"
      icon={TrendingUp}
      iconColor="text-cyan-600"
      recordedAt={recordedAt}
      badge={{
        label: performanceLevel.level,
        color: performanceLevel.color,
      }}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metric - Large Display */}
        <div className="p-8 bg-linear-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200">
          <div className="text-center">
            <h5 className="text-sm font-semibold text-cyan-900 mb-3">
              Jump Distance
            </h5>
            <div className="text-7xl font-bold text-cyan-600 mb-3">
              {formatNumber(data.distanceMeters, 2)}
              <span className="text-2xl text-cyan-500 ml-2">m</span>
            </div>
            <div className="text-lg text-cyan-700">
              {formatNumber(data.distanceMeters * 100, 0)} cm
            </div>

            <div className="mt-6">
              <PerformanceBadge
                performance={performanceLevel}
                showPercentage
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Elite Comparison */}
        <ComparisonBar comparison={eliteComparison} />

        {/* Insight */}
        <InsightCard insight={insight} />

        {/* Visual Progress Bar */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">
            Performance Relative to Standards
          </h5>
          <div className="space-y-3">
            {[
              {
                label: "World Record (Arne Tvervaag)",
                distance: 3.71,
                color: "purple",
              },
              { label: "Elite Level", distance: 3.0, color: "green" },
              { label: "Good Level", distance: 2.5, color: "blue" },
              { label: "Average Level", distance: 2.0, color: "yellow" },
            ].map((standard, index) => {
              const percentage =
                (data.distanceMeters / standard.distance) * 100;
              const isSurpassed = data.distanceMeters >= standard.distance;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{standard.label}</span>
                    <span
                      className={`font-semibold text-${standard.color}-600`}
                    >
                      {formatNumber(standard.distance, 2)}m{isSurpassed && " ✓"}
                    </span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full bg-linear-to-r from-${standard.color}-500 to-${standard.color}-600 transition-all duration-1000`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                    {isSurpassed && percentage > 100 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {formatNumber(percentage, 0)}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Test Analysis",
              icon: "📊",
              content: (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h6 className="text-sm font-semibold text-gray-900 mb-3">
                      What This Test Measures
                    </h6>
                    <p className="text-sm text-gray-700 mb-2">
                      The standing long jump (broad jump) measures{" "}
                      <strong>horizontal explosive power</strong> and
                      <strong> lower body strength</strong>. Key components:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Leg power and force production</li>
                      <li>• Hip extension strength</li>
                      <li>• Coordination and technique</li>
                      <li>• Core stability during takeoff</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-cyan-50 rounded border border-cyan-200">
                      <p className="text-sm">
                        <strong className="text-cyan-900">Distance:</strong>
                      </p>
                      <p className="text-2xl font-bold text-cyan-600">
                        {formatNumber(data.distanceMeters, 2)} m
                      </p>
                      <p className="text-xs text-cyan-700">
                        ({formatNumber(data.distanceMeters * 100, 0)} cm)
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm">
                        <strong className="text-blue-900">
                          Performance Level:
                        </strong>
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {performanceLevel.level}
                      </p>
                      <p className="text-xs text-blue-700">
                        {performanceLevel.percentage}% capacity
                      </p>
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
                    Standing long jump distance standards:
                  </p>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      World Class (&gt; 3.71m):
                    </strong>{" "}
                    <span className="text-purple-800">
                      World record territory (Arne Tvervaag: 3.71m)
                    </span>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Elite (3.00-3.71m):
                    </strong>{" "}
                    <span className="text-green-800">
                      Professional athlete level
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Good (2.50-3.00m):
                    </strong>{" "}
                    <span className="text-blue-800">Competitive athlete</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Average (2.00-2.50m):
                    </strong>{" "}
                    <span className="text-yellow-800">
                      Recreational athlete
                    </span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Below Average (&lt; 2.00m):
                    </strong>{" "}
                    <span className="text-orange-800">
                      Needs power development
                    </span>
                  </div>
                </div>
              ),
            },
            {
              title: "Training Recommendations",
              icon: "💡",
              content: (
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="p-3 bg-blue-50 rounded">
                    <strong className="text-blue-900">
                      🏋️ Strength Training:
                    </strong>
                    <p className="mt-1">
                      Squats, deadlifts, and hip thrusts for posterior chain
                      power
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <strong className="text-green-900">⚡ Plyometrics:</strong>
                    <p className="mt-1">
                      Box jumps, broad jumps, and bounding exercises
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <strong className="text-purple-900">🎯 Technique:</strong>
                    <p className="mt-1">
                      Arm swing coordination, takeoff angle, and landing
                      mechanics
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <strong className="text-orange-900">
                      💪 Core Strength:
                    </strong>
                    <p className="mt-1">
                      Anti-rotation exercises and explosive core work
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: "Sport Applications",
              icon: "🏃",
              content: (
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="mb-3">
                    Standing long jump performance correlates with:
                  </p>
                  <div className="p-3 bg-blue-50 rounded">
                    <strong className="text-blue-900">
                      Sprint Acceleration:
                    </strong>
                    <p className="mt-1">First 10-20m sprint speed</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <strong className="text-green-900">
                      Change of Direction:
                    </strong>
                    <p className="mt-1">Agility and cutting ability</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <strong className="text-purple-900">Vertical Jump:</strong>
                    <p className="mt-1">Overall lower body power output</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <strong className="text-orange-900">
                      Athletic Performance:
                    </strong>
                    <p className="mt-1">
                      General indicator of explosive power in field sports
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
