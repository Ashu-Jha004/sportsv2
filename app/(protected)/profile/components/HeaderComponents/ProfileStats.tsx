// components/profile/ProfileStats.tsx

"use client";

import { ProfileStats as ProfileStatsType } from "../../types/profile.types";
import { formatNumber } from "@/lib/utils/formatNumber";
import { Users, UserPlus, Trophy, TrendingDown, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatItem = ({ icon, label, value, color }: StatItemProps) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-slate-50 transition-colors">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${color} bg-opacity-10`}
      >
        {icon}
      </div>
      <span className="text-2xl font-bold text-slate-900">
        {formatNumber(value)}
      </span>
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
};

export function ProfileStats({ stats }: ProfileStatsProps) {
  const winRate =
    stats.totalMatches > 0
      ? ((stats.wins / stats.totalMatches) * 100).toFixed(1)
      : "0.0";

  return (
    <Card className="w-full bg-white border border-slate-200 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 p-2">
        <StatItem
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Followers"
          value={stats.followers}
          color="bg-blue-600"
        />

        <StatItem
          icon={<UserPlus className="w-5 h-5 text-purple-600" />}
          label="Following"
          value={stats.following}
          color="bg-purple-600"
        />

        <StatItem
          icon={<Trophy className="w-5 h-5 text-yellow-600" />}
          label="Wins"
          value={stats.wins}
          color="bg-yellow-600"
        />

        <StatItem
          icon={<TrendingDown className="w-5 h-5 text-red-600" />}
          label="Losses"
          value={stats.losses}
          color="bg-red-600"
        />

        <StatItem
          icon={<Target className="w-5 h-5 text-green-600" />}
          label="Total Matches"
          value={stats.totalMatches}
          color="bg-green-600"
        />
      </div>

      {/* Win Rate Bar - Mobile/Tablet Only */}
      <div className="lg:hidden px-4 pb-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Win Rate</span>
          <span className="text-sm font-bold text-slate-900">{winRate}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-green-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${winRate}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
