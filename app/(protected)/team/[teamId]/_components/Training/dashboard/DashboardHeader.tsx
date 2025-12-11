"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Settings, Calendar, Target } from "lucide-react";
import { TrainingPlanWithRelations } from "@/types/Training/types/training";
import { formatDistanceToNow } from "date-fns";
import { useTrainingStore } from "@/stores/team/training/trainingStore";

interface DashboardHeaderProps {
  plan: TrainingPlanWithRelations;
  onRefresh: () => void;
}

export default function DashboardHeader({ plan, onRefresh }: DashboardHeaderProps) {
  const { openEditPlan, setViewMode } = useTrainingStore();

  // Format dates
  const startDateText = useMemo(() => {
    if (!plan.startDate) return null;
    return formatDistanceToNow(new Date(plan.startDate), { addSuffix: true });
  }, [plan.startDate]);

  const endDateText = useMemo(() => {
    if (!plan.endDate) return null;
    return formatDistanceToNow(new Date(plan.endDate), { addSuffix: true });
  }, [plan.endDate]);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left side - Plan info */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold">{plan.name}</h1>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Active
            </Badge>
            {plan.goal && (
              <Badge variant="outline" className="border-white/50 text-white">
                <Target className="w-3 h-3 mr-1" />
                {plan.goal}
              </Badge>
            )}
          </div>

          {plan.description && (
            <p className="text-blue-50 text-sm sm:text-base max-w-2xl">
              {plan.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{plan.totalWeeks} weeks</span>
            </div>
            {startDateText && (
              <div className="flex items-center gap-2">
                <span>Started {startDateText}</span>
              </div>
            )}
            {endDateText && (
              <div className="flex items-center gap-2">
                <span>Ends {endDateText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={openEditPlan}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
