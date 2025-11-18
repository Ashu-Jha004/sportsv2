// components/profile/tabs/StatsTab.tsx

"use client";

import { ProfileData } from "../../types/profile.types";
import { PerformanceOverview } from "./SubComponents/stats/PerformanceOverview";
import { MonthlyTrendChart } from "./SubComponents/stats/MonthlyTrendChart";
import { SkillRadarChart } from "./SubComponents/stats/SkillRadarChart";
import { RecentMatchesList } from "./SubComponents/stats/RecentMatchesList";
import { mockPerformanceData } from "../../data/mockProfile";
import { Separator } from "@/components/ui/separator";

interface StatsTabProps {
  profile: ProfileData;
}

export default function StatsTab({ profile }: StatsTabProps) {
  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <PerformanceOverview stats={profile.stats} />

      <Separator />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Trend */}
        <MonthlyTrendChart data={mockPerformanceData.monthlyStats} />

        {/* Skill Radar Chart */}
        <SkillRadarChart data={mockPerformanceData.skillRadar} />
      </div>

      <Separator />

      {/* Recent Matches */}
      <RecentMatchesList matches={mockPerformanceData.recentMatches} />
    </div>
  );
}
