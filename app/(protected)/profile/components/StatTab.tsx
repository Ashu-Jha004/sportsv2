"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatsFallback } from "./StatsFallback";
import { Badge } from "@/components/ui/badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Attribute =
  | "Strength & Power"
  | "Speed"
  | "Agility"
  | "Recovery"
  | "Flexibility";

interface DataPoint {
  attribute: Attribute;
  athlete: number;
  perfectHuman: number;
}

function generateRandomAttributes(): Record<Attribute, number> {
  // Athlete stats always ~50-95 (less than perfect 100)
  return {
    "Strength & Power": Math.floor(50 + Math.random() * 45),
    Speed: Math.floor(50 + Math.random() * 45),
    Agility: Math.floor(50 + Math.random() * 45),
    Recovery: Math.floor(50 + Math.random() * 45),
    Flexibility: Math.floor(50 + Math.random() * 45),
  };
}

const perfectHumanDataPoints: DataPoint[] = [
  { attribute: "Strength & Power", athlete: 0, perfectHuman: 100 },
  { attribute: "Speed", athlete: 0, perfectHuman: 100 },
  { attribute: "Agility", athlete: 0, perfectHuman: 100 },
  { attribute: "Recovery", athlete: 0, perfectHuman: 100 },
  { attribute: "Flexibility", athlete: 0, perfectHuman: 100 },
];

function colorForValue(value: number) {
  if (value >= 85) return "text-emerald-600";
  if (value >= 70) return "text-lime-600";
  if (value >= 55) return "text-yellow-600";
  if (value >= 40) return "text-orange-600";
  return "text-rose-600";
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded border shadow-lg text-sm">
        <p className="font-semibold">{label}</p>
        <p>
          Athlete:{" "}
          <span className={colorForValue(payload[0].value)}>
            {payload[0].value}
          </span>
        </p>
        <p>
          Perfect Human:{" "}
          <span className="text-green-600">{payload[1].value}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function StatsTab({ stats }: any) {
  const athleteAttributes = useMemo(() => generateRandomAttributes(), []);

  const data: DataPoint[] = perfectHumanDataPoints.map((point) => ({
    ...point,
    athlete: athleteAttributes[point.attribute],
  }));

  // Summary stats
  const athleteValues = data.map((d) => d.athlete);
  const minScore = Math.min(...athleteValues);
  const maxScore = Math.max(...athleteValues);
  const avgScore = Math.round(
    athleteValues.reduce((a, b) => a + b, 0) / athleteValues.length
  );

  if (stats?.hasStats === false) return <StatsFallback isSelf />;

  return (
    <Card className="max-w-3xl mx-auto p-5 bg-white shadow-2xl rounded-xl border border-gray-200">
      <CardHeader className="mb-4">
        <CardTitle className="text-2xl font-extrabold text-gray-900">
          Athlete Performance Overview
        </CardTitle>
        <div className="flex gap-2 flex-wrap mt-3">
          {data.map((d) => (
            <Badge
              key={d.attribute}
              variant="outline"
              className={`text-sm font-medium ${colorForValue(d.athlete)}`}
              title={`${d.attribute}: ${d.athlete}`}
            >
              {d.attribute}: {d.athlete}
            </Badge>
          ))}
          <Badge variant="secondary" className="ml-auto text-xs">
            Perfect Human Benchmark (100%)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative h-96 sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="75%"
            data={data}
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
          >
            <defs>
              <linearGradient id="athleteGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="perfectGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fill: "#374151", fontWeight: "700" }}
              stroke="#9ca3af"
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={6}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              stroke="#d1d5db"
              angle={30}
            />
            <Radar
              animationBegin={300}
              animationDuration={900}
              animationEasing="ease-in-out"
              name="Athlete"
              dataKey="athlete"
              stroke="#3b82f6"
              fill="url(#athleteGradient)"
              fillOpacity={0.7}
              dot={{ r: 4, fill: "#3b82f6", stroke: "#2563eb", strokeWidth: 2 }}
            />
            <Radar
              name="Perfect Human"
              dataKey="perfectHuman"
              stroke="#10b981"
              fill="url(#perfectGradient)"
              fillOpacity={0.15}
              dot={false}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
        {/* Stats summary */}
        <div className="absolute bottom-4 left-6 flex flex-col gap-1 bg-white bg-opacity-75 backdrop-blur-sm p-3 rounded-md shadow-md w-48">
          <h3 className="font-semibold text-gray-700 text-sm">Summary</h3>
          <p className="text-xs text-gray-600">
            Min Score: <span className="font-medium">{minScore}</span>
          </p>
          <p className="text-xs text-gray-600">
            Max Score: <span className="font-medium">{maxScore}</span>
          </p>
          <p className="text-xs text-gray-600">
            Avg Score: <span className="font-medium">{avgScore}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
