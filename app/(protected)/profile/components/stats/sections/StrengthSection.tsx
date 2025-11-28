// components/stats/sections/StrengthSection.tsx
"use client";

import React from "react";
import { SectionHeader } from "../shared/SectionHeader";
import { StatCard } from "../shared/StatCard";
import { ProgressRing } from "../shared/ProgressRing";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";
import { Zap, TrendingUp } from "lucide-react";
import { CountermovementJumpCard } from "../tests/strength/CountermovementJumpCard";
import { LoadedSquatJumpCard } from "../tests/strength/LoadedSquatJumpCard";
import { DepthJumpCard } from "../tests/strength/DepthJumpCard";
import { BallisticBenchPressCard } from "../tests/strength/BallisticBenchPressCard";
import { PushUpCard } from "../tests/strength/PushUpCard";
import { BallisticPushUpCard } from "../tests/strength/BallisticPushUpCard";
import { DeadliftVelocityCard } from "../tests/strength/DeadliftVelocityCard";
import { HipThrustCard } from "../tests/strength/HipThrustCard";
import { WeightedPullUpCard } from "../tests/strength/WeightedPullUpCard";
import { BarbellRowCard } from "../tests/strength/BarbellRowCard";
import { PlankHoldCard } from "../tests/strength/PlankHoldCard";

interface StrengthSectionProps {
  stats: CleanedAthleteStats;
  preview?: boolean;
}

export function StrengthSection({
  stats,
  preview = false,
}: StrengthSectionProps) {
  const strengthTests = stats.tests.strength[0]; // Get latest strength tests

  if (!strengthTests) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💪</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Strength Tests Available
        </h3>
        <p className="text-gray-500">
          Complete strength assessments to see your power metrics here.
        </p>
      </div>
    );
  }

  const { tests } = strengthTests;
  const { aggregateScores } = stats;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Strength & Power"
        subtitle="Explosive power, endurance strength, and muscle mass"
        icon={Zap}
        iconColor="text-blue-600"
      />

      {/* Aggregate Scores Overview */}
      <StatCard
        title="Strength Performance Summary"
        icon={TrendingUp}
        iconColor="text-blue-600"
        recordedAt={strengthTests.recordedAt}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <ProgressRing
              percentage={aggregateScores.strength.explosivePower}
              size="lg"
              label="Explosive Power"
            />
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing
              percentage={aggregateScores.strength.muscleMass}
              size="lg"
              label="Muscle Mass"
            />
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing
              percentage={aggregateScores.strength.enduranceStrength}
              size="lg"
              label="Endurance Strength"
            />
          </div>
        </div>
      </StatCard>

      {/* Individual Test Cards */}
      <div className="space-y-6">
        {/* Power Tests Group */}
        {(tests.countermovementJump ||
          tests.loadedSquatJump ||
          tests.depthJump ||
          tests.ballisticBenchPress ||
          tests.ballisticPushUp) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>⚡</span>
              Power & Explosiveness Tests
            </h3>

            {tests.countermovementJump && (
              <CountermovementJumpCard
                data={tests.countermovementJump}
                recordedAt={strengthTests.recordedAt}
              />
            )}

            {tests.loadedSquatJump && !preview && (
              <LoadedSquatJumpCard
                data={tests.loadedSquatJump}
                recordedAt={strengthTests.recordedAt}
              />
            )}

            {tests.depthJump && !preview && (
              <DepthJumpCard
                data={tests.depthJump}
                recordedAt={strengthTests.recordedAt}
              />
            )}

            {tests.ballisticBenchPress && !preview && (
              <BallisticBenchPressCard
                data={tests.ballisticBenchPress}
                recordedAt={strengthTests.recordedAt}
              />
            )}

            {tests.ballisticPushUp && !preview && (
              <BallisticPushUpCard
                data={tests.ballisticPushUp}
                recordedAt={strengthTests.recordedAt}
              />
            )}
          </div>
        )}

        {/* Strength Endurance Tests Group */}
        {(tests.pushUp || tests.weightedPullUp || tests.plankHold) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🔋</span>
              Strength Endurance Tests
            </h3>

            {tests.pushUp && !preview && (
              <PushUpCard
                data={tests.pushUp}
                recordedAt={strengthTests.recordedAt}
              />
            )}

            {tests.weightedPullUp && !preview && (
              <WeightedPullUpCard
                data={tests.weightedPullUp}
                recordedAt={strengthTests.recordedAt}
              />
            )}

            {tests.plankHold && !preview && (
              <PlankHoldCard
                data={tests.plankHold}
                recordedAt={strengthTests.recordedAt}
              />
            )}
          </div>
        )}

        {/* Compound Lifts Group */}
        {(tests.deadliftVelocity || tests.hipThrust || tests.barbellRow) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🏋️</span>
              Compound Lifts
            </h3>

            {tests.deadliftVelocity && !preview && (
              <DeadliftVelocityCard
                data={tests.deadliftVelocity}
                recordedAt={strengthTests.recordedAt}
              />
            )}

            {tests.hipThrust && !preview && (
              <HipThrustCard
                data={tests.hipThrust}
                recordedAt={strengthTests.recordedAt}
              />
            )}

            {tests.barbellRow && !preview && (
              <BarbellRowCard
                data={tests.barbellRow}
                recordedAt={strengthTests.recordedAt}
              />
            )}
          </div>
        )}
      </div>

      {preview && (
        <div className="text-center py-4">
          <button className="text-blue-600 hover:text-blue-700 font-semibold">
            View All Strength Tests →
          </button>
        </div>
      )}
    </div>
  );
}
