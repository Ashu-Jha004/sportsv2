"use client";

import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, List, Grid3x3 } from "lucide-react";
import { TrainingPlanWithRelations } from "@/types/Training/types/training";
import EditPlanDialog from "../dialogs/EditPlanDialog";
import CreateSessionDialog from "../dialogs/CreateSessionDialog";
import CreateExerciseDialog from "../dialogs/CreateExerciseDialog";
import EditSessionDialog from "../dialogs/EditSessionDialog";
import {
  DeleteSessionDialog,
  DeleteExerciseDialog,
} from "../dialogs/DeleteDialogs"; // ✅ NEW
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import WeekSelector from "./WeekSelector";
import CalendarView from "./CalendarView";
import ListView from "./ListView";

interface TrainingPlanViewProps {
  plan: TrainingPlanWithRelations;
  teamId: string;
  currentUserId: string | null;
  viewMode: "calendar" | "list";
  onRefresh: () => void;
}

export default function TrainingPlanView({
  plan,
  teamId,
  currentUserId,
  viewMode,
  onRefresh,
}: TrainingPlanViewProps) {
  const {
    selectedWeek,
    setSelectedWeek,
    setViewMode,
    activePlan,
    setActivePlan,
  } = useTrainingStore();

  // Set active plan when component mounts
  useEffect(() => {
    if (plan && activePlan?.id !== plan.id) {
      setActivePlan(plan);
    }
  }, [plan, activePlan?.id, setActivePlan]);

  // Get selected week data
  const currentWeekData = useMemo(() => {
    return plan.weeks.find((w) => w.weekNumber === selectedWeek);
  }, [plan.weeks, selectedWeek]);

  return (
    <div className="space-y-6">
      {/* Header with View Switcher */}
      <Card className="border-slate-200">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
              {plan.description && (
                <p className="text-sm text-slate-600 mt-1">
                  {plan.description}
                </p>
              )}
              {plan.goal && (
                <p className="text-xs text-slate-500 mt-1">Goal: {plan.goal}</p>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className={
                  viewMode === "calendar"
                    ? "bg-white shadow-sm"
                    : "hover:bg-slate-200"
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-white shadow-sm"
                    : "hover:bg-slate-200"
                }
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Selector */}
      <WeekSelector
        totalWeeks={plan.totalWeeks}
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        weeks={plan.weeks}
      />

      {/* Content based on view mode */}
      {viewMode === "calendar" && currentWeekData && (
        <CalendarView
          week={currentWeekData}
          planId={plan.id}
          teamId={teamId}
          currentUserId={currentUserId}
        />
      )}

      {viewMode === "list" && currentWeekData && (
        <ListView
          week={currentWeekData}
          planId={plan.id}
          teamId={teamId}
          currentUserId={currentUserId}
        />
      )}

      {!currentWeekData && (
        <Card className="border-slate-200">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-slate-600">
              No sessions found for week {selectedWeek}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ✅ ALL DIALOGS MOUNTED - FIXED KEY ISSUES */}
      <EditPlanDialog />
      <CreateSessionDialog teamId={teamId} />
      <EditSessionDialog />

      {/* ✅ FIXED: Delete Dialogs - Proper keys with hidden containers */}
      {currentWeekData?.sessions?.map((session) => (
        <div key={`delete-session-container-${session?.id}`} className="hidden">
          <DeleteSessionDialog
            sessionId={session.id}
            sessionTitle={session.title}
          />
          {session.exercises?.map((exercise) => (
            <DeleteExerciseDialog
              key={`delete-exercise-${exercise?.id}`}
              exerciseId={exercise.id}
              exerciseName={exercise.name}
            />
          ))}
        </div>
      ))}

      {/* ✅ FIXED: Create Exercise Dialogs - Direct keys */}
      {currentWeekData?.sessions?.map((session) => (
        <CreateExerciseDialog
          key={`create-exercise-${session?.id}`}
          sessionId={session?.id}
        />
      ))}
    </div>
  );
}
