"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TrainingWeekWithRelations } from "@/types/Training/types/training";
import { useMemo } from "react";

interface WeekSelectorProps {
  totalWeeks: number;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  weeks: TrainingWeekWithRelations[];
}

export default function WeekSelector({
  totalWeeks,
  selectedWeek,
  onWeekChange,
  weeks,
}: WeekSelectorProps) {
  const canGoPrevious = selectedWeek > 1;
  const canGoNext = selectedWeek < totalWeeks;

  // Get current week data
  const currentWeekData = useMemo(() => {
    return weeks.find((w) => w.weekNumber === selectedWeek);
  }, [weeks, selectedWeek]);

  const sessionCount = currentWeekData?.sessions.length || 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
      {/* Left side - Week info */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Week {selectedWeek}
            </h3>
            {currentWeekData?.title && (
              <span className="text-slate-600">- {currentWeekData.title}</span>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-0.5">
            {sessionCount} {sessionCount === 1 ? "session" : "sessions"}{" "}
            scheduled
          </p>
        </div>
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(selectedWeek - 1)}
          disabled={!canGoPrevious}
          className="border-slate-300"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Week Pills - Show nearby weeks */}
        <div className="hidden md:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalWeeks) }, (_, i) => {
            const weekNum = Math.max(1, selectedWeek - 2) + i;
            if (weekNum > totalWeeks) return null;

            return (
              <Button
                key={weekNum}
                variant={weekNum === selectedWeek ? "default" : "ghost"}
                size="sm"
                onClick={() => onWeekChange(weekNum)}
                className={
                  weekNum === selectedWeek
                    ? "bg-blue-600 hover:bg-blue-700 text-white min-w-[40px]"
                    : "text-slate-600 hover:text-slate-900 min-w-[40px]"
                }
              >
                {weekNum}
              </Button>
            );
          })}
        </div>

        {/* Mobile week indicator */}
        <Badge variant="secondary" className="md:hidden">
          {selectedWeek} / {totalWeeks}
        </Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(selectedWeek + 1)}
          disabled={!canGoNext}
          className="border-slate-300"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
