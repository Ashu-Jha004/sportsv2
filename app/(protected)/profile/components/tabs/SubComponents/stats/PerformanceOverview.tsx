// components/profile/stats/PerformanceOverview.tsx

"use client";

import { ProfileStats } from "@/app/(protected)/profile/types/profile.types";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingDown, Target, Percent, Flame } from "lucide-react";

interface PerformanceOverviewProps {
  stats: ProfileStats;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
  bgColor: string;
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  color,
  bgColor,
}: StatCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
          </div>
          <div className={`${bgColor} p-3 rounded-lg`}>
            <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceOverview({ stats }: PerformanceOverviewProps) {
  const winRate =
    stats.totalMatches > 0
      ? ((stats.wins / stats.totalMatches) * 100).toFixed(1)
      : "0.0";

  const lossRate =
    stats.totalMatches > 0
      ? ((stats.losses / stats.totalMatches) * 100).toFixed(1)
      : "0.0";

  const currentStreak = 4; // Mock data - would come from backend

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">
        Performance Overview
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          label="Total Wins"
          value={stats.wins}
          sublabel={`${winRate}% win rate`}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />

        <StatCard
          icon={<TrendingDown className="w-6 h-6" />}
          label="Total Losses"
          value={stats.losses}
          sublabel={`${lossRate}% loss rate`}
          color="text-red-600"
          bgColor="bg-red-50"
        />

        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Total Matches"
          value={stats.totalMatches}
          sublabel="All competitions"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatCard
          icon={<Percent className="w-6 h-6" />}
          label="Win Rate"
          value={`${winRate}%`}
          sublabel="Overall performance"
          color="text-green-600"
          bgColor="bg-green-50"
        />

        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label="Current Streak"
          value={currentStreak}
          sublabel="Consecutive wins"
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>
    </div>
  );
}
