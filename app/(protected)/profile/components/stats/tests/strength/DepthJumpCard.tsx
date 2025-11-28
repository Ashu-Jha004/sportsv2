// components/stats/tests/strength/DepthJumpCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { DepthJumpTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { ArrowDown } from "lucide-react";
import { formatNumber } from "@/app/(protected)/profile/lib/utils/formatting";

interface DepthJumpCardProps {
  data: DepthJumpTest;
  recordedAt: string;
}

export function DepthJumpCard({ data, recordedAt }: DepthJumpCardProps) {
  const { raw, calculated, meta }: any = data;

  // Get RSI rating
  const getRSIRating = (rsi: number) => {
    if (rsi >= 2.5)
      return { label: "Elite", color: "text-purple-600", bg: "bg-purple-50" };
    if (rsi >= 2.0)
      return { label: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (rsi >= 1.5)
      return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (rsi >= 1.0)
      return { label: "Average", color: "text-yellow-600", bg: "bg-yellow-50" };
    return {
      label: "Needs Work",
      color: "text-orange-600",
      bg: "bg-orange-50",
    };
  };

  const rsiRating = getRSIRating(calculated.overall.bestRSI);

  return (
    <StatCard
      title="Depth Jump"
      icon={ArrowDown}
      iconColor="text-orange-600"
      recordedAt={recordedAt}
      badge={{
        label: rsiRating.label,
        color: rsiRating.color,
      }}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Overall Performance
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Best RSI"
              value={formatNumber(calculated.overall.bestRSI, 2)}
              icon="⚡"
              color="text-purple-600"
              tooltip="Reactive Strength Index - jump height / ground contact time"
            />
            <MetricDisplay
              label="Average RSI"
              value={formatNumber(calculated.overall.avgRSI, 2)}
              icon="📊"
              color="text-blue-600"
            />
            <MetricDisplay
              label="Best Jump"
              value={formatNumber(calculated.overall.bestJump, 1)}
              unit="cm"
              icon="🦘"
              color="text-green-600"
            />
            <MetricDisplay
              label="Total Reps"
              value={calculated.overall.totalReps}
              icon="🔢"
              color="text-gray-600"
            />
          </MetricGrid>
        </div>

        {/* RSI Explanation */}
        <div
          className={`p-4 rounded-lg border ${
            rsiRating.bg
          } border-${rsiRating.color.replace("text-", "")}-200`}
        >
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>💡</span>
            Reactive Strength Index (RSI)
          </h4>
          <p className="text-sm text-gray-700">
            RSI measures your ability to quickly utilize stored elastic energy.
            Higher values indicate better reactive strength - essential for
            explosive movements like sprinting and jumping.
          </p>
          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
            <p className="text-xs font-mono">
              RSI = Jump Height (cm) ÷ Ground Contact Time (s)
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Your best: {formatNumber(calculated.overall.bestJump, 1)} cm ÷{" "}
              {formatNumber(
                calculated.perSet?.repsCount?.[0]?.groundContactTimeSec || 0,
                3
              )}{" "}
              s = {formatNumber(calculated.overall.bestRSI, 2)}
            </p>
          </div>
        </div>

        {/* Set Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Set-by-Set Analysis",
              icon: "📋",
              content: (
                <div className="space-y-4">
                  {raw.sets.map((set: any, setIndex: any) => {
                    const setCalc = calculated.perSet[setIndex];
                    return (
                      <div
                        key={setIndex}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">
                            {set.name || `Set ${setIndex + 1}`}
                          </h5>
                          <span className="text-sm text-gray-600">
                            Drop Height: {set.dropHeightCm} cm
                          </span>
                        </div>

                        {/* Set Metrics */}
                        <MetricGrid columns={3} gap="sm" className="mb-3">
                          <MetricDisplay
                            label="Best RSI"
                            value={formatNumber(setCalc.bestRSI, 2)}
                            size="sm"
                            color="text-purple-600"
                          />
                          <MetricDisplay
                            label="Avg RSI"
                            value={formatNumber(setCalc.avgRSI, 2)}
                            size="sm"
                            color="text-blue-600"
                          />
                          <MetricDisplay
                            label="Best Jump"
                            value={formatNumber(setCalc.bestJump, 1)}
                            unit="cm"
                            size="sm"
                            color="text-green-600"
                          />
                        </MetricGrid>

                        {/* Rep Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-300">
                                <th className="py-2 px-3 text-left">Rep</th>
                                <th className="py-2 px-3 text-right">
                                  Jump (cm)
                                </th>
                                <th className="py-2 px-3 text-right">
                                  Contact (s)
                                </th>
                                <th className="py-2 px-3 text-right">RSI</th>
                              </tr>
                            </thead>
                            <tbody>
                              {set.reps.map((rep: any, repIndex: any) => {
                                const rsi =
                                  rep.jumpHeightCm / rep.groundContactTimeSec;
                                const isBest = rsi === setCalc.bestRSI;
                                return (
                                  <tr
                                    key={repIndex}
                                    className={`border-b border-gray-100 ${
                                      isBest ? "bg-yellow-50 font-semibold" : ""
                                    }`}
                                  >
                                    <td className="py-2 px-3">
                                      {isBest && "🏆 "}#{repIndex + 1}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      {formatNumber(rep.jumpHeightCm, 1)}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      {formatNumber(
                                        rep.groundContactTimeSec,
                                        3
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-right font-semibold">
                                      {formatNumber(rsi, 2)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {set.notes && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Notes:</strong> {set.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
            },
            {
              title: "Performance Guidelines",
              icon: "📚",
              content: (
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <strong className="text-purple-900">
                      Elite (RSI &gt; 2.5):
                    </strong>
                    <p className="text-purple-800 mt-1">
                      World-class reactive strength. Optimal elastic energy
                      utilization.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong className="text-green-900">
                      Excellent (RSI 2.0-2.5):
                    </strong>
                    <p className="text-green-800 mt-1">
                      Very good reactive strength. Strong stretch-shortening
                      cycle.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <strong className="text-blue-900">
                      Good (RSI 1.5-2.0):
                    </strong>
                    <p className="text-blue-800 mt-1">
                      Above average. Continue plyometric training for
                      improvement.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <strong className="text-yellow-900">
                      Average (RSI 1.0-1.5):
                    </strong>
                    <p className="text-yellow-800 mt-1">
                      Room for improvement. Focus on eccentric strength and
                      technique.
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong className="text-orange-900">
                      Needs Work (RSI &lt; 1.0):
                    </strong>
                    <p className="text-orange-800 mt-1">
                      Prioritize basic strength and proper landing mechanics.
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

        {raw.notes && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900">
              <strong>General Notes:</strong> {raw.notes}
            </p>
          </div>
        )}
      </div>
    </StatCard>
  );
}
