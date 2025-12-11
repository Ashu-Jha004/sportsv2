"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Target, Calendar, Video } from "lucide-react";
import { TrainingStats } from "@/types/Training/types/training";

interface StatsOverviewProps {
  trainingStats: TrainingStats;
  athleteStats: {
    totalExercises: number;
    completedExercises: number;
    completionPercentage: number;
  } | null;
}

export default function StatsOverview({
  trainingStats,
  athleteStats,
}: StatsOverviewProps) {
  const stats = [
    {
      label: "Overall Progress",
      value: athleteStats
        ? `${athleteStats.completedExercises}/${athleteStats.totalExercises}`
        : `0/${trainingStats.totalExercises}`,
      percentage: athleteStats?.completionPercentage || 0,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      progressColor: "bg-blue-600",
    },
    {
      label: "Exercises Completed",
      value: athleteStats?.completedExercises || 0,
      subtext: `of ${trainingStats.totalExercises}`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Training Sessions",
      value: trainingStats.totalSessions,
      subtext: "scheduled",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Video Footage",
      value: trainingStats.totalFootage,
      subtext: "uploaded",
      icon: Video,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-slate-200 hover:shadow-md transition-shadow"
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    {stat.subtext && (
                      <p className="text-sm text-slate-500">{stat.subtext}</p>
                    )}
                  </div>
                </div>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>

              {stat.percentage !== undefined && (
                <div className="space-y-1">
                  <Progress
                    value={stat.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-slate-500 text-right">
                    {stat.percentage}% complete
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
