// components/stats/sections/StaminaSection.tsx
"use client";

import React from "react";
import { SectionHeader } from "../shared/SectionHeader";
import { StatCard } from "../shared/StatCard";
import { ProgressRing } from "../shared/ProgressRing";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";
import { Heart, Activity } from "lucide-react";
import { BeepTestCard } from "../tests/stamina/BeepTestCard";
import { YoYoTestCard } from "../tests/stamina/YoYoTestCard";
import { CooperTestCard } from "../tests/stamina/CooperTestCard";
import { SitAndReachCard } from "../tests/stamina/SitAndReachCard";

interface StaminaSectionProps {
  stats: CleanedAthleteStats;
  preview?: boolean;
}

export function StaminaSection({ stats, preview = false }: any) {
  // Check if stamina tests exist
  if (!stats?.tests?.stamina || stats.tests.stamina.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Stamina Tests Available
        </h3>
        <p className="text-gray-500">
          Complete stamina assessments to see your endurance and flexibility
          metrics here.
        </p>
      </div>
    );
  }

  const staminaTests = stats.tests.stamina[0];

  if (!staminaTests?.tests) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Stamina Tests Available
        </h3>
        <p className="text-gray-500">
          Stamina test data structure is incomplete.
        </p>
      </div>
    );
  }

  const { tests } = staminaTests;
  const { aggregateScores } = stats;

  // Count available tests
  const testCount = Object.values(tests).filter(
    (test) => test !== undefined && test !== null
  ).length;

  if (testCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Stamina Tests Completed
        </h3>
        <p className="text-gray-500">
          Complete stamina assessments to see your performance here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Stamina & Recovery"
        subtitle="Cardiovascular fitness, endurance, and flexibility"
        icon={Heart}
        iconColor="text-purple-600"
      />

      {/* Aggregate Scores Overview */}
      {aggregateScores?.stamina && (
        <StatCard
          title="Stamina Performance Summary"
          icon={Activity}
          iconColor="text-purple-600"
          recordedAt={staminaTests.recordedAt}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aggregateScores.stamina.cardiovascularFitness !== undefined && (
              <div className="flex flex-col items-center">
                <ProgressRing
                  percentage={aggregateScores.stamina.cardiovascularFitness}
                  size="md"
                  label="Cardiovascular"
                  color="#9333ea"
                />
              </div>
            )}
            {aggregateScores.stamina.aerobicCapacity !== undefined && (
              <div className="flex flex-col items-center">
                <ProgressRing
                  percentage={aggregateScores.stamina.aerobicCapacity}
                  size="md"
                  label="Aerobic Capacity"
                  color="#ec4899"
                />
              </div>
            )}
            {aggregateScores.stamina.endurance !== undefined && (
              <div className="flex flex-col items-center">
                <ProgressRing
                  percentage={aggregateScores.stamina.endurance}
                  size="md"
                  label="Endurance"
                  color="#8b5cf6"
                />
              </div>
            )}
            {aggregateScores.stamina.flexibility !== undefined && (
              <div className="flex flex-col items-center">
                <ProgressRing
                  percentage={aggregateScores.stamina.flexibility}
                  size="md"
                  label="Flexibility"
                  color="#06b6d4"
                />
              </div>
            )}
          </div>
        </StatCard>
      )}

      {/* Individual Test Cards */}
      <div className="space-y-6">
        {/* Cardiovascular Tests Group */}
        {(tests.beepTest || tests.yoYoTest || tests.cooperTest) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🏃‍♂️</span>
              Cardiovascular Endurance Tests
            </h3>

            {tests.beepTest && (
              <BeepTestCard
                data={tests.beepTest}
                recordedAt={staminaTests.recordedAt}
              />
            )}

            {tests.yoYoTest && !preview && (
              <YoYoTestCard
                data={tests.yoYoTest}
                recordedAt={staminaTests.recordedAt}
              />
            )}

            {tests.cooperTest && !preview && (
              <CooperTestCard
                data={tests.cooperTest}
                recordedAt={staminaTests.recordedAt}
              />
            )}
          </div>
        )}

        {/* Flexibility Tests Group */}
        {tests.sitAndReach && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🧘</span>
              Flexibility Tests
            </h3>

            {!preview && (
              <SitAndReachCard
                data={tests.sitAndReach}
                recordedAt={staminaTests.recordedAt}
              />
            )}
          </div>
        )}
      </div>

      {preview && testCount > 1 && (
        <div className="text-center py-4">
          <button className="text-purple-600 hover:text-purple-700 font-semibold">
            View All {testCount} Stamina Tests →
          </button>
        </div>
      )}
    </div>
  );
}
