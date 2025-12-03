"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface AthleteStats {
  strength: number;
  speed: number;
  recovery: number;
  agility: number;
  stamina: number;
}

interface AthleteStatsRadarProps {
  athleteName: string;
  athleteId: string;
}

// Hardcoded best values for comparison
const BEST_RECORDED_STATS: AthleteStats = {
  strength: 95,
  speed: 92,
  recovery: 88,
  agility: 90,
  stamina: 94,
};

// Generate random stats for athlete (50-85 range for realism)
const generateAthleteStats = (athleteId: string): AthleteStats => {
  const seed = athleteId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return Math.floor(min + (x - Math.floor(x)) * (max - min));
  };

  return {
    strength: random(50, 85, 1),
    speed: random(50, 85, 2),
    recovery: random(50, 85, 3),
    agility: random(50, 85, 4),
    stamina: random(50, 85, 5),
  };
};

export default function AthleteStatsRadar({
  athleteName,
  athleteId,
}: AthleteStatsRadarProps) {
  const athleteStats = generateAthleteStats(athleteId);

  // Prepare data for radar chart
  const chartData = [
    {
      stat: "Strength",
      athlete: athleteStats.strength,
      best: BEST_RECORDED_STATS.strength,
    },
    {
      stat: "Speed",
      athlete: athleteStats.speed,
      best: BEST_RECORDED_STATS.speed,
    },
    {
      stat: "Recovery",
      athlete: athleteStats.recovery,
      best: BEST_RECORDED_STATS.recovery,
    },
    {
      stat: "Agility",
      athlete: athleteStats.agility,
      best: BEST_RECORDED_STATS.agility,
    },
    {
      stat: "Stamina",
      athlete: athleteStats.stamina,
      best: BEST_RECORDED_STATS.stamina,
    },
  ];

  // Calculate overall score
  const athleteOverall = Math.round(
    Object.values(athleteStats).reduce((a, b) => a + b, 0) / 5
  );
  const bestOverall = Math.round(
    Object.values(BEST_RECORDED_STATS).reduce((a, b) => a + b, 0) / 5
  );

  return (
    <Card className="w-80 shadow-xl border-2 border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              {athleteName}
            </CardTitle>
            <p className="text-xs text-slate-600 mt-1">Performance Profile</p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            {athleteOverall}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Radar Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <Radar
              name="Best"
              dataKey="best"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name={athleteName}
              dataKey="athlete"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              iconType="circle"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {chartData.map((item) => (
            <div key={item.stat} className="text-center">
              <div className="text-xs font-semibold text-emerald-600">
                {item.athlete}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {item.stat}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Note */}
        <div className="mt-3 p-2 bg-slate-50 rounded-lg">
          <p className="text-[10px] text-slate-600 text-center">
            Gray area shows best recorded values across all athletes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
