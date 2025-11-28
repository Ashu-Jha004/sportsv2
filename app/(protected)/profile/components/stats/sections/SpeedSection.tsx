// components/stats/sections/SpeedSection.tsx
"use client";

import React from "react";
import { SectionHeader } from "../shared/SectionHeader";
import { StatCard } from "../shared/StatCard";
import { ProgressRing } from "../shared/ProgressRing";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";
import { Zap, Activity } from "lucide-react";
import { TenMeterSprintCard } from "../tests/speed/TenMeterSprintCard";
import { FourtyMeterDashCard } from "../tests/speed/FourtyMeterDashCard";
import { IllinoisAgilityCard } from "../tests/speed/IllinoisAgilityCard";
import { VisualReactionCard } from "../tests/speed/VisualReactionCard";
import { ReactiveTTestCard } from "../tests/speed/ReactiveTTestCard";
import { StandingLongJumpCard } from "../tests/speed/StandingLongJumpCard";

interface SpeedSectionProps {
  stats: CleanedAthleteStats;
  preview?: boolean;
}

export function SpeedSection({ stats, preview = false }: SpeedSectionProps) {
  const speedTests = stats.tests.speed[0]; // Get latest speed tests

  if (!speedTests) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚡</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Speed Tests Available
        </h3>
        <p className="text-gray-500">
          Complete speed assessments to see your velocity and agility metrics
          here.
        </p>
      </div>
    );
  }

  const { tests } = speedTests;
  const { aggregateScores } = stats;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Speed & Agility"
        subtitle="Sprint speed, acceleration, agility, and reaction time"
        icon={Zap}
        iconColor="text-green-600"
      />

      {/* Aggregate Scores Overview */}
      <StatCard
        title="Speed Performance Summary"
        icon={Activity}
        iconColor="text-green-600"
        recordedAt={speedTests.recordedAt}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {aggregateScores.speed.sprintSpeed !== undefined && (
            <div className="flex flex-col items-center">
              <ProgressRing
                percentage={aggregateScores.speed.sprintSpeed}
                size="md"
                label="Sprint Speed"
              />
            </div>
          )}
          {aggregateScores.speed.acceleration !== undefined && (
            <div className="flex flex-col items-center">
              <ProgressRing
                percentage={aggregateScores.speed.acceleration}
                size="md"
                label="Acceleration"
              />
            </div>
          )}
          {aggregateScores.speed.agility !== undefined && (
            <div className="flex flex-col items-center">
              <ProgressRing
                percentage={aggregateScores.speed.agility}
                size="md"
                label="Agility"
              />
            </div>
          )}
          {aggregateScores.speed.reactionTime !== undefined && (
            <div className="flex flex-col items-center">
              <ProgressRing
                percentage={aggregateScores.speed.reactionTime}
                size="md"
                label="Reaction Time"
              />
            </div>
          )}
        </div>
      </StatCard>

      {/* Individual Test Cards */}
      <div className="space-y-6">
        {/* Sprint Tests Group */}
        {(tests.tenMeterSprint || tests.fourtyMeterDash) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🏃</span>
              Sprint Speed Tests
            </h3>

            {tests.tenMeterSprint && (
              <TenMeterSprintCard
                data={tests.tenMeterSprint}
                recordedAt={speedTests.recordedAt}
              />
            )}

            {tests.fourtyMeterDash && !preview && (
              <FourtyMeterDashCard
                data={tests.fourtyMeterDash}
                recordedAt={speedTests.recordedAt}
              />
            )}
          </div>
        )}

        {/* Agility Tests Group */}
        {(tests.illinoisAgility || tests.reactiveTTest) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🏃‍♂️</span>
              Agility & Change of Direction Tests
            </h3>

            {tests.illinoisAgility && !preview && (
              <IllinoisAgilityCard
                data={tests.illinoisAgility}
                recordedAt={speedTests.recordedAt}
              />
            )}

            {tests.reactiveTTest && !preview && (
              <ReactiveTTestCard
                data={tests.reactiveTTest}
                recordedAt={speedTests.recordedAt}
              />
            )}
          </div>
        )}

        {/* Reaction & Power Tests Group */}
        {(tests.visualReaction || tests.standingLongJump) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>⚡</span>
              Reaction Time & Explosive Power Tests
            </h3>

            {tests.visualReaction && !preview && (
              <VisualReactionCard
                data={tests.visualReaction}
                recordedAt={speedTests.recordedAt}
              />
            )}

            {tests.standingLongJump && !preview && (
              <StandingLongJumpCard
                data={tests.standingLongJump}
                recordedAt={speedTests.recordedAt}
              />
            )}
          </div>
        )}
      </div>

      {preview && (
        <div className="text-center py-4">
          <button className="text-green-600 hover:text-green-700 font-semibold">
            View All Speed Tests →
          </button>
        </div>
      )}
    </div>
  );
}
