// components/StatsTab.tsx

"use client";

import React from "react";
import { StatsTabProps } from "@/types/profile/athlete-profile.types";
import { Progress } from "@/components/ui/progress";
import { BarChart2 } from "lucide-react";
import { StatsFallback } from "./StatsFallback";

const statLabels = [
  { key: "strength", label: "Strength" },
  { key: "speed", label: "Speed" },
  { key: "agility", label: "Agility" },
  { key: "endurance", label: "Endurance" },
  { key: "power", label: "Power" },
  { key: "flexibility", label: "Flexibility" },
];

export default function StatsTab({ stats }: any) {
  console.log(stats);
  if (stats.hasStats === false) {
    return (
      <>
        <StatsFallback isSelf />
      </>
    );
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
        <BarChart2 size={24} />
        Physical Stats
      </h2>

      {statLabels.map(({ key, label }) => {
        const statValue = (stats as any)[key] ?? 0;
        return (
          <div key={key}>
            <div className="flex justify-between mb-1 font-medium text-gray-700">
              <span>{label}</span>
              <span>{statValue}%</span>
            </div>
            <Progress value={statValue} className="h-4 rounded-full" />
          </div>
        );
      })}
    </section>
  );
}
