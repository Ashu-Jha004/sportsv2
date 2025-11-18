// components/profile/stats/SkillRadarChart.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Award } from "lucide-react";

interface SkillData {
  skill: string;
  value: number;
}

interface SkillRadarChartProps {
  data: SkillData[];
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Award className="w-5 h-5 text-purple-600" />
          Skill Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="skill"
              stroke="#64748b"
              style={{ fontSize: "12px" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              stroke="#64748b"
              style={{ fontSize: "10px" }}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.5}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Skill Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.map((skill, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-slate-600">{skill.skill}</span>
              <span className="font-semibold text-slate-900">
                {skill.value}/100
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
