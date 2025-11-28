// components/stats/tests/strength/LoadedSquatJumpCard.tsx
"use client";

import React from "react";
import { StatCard } from "../../shared/StatCard";
import { MetricDisplay } from "../../shared/MetricDisplay";
import { MetricGrid } from "../../shared/MetricGrid";
import { DetailedBreakdown } from "../../shared/DetailedBreakdown";
import { RawDataViewer } from "../../shared/RawDataViewer";
import type { LoadedSquatJumpTest } from "@/app/(protected)/profile/lib/utils/statsDataProcessor";
import { Layers } from "lucide-react";
import {
  formatNumber,
  formatWeight,
  formatDuration,
} from "../../../../lib/utils/formatting";

interface LoadedSquatJumpCardProps {
  data: LoadedSquatJumpTest;
  recordedAt: string;
}

export function LoadedSquatJumpCard({
  data,
  recordedAt,
}: LoadedSquatJumpCardProps) {
  const { raw, calculated, meta } = data;

  return (
    <StatCard
      title="Loaded Squat Jump"
      icon={Layers}
      iconColor="text-blue-600"
      recordedAt={recordedAt}
      collapsible
      defaultExpanded={false}
    >
      <div className="space-y-6">
        {/* Overall Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Overall Performance
          </h4>
          <MetricGrid columns={4} gap="md">
            <MetricDisplay
              label="Total Sets"
              value={calculated.overall.totalSets}
              icon="📊"
              color="text-blue-600"
            />
            <MetricDisplay
              label="Total Reps"
              value={calculated.overall.totalReps}
              icon="🔢"
              color="text-green-600"
            />
            <MetricDisplay
              label="Volume Load"
              value={formatNumber(calculated.overall.totalVolumeLoad, 0)}
              unit="kg"
              icon="⚖️"
              color="text-purple-600"
              tooltip="Total weight lifted (sets × reps × load)"
            />
            <MetricDisplay
              label="Max Load"
              value={formatNumber(calculated.overall.maxLoad, 0)}
              unit="kg"
              icon="💪"
              color="text-orange-600"
            />
          </MetricGrid>
        </div>

        {/* Set Breakdown */}
        <DetailedBreakdown
          sections={[
            {
              title: "Set-by-Set Breakdown",
              icon: "📋",
              content: (
                <div className="space-y-3">
                  {raw.sets.map((set, index) => {
                    const setMetrics = calculated.perSetMetrics[index];
                    return (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">
                            {set.name || `Set ${index + 1}`}
                          </h5>
                          <span className="text-sm text-gray-600">
                            {set.reps.length} rep
                            {set.reps.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {set.reps.map((rep, repIndex) => (
                            <div
                              key={repIndex}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-600">
                                {rep.reps} reps × {rep.load} kg
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  Rest: {rep.restAfter}s
                                </span>
                                <span className="font-semibold text-gray-900">
                                  = {rep.reps * rep.load} kg
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {set.notes && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Notes:</strong> {set.notes}
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <MetricGrid columns={3} gap="sm">
                            <MetricDisplay
                              label="Total Reps"
                              value={setMetrics.totalReps}
                              size="sm"
                            />
                            <MetricDisplay
                              label="Volume"
                              value={formatNumber(setMetrics.volumeLoad, 0)}
                              unit="kg"
                              size="sm"
                            />
                            <MetricDisplay
                              label="Avg Load"
                              value={formatNumber(setMetrics.avgLoad, 1)}
                              unit="kg"
                              size="sm"
                            />
                          </MetricGrid>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ),
            },
            {
              title: "Test Information",
              icon: "ℹ️",
              content: (
                <MetricGrid columns={2} gap="md">
                  <MetricDisplay
                    label="Body Weight"
                    value={formatNumber(raw.bodyWeight, 1)}
                    unit="kg"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Total Time"
                    value={formatDuration(raw.totalTimeUsed)}
                    size="sm"
                  />
                  <MetricDisplay
                    label="Average Load"
                    value={formatNumber(calculated.overall.avgLoad, 1)}
                    unit="kg"
                    size="sm"
                  />
                  <MetricDisplay
                    label="Form Version"
                    value={meta.formVersion}
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
