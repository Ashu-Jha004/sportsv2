// components/stats/tests/strength/BallisticPushUpCard.tsx
"use client";

import React from "react";

import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { BallisticPushUpTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Rocket } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";

interface BallisticPushUpCardProps {
  data: BallisticPushUpTest;
  recordedAt: string;
}

export function BallisticPushUpCard({
  data,
  recordedAt,
}: BallisticPushUpCardProps) {
  const { raw, calculated, meta } = data;

  return (
    <StatCard
      title="Ballistic Push-Up (Plyometric)"
      icon={Rocket}
      iconColor="text-orange-600"
      recordedAt={recordedAt}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Explosive Performance
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Best Jump Height"
              value={formatNumber(calculated.bestMeters * 100, 1)}
              unit="cm"
              icon="🦘"
              color="text-orange-600"
              tooltip="Maximum hand clearance height"
            />
            <MetricDisplay
              label="Avg Jump Height"
              value={formatNumber(calculated.avgMeters * 100, 1)}
              unit="cm"
              icon="📊"
              color="text-blue-600"
              tooltip="Average across all reps"
            />
            <MetricDisplay
              label="Flight Time"
              value={formatNumber(calculated.flightTime_s, 3)}
              unit="s"
              icon="⏱️"
              color="text-purple-600"
              tooltip="Time in the air"
            />
            <MetricDisplay
              label="Takeoff Velocity"
              value={formatNumber(calculated.takeoffVelocity_m_s, 2)}
              unit="m/s"
              icon="🚀"
              color="text-green-600"
              tooltip="Initial upward velocity"
            />
          </MetricGrid>
        </div>

        {/* Power Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h5 className="text-sm font-semibold text-red-900 mb-2">
              Est. Power per Rep
            </h5>
            <div className="text-3xl font-bold text-red-600">
              {formatNumber(calculated.estimatedPowerPerRep_W, 0)}
              <span className="text-lg text-red-500 ml-1">W</span>
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h5 className="text-sm font-semibold text-orange-900 mb-2">
              Avg Power (Set)
            </h5>
            <div className="text-3xl font-bold text-orange-600">
              {formatNumber(calculated.averagePowerSet_W, 0)}
              <span className="text-lg text-orange-500 ml-1">W</span>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="text-sm font-semibold text-purple-900 mb-2">
              Total Work
            </h5>
            <div className="text-3xl font-bold text-purple-600">
              {formatNumber(calculated.totalMechanicalWork_J, 0)}
              <span className="text-lg text-purple-500 ml-1">J</span>
            </div>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">
            Jump Height Consistency
          </h5>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Best Jump</span>
                <span className="font-semibold text-orange-600">
                  {formatNumber(calculated.bestMeters * 100, 1)} cm
                </span>
              </div>
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-orange-500 to-orange-600"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Average Jump</span>
                <span className="font-semibold text-blue-600">
                  {formatNumber(calculated.avgMeters * 100, 1)} cm
                </span>
              </div>
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600"
                  style={{
                    width: `${
                      (calculated.avgMeters / calculated.bestMeters) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Consistency:</strong>{" "}
              {formatNumber(
                (calculated.avgMeters / calculated.bestMeters) * 100,
                1
              )}
              %
              {(calculated.avgMeters / calculated.bestMeters) * 100 > 90 &&
                " - Excellent!"}
              {(calculated.avgMeters / calculated.bestMeters) * 100 > 80 &&
                (calculated.avgMeters / calculated.bestMeters) * 100 <= 90 &&
                " - Good"}
              {(calculated.avgMeters / calculated.bestMeters) * 100 <= 80 &&
                " - Variable performance"}
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Test Details",
              icon: "📋",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Total Reps"
                    value={raw.reps}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Body Weight"
                    value={formatNumber(raw.bodyWeightKg, 1)}
                    unit="kg"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Best Jump Height"
                    value={formatNumber(raw.bestJumpHeightCm, 1)}
                    unit="cm"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Avg Jump Height"
                    value={formatNumber(raw.avgJumpHeightCm, 1)}
                    unit="cm"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Takeoff Duration"
                    value={formatNumber(raw.takeoffDurationSec, 2)}
                    unit="s"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Technique Score"
                    value={`${raw.techniqueScore}/5`}
                    size="sm"
                    color={
                      raw.techniqueScore >= 4
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  />
                  <MetricDisplay
                    label="RPE"
                    value={`${raw.rpe}/10`}
                    size="sm"
                  />
                </MetricGrid>
              ),
            },
            {
              title: "Mechanical Analysis",
              icon: "🔬",
              content: (
                <div className="space-y-3">
                  <MetricDisplay
                    label="Mechanical Work per Rep"
                    value={formatNumber(calculated.mechanicalWorkPerRep_J, 1)}
                    unit="J"
                  />
                  <MetricDisplay
                    label="Takeoff Duration Used"
                    value={formatNumber(calculated.takeoffDurationUsed_s, 2)}
                    unit="s"
                  />

                  <div className="p-4 bg-gray-50 rounded-lg mt-4">
                    <h6 className="font-semibold text-gray-900 mb-3 text-sm">
                      Physics Calculations
                    </h6>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-gray-600 mb-1">Jump Height (h):</p>
                        <p>h = (v² / 2g) where g = 9.81 m/s²</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-gray-600 mb-1">Flight Time (t):</p>
                        <p>t = 2 × √(2h / g)</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-gray-600 mb-1">
                          Takeoff Velocity (v):
                        </p>
                        <p>v = √(2 × g × h)</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-gray-600 mb-1">Power (P):</p>
                        <p>P = (m × g × h) / t</p>
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

        {raw.videoUrl && (
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
