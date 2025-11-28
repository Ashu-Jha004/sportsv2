// components/stats/tests/strength/BallisticBenchPressCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { BallisticBenchPressTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Zap } from "lucide-react";
import {
  formatNumber,
  formatPower,
  formatVelocity,
} from "../../../../lib/utils/formatting";

interface BallisticBenchPressCardProps {
  data: BallisticBenchPressTest;
  recordedAt: string;
}

export function BallisticBenchPressCard({
  data,
  recordedAt,
}: BallisticBenchPressCardProps) {
  const { raw, calculated, meta } = data;

  return (
    <StatCard
      title="Ballistic Bench Press"
      icon={Zap}
      iconColor="text-red-600"
      recordedAt={recordedAt}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Power & Velocity Metrics
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Peak Power"
              value={formatNumber(calculated.peakPower, 0)}
              unit="W"
              icon="⚡"
              color="text-red-600"
              tooltip="Maximum power output"
            />
            <MetricDisplay
              label="Mean Power"
              value={formatNumber(calculated.meanPower, 0)}
              unit="W"
              icon="📊"
              color="text-orange-600"
              tooltip="Average power across all sets"
            />
            <MetricDisplay
              label="Peak Velocity"
              value={formatNumber(calculated.peakVelocity, 3)}
              unit="m/s"
              icon="🚀"
              color="text-blue-600"
              tooltip="Maximum bar velocity"
            />
            <MetricDisplay
              label="Avg Velocity"
              value={formatNumber(calculated.avgVelocity, 3)}
              unit="m/s"
              icon="📈"
              color="text-green-600"
              tooltip="Average bar velocity"
            />
          </MetricGrid>
        </div>

        {/* Work & Impulse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="text-sm font-semibold text-purple-900 mb-3">
              Total Mechanical Work
            </h5>
            <div className="text-4xl font-bold text-purple-600">
              {formatNumber(calculated.totalWork, 1)}
              <span className="text-lg text-purple-500 ml-1">J</span>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              Joules (Force × Distance)
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-semibold text-blue-900 mb-3">
              Total Impulse
            </h5>
            <div className="text-4xl font-bold text-blue-600">
              {formatNumber(calculated.totalImpulse, 1)}
              <span className="text-lg text-blue-500 ml-1">N·s</span>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Newton-seconds (Force × Time)
            </p>
          </div>
        </div>

        {/* Velocity-Load Profile */}
        {calculated.velocityLoadPoints &&
          calculated.velocityLoadPoints.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>📊</span>
                Velocity-Load Profile
              </h5>
              <div className="space-y-2">
                {calculated.velocityLoadPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20 text-sm font-medium text-gray-600">
                      {point.load} kg
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2"
                          style={{
                            width: `${
                              (point.peakVelocity / calculated.peakVelocity) *
                              100
                            }%`,
                          }}
                        >
                          <span className="text-xs font-semibold text-white">
                            {formatNumber(point.peakVelocity, 3)} m/s
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                💡 Velocity decreases as load increases - this profile helps
                identify optimal training loads
              </p>
            </div>
          )}

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Set Details",
              icon: "📋",
              content: (
                <div className="space-y-3">
                  {raw.sets.map((set, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-semibold text-gray-900">
                          Set {index + 1}{" "}
                          {index === calculated.bestSetIndex && "🏆"}
                        </h6>
                        <span className="text-sm text-gray-600">
                          Rest: {set.restAfter}s
                        </span>
                      </div>

                      <MetricGrid columns={3} gap="sm">
                        <MetricDisplay
                          label="Load"
                          value={formatNumber(set.load, 0)}
                          unit="kg"
                          size="sm"
                        />
                        <MetricDisplay
                          label="Reps"
                          value={set.reps}
                          size="sm"
                        />
                        <MetricDisplay
                          label="Distance"
                          value={formatNumber(set.distance, 2)}
                          unit="m"
                          size="sm"
                        />
                        <MetricDisplay
                          label="Time"
                          value={formatNumber(set.time, 2)}
                          unit="s"
                          size="sm"
                        />
                        <MetricDisplay
                          label="Body Weight"
                          value={formatNumber(set.bodyWeight, 1)}
                          unit="kg"
                          size="sm"
                        />
                      </MetricGrid>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: "Equipment Setup",
              icon: "⚙️",
              content: (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm">
                      <strong className="text-blue-900">Equipment Mode:</strong>{" "}
                      <span className="text-blue-800 capitalize">
                        {calculated.equipmentMode}
                      </span>
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm">
                      <strong className="text-gray-900">Total Sets:</strong>{" "}
                      <span className="text-gray-700">
                        {calculated.setsCount}
                      </span>
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <p className="text-sm">
                      <strong className="text-purple-900">Best Set:</strong>{" "}
                      <span className="text-purple-800">
                        Set {calculated.bestSetIndex + 1}
                      </span>
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: "Power Calculations",
              icon: "🔬",
              content: (
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h6 className="font-semibold text-gray-900 mb-3">
                      Formula Breakdown
                    </h6>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-gray-600 mb-1">Power (W):</p>
                        <p>P = Work / Time = (Force × Distance) / Time</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-gray-600 mb-1">Velocity (m/s):</p>
                        <p>v = Distance / Time</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-gray-600 mb-1">Impulse (N·s):</p>
                        <p>J = Force × Time = Mass × Velocity</p>
                      </div>
                    </div>
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
      </div>
    </StatCard>
  );
}
