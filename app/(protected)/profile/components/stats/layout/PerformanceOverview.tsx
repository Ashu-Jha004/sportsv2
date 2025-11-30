"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "../shared/ProgressRing";
import { MetricDisplay } from "../shared/MetricDisplay";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";
import { Activity, Heart, TrendingUp, Zap } from "lucide-react";
import { getTestCountByCategory } from "../../../lib/utils/statsDataProcessor";

interface PerformanceOverviewProps {
  stats: CleanedAthleteStats;
}

export function PerformanceOverview({ stats }: PerformanceOverviewProps) {
  const { aggregateScores, tests } = stats;

  const testCounts = React.useMemo(
    () => getTestCountByCategory(stats),
    [stats]
  );

  const safe = React.useCallback(
    (v: number | undefined | null, fallback = 0) =>
      Number.isFinite(v as number) ? (v as number) : fallback,
    []
  );

  // ---- Strength (unchanged from your data) ----
  const strengthScore = React.useMemo(
    () =>
      Math.round(
        (safe(aggregateScores.strength.explosivePower) +
          safe(aggregateScores.strength.muscleMass) +
          safe(aggregateScores.strength.enduranceStrength)) /
          3
      ),
    [aggregateScores.strength, safe]
  );

  // ---- Derived Speed & Agility from raw tests when aggregate missing ----
  const hasSpeedAggregate =
    aggregateScores.speed &&
    (("sprintSpeed" in aggregateScores.speed &&
      aggregateScores.speed.sprintSpeed !== undefined) ||
      ("agility" in aggregateScores.speed &&
        aggregateScores.speed.agility !== undefined));

  const derivedSpeedScore = React.useMemo(() => {
    if (!tests?.speed?.length) return 0;
    const latest = tests.speed[0]?.tests;

    // Ten-meter sprint: map [1.6, 2.5] → [100, 0].
    const ten = latest?.tenMeterSprint?.timeSeconds;
    let tenScore: number | null = null;
    if (typeof ten === "number") {
      const min = 1.6;
      const max = 2.5;
      const clamped = Math.min(Math.max(ten, min), max);
      tenScore = ((max - clamped) / (max - min)) * 100;
    }

    // Illinois agility: bestTime, map [14, 20] → [100, 0].
    const illinoisBest = latest?.illinoisAgility?.calculated?.bestTime;
    let agilityScore: number | null = null;
    if (typeof illinoisBest === "number") {
      const min = 14;
      const max = 20;
      const clamped = Math.min(Math.max(illinoisBest, min), max);
      agilityScore = ((max - clamped) / (max - min)) * 100;
    }

    // Visual reaction: averageTime ms, map [150, 300] → [100, 0].
    const vrAvg =
      latest?.visualReaction?.calculated?.averageTime ??
      latest?.visualReaction?.calculated?.cleanedAverageTime;
    let reactionScore: number | null = null;
    if (typeof vrAvg === "number") {
      const min = 150;
      const max = 300;
      const clamped = Math.min(Math.max(vrAvg, min), max);
      reactionScore = ((max - clamped) / (max - min)) * 100;
    }

    const parts = [tenScore, agilityScore, reactionScore].filter(
      (v): v is number => v != null
    );
    if (!parts.length) return 0;
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  }, [tests?.speed]);

  const speedScore = React.useMemo(
    () =>
      hasSpeedAggregate
        ? Math.round(
            (safe(aggregateScores.speed.sprintSpeed) +
              safe(aggregateScores.speed.agility)) /
              2
          )
        : derivedSpeedScore,
    [hasSpeedAggregate, aggregateScores.speed, derivedSpeedScore, safe]
  );

  // ---- Derived Stamina & Recovery from raw tests when aggregate missing ----
  const hasStaminaAggregate =
    aggregateScores.stamina &&
    (("cardiovascularFitness" in aggregateScores.stamina &&
      aggregateScores.stamina.cardiovascularFitness !== undefined) ||
      ("recoveryAbility" in aggregateScores.stamina &&
        aggregateScores.stamina.recoveryAbility !== undefined));

  const derivedStaminaScore = React.useMemo(() => {
    if (!tests?.stamina?.length) return 0;
    const latest = tests.stamina[0]?.tests;

    // Beep test: estimatedVO2Max ~ [30, 70] → [0, 100]
    const beepVo2 = latest?.beepTest?.calculated?.estimatedVO2Max;
    let beepScore: number | null = null;
    if (typeof beepVo2 === "number") {
      const min = 30;
      const max = 70;
      const clamped = Math.min(Math.max(beepVo2, min), max);
      beepScore = ((clamped - min) / (max - min)) * 100;
    }

    // YoYo test: estimatedVO2MaxIntermittent ~ [35, 75] → [0, 100]
    const yoYoVo2 = latest?.yoYoTest?.calculated?.estimatedVO2MaxIntermittent;
    let yoyoScore: number | null = null;
    if (typeof yoYoVo2 === "number") {
      const min = 35;
      const max = 75;
      const clamped = Math.min(Math.max(yoYoVo2, min), max);
      yoyoScore = ((clamped - min) / (max - min)) * 100;
    }

    // Cooper test: distanceMeters ~ [2000, 3200] → [0, 100]
    const cooperDist = latest?.cooperTest?.distanceMeters;
    let cooperScore: number | null = null;
    if (typeof cooperDist === "number") {
      const min = 2000;
      const max = 3200;
      const clamped = Math.min(Math.max(cooperDist, min), max);
      cooperScore = ((clamped - min) / (max - min)) * 100;
    }

    const parts = [beepScore, yoyoScore, cooperScore].filter(
      (v): v is number => v != null
    );
    if (!parts.length) return 0;
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  }, [tests?.stamina]);

  const staminaScore = React.useMemo(
    () =>
      hasStaminaAggregate
        ? Math.round(
            (safe(aggregateScores.stamina.cardiovascularFitness) +
              safe(aggregateScores.stamina.recoveryEfficiency)) /
              2
          )
        : derivedStaminaScore,
    [hasStaminaAggregate, aggregateScores.stamina, derivedStaminaScore, safe]
  );

  const overallScore = React.useMemo(
    () => Math.round((strengthScore + speedScore + staminaScore) / 3),
    [strengthScore, speedScore, staminaScore]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Overview Card */}
      <Card className="lg:col-span-2 overflow-hidden border-2 border-blue-100">
        <CardHeader className="bg-linear-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Activity className="h-6 w-6 text-blue-600" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Radar */}
            <div className="flex flex-col items-center justify-center">
              <PerformanceRadarChart
                strength={strengthScore}
                speed={speedScore}
                stamina={staminaScore}
              />
              <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
                Your performance profile across strength, speed, and stamina
              </p>
            </div>

            {/* Right: Key metrics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Key Metrics
              </h3>

              <MetricDisplay
                label="Overall Performance"
                value={overallScore}
                unit="%"
                icon="🎯"
                color="text-blue-600"
                size="lg"
                tooltip="Combined score across strength, speed, and stamina"
              />

              <div className="grid grid-cols-2 gap-3">
                <MetricDisplay
                  label="Strength & Power"
                  value={strengthScore}
                  unit="%"
                  icon="⚡"
                  color="text-purple-600"
                  size="sm"
                />
                <MetricDisplay
                  label="Speed & Agility"
                  value={speedScore}
                  unit="%"
                  icon="🏃"
                  color="text-green-600"
                  size="sm"
                />
                <MetricDisplay
                  label="Stamina & Recovery"
                  value={staminaScore}
                  unit="%"
                  icon="💓"
                  color="text-rose-600"
                  size="sm"
                />
                <MetricDisplay
                  label="Tests Completed"
                  value={testCounts.total}
                  icon="✅"
                  color="text-gray-700"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category cards (same composites) */}
      <div className="space-y-4">
        {/* Strength */}
        <Card className="border-2 border-blue-100 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Strength & Power
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {testCounts.strength} tests completed
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-700"
                      style={{ width: `${strengthScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {strengthScore}%
                  </span>
                </div>
              </div>
              <ProgressRing
                percentage={strengthScore}
                size="sm"
                color="#3b82f6"
                showPercentage={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Speed */}
        <Card className="border-2 border-green-100 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">
                    Speed & Agility
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {testCounts.speed} tests completed
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-700"
                      style={{ width: `${speedScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {speedScore}%
                  </span>
                </div>
              </div>
              <ProgressRing
                percentage={speedScore}
                size="sm"
                color="#16a34a"
                showPercentage={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stamina */}
        <Card className="border-2 border-purple-100 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    Stamina & Recovery
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {testCounts.stamina} tests completed
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-purple-500 to-purple-600 transition-all duration-700"
                      style={{ width: `${staminaScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {staminaScore}%
                  </span>
                </div>
              </div>
              <ProgressRing
                percentage={staminaScore}
                size="sm"
                color="#9333ea"
                showPercentage={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PerformanceRadarChart({
  strength,
  speed,
  stamina,
}: {
  strength: number;
  speed: number;
  stamina: number;
}) {
  const attributes = React.useMemo(
    () => [
      { label: "Strength", value: strength, color: "#3b82f6" },
      { label: "Speed", value: speed, color: "#10b981" },
      { label: "Stamina", value: stamina, color: "#ef4444" },
    ],
    [strength, speed, stamina]
  );

  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 40;
  const numAttributes = attributes.length;

  const getPoint = React.useCallback(
    (index: number, value: number) => {
      const angle = (Math.PI * 2 * index) / numAttributes - Math.PI / 2;
      const distance = (value / 100) * radius;
      return {
        x: center + Math.cos(angle) * distance,
        y: center + Math.sin(angle) * distance,
      };
    },
    [numAttributes, radius, center]
  );

  const dataPath = React.useMemo(
    () =>
      attributes
        .map((attr, i) => {
          const point = getPoint(i, attr.value);
          return `${i === 0 ? "M" : "L"} ${point.x},${point.y}`;
        })
        .join(" ") + " Z",
    [attributes, getPoint]
  );

  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      {[25, 50, 75, 100].map((percentage) => (
        <circle
          key={percentage}
          cx={center}
          cy={center}
          r={(radius * percentage) / 100}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {attributes.map((_, index) => {
        const angle = (Math.PI * 2 * index) / numAttributes - Math.PI / 2;
        const endX = center + Math.cos(angle) * radius;
        const endY = center + Math.sin(angle) * radius;
        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={endX}
            y2={endY}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      <path
        d={dataPath}
        fill="url(#radarGradient)"
        fillOpacity="0.5"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {attributes.map((attr, index) => {
        const point = getPoint(index, attr.value);
        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={attr.color}
            stroke="white"
            strokeWidth="2"
          />
        );
      })}

      {attributes.map((attr, index) => {
        const angle = (Math.PI * 2 * index) / numAttributes - Math.PI / 2;
        const labelDistance = radius + 25;
        const x = center + Math.cos(angle) * labelDistance;
        const y = center + Math.sin(angle) * labelDistance;

        return (
          <text
            key={index}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-semibold fill-gray-700"
          >
            {attr.label}
          </text>
        );
      })}

      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
