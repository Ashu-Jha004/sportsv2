// components/stats/layout/PerformanceOverview.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "../shared/ProgressRing";
import { MetricDisplay } from "../shared/MetricDisplay";
import { MetricGrid } from "../shared/MetricGrid";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";
import { Zap, Activity, Heart, TrendingUp } from "lucide-react";
import { calculatePerformanceLevel } from "../../../lib/utils/performanceCalculations";
import { getTestCountByCategory } from "../../../lib/utils/statsDataProcessor";

interface PerformanceOverviewProps {
  stats: CleanedAthleteStats;
}

export function PerformanceOverview({ stats }: PerformanceOverviewProps) {
  const { aggregateScores, tests } = stats;
  const testCounts = getTestCountByCategory(stats);

  // Calculate average overall score
  const overallScore = Math.round(
    (aggregateScores.strength.explosivePower +
      aggregateScores.strength.muscleMass +
      aggregateScores.strength.enduranceStrength) /
      3
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
            {/* Left: Radar Chart */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <PerformanceRadarChart scores={aggregateScores} />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
                Your performance profile across five key attributes
              </p>
            </div>

            {/* Right: Key Metrics */}
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
                tooltip="Combined score across all performance categories"
              />

              <div className="grid grid-cols-2 gap-3">
                <MetricDisplay
                  label="Explosive Power"
                  value={aggregateScores.strength.explosivePower.toFixed(1)}
                  unit="%"
                  icon="⚡"
                  color="text-purple-600"
                  size="sm"
                />
                <MetricDisplay
                  label="Muscle Mass"
                  value={aggregateScores.strength.muscleMass}
                  unit="%"
                  icon="💪"
                  color="text-blue-600"
                  size="sm"
                />
                <MetricDisplay
                  label="Endurance"
                  value={aggregateScores.strength.enduranceStrength}
                  unit="%"
                  icon="🔋"
                  color="text-green-600"
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

      {/* Category Performance Cards */}
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
                      className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                      style={{
                        width: `${aggregateScores.strength.explosivePower}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {aggregateScores.strength.explosivePower.toFixed(0)}%
                  </span>
                </div>
              </div>
              <ProgressRing
                percentage={aggregateScores.strength.explosivePower}
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
                      className="h-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-1000"
                      style={{
                        width: `${aggregateScores.speed.agility || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {(aggregateScores.speed.agility || 0).toFixed(0)}%
                  </span>
                </div>
              </div>
              <ProgressRing
                percentage={aggregateScores.speed.agility || 0}
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
                      className="h-full bg-linear-to-r from-purple-500 to-purple-600 transition-all duration-1000"
                      style={{
                        width: `${
                          aggregateScores.stamina.cardiovascularFitness || 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {(
                      aggregateScores.stamina.cardiovascularFitness || 0
                    ).toFixed(0)}
                    %
                  </span>
                </div>
              </div>
              <ProgressRing
                percentage={aggregateScores.stamina.cardiovascularFitness || 0}
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

// Simple Radar Chart Component
function PerformanceRadarChart({ scores }: { scores: any }) {
  const attributes = [
    { label: "Strength", value: scores.strength.muscleMass, color: "#3b82f6" },
    { label: "Power", value: scores.strength.explosivePower, color: "#8b5cf6" },
    { label: "Speed", value: scores.speed.sprintSpeed || 50, color: "#10b981" },
    { label: "Agility", value: scores.speed.agility || 50, color: "#f59e0b" },
    {
      label: "Stamina",
      value: scores.stamina.cardiovascularFitness || 50,
      color: "#ef4444",
    },
  ];

  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 40;
  const numAttributes = attributes.length;

  // Calculate points for each attribute
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numAttributes - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    };
  };

  // Generate path for the data polygon
  const dataPath =
    attributes
      .map((attr, i) => {
        const point = getPoint(i, attr.value);
        return `${i === 0 ? "M" : "L"} ${point.x},${point.y}`;
      })
      .join(" ") + " Z";

  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      {/* Background circles */}
      {[20, 40, 60, 80, 100].map((percentage) => (
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

      {/* Axis lines */}
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

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="url(#radarGradient)"
        fillOpacity="0.5"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Data points */}
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

      {/* Labels */}
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

      {/* Gradient definition */}
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
