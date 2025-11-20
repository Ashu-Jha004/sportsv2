"use client";

import React from "react";

interface Stat {
  name: string;
  value: number;
  unit?: string;
}

interface StatsTabProps {
  stats: Stat[];
}

export function StatsTab({ stats }: StatsTabProps) {
  if (!stats || stats.length === 0) {
    return <p className="text-gray-600">No stats available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {stats.map(({ name, value, unit }) => (
        <div
          key={name}
          className="bg-white p-6 rounded-lg shadow flex flex-col items-center"
        >
          <p className="text-3xl font-bold text-blue-600">
            {value}
            {unit ? ` ${unit}` : ""}
          </p>
          <p className="mt-2 text-gray-700">{name}</p>
        </div>
      ))}
    </div>
  );
}
