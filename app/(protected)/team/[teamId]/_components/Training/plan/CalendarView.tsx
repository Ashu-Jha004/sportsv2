"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  MapPin,
  Plus,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react"; // ✅ ADD Trash2
import {
  TrainingWeekWithRelations,
  DayOfWeek,
  DAY_NAMES, // ✅ ADD type
} from "@/types/Training/types/training";
import {
  groupSessionsByDay,
  formatDuration,
  calculateSessionCompletion,
  getCurrentDay,
} from "@/lib/utils/trainingHelpers";
import { useTrainingStore } from "@/stores/team/training/trainingStore";

interface CalendarViewProps {
  week: TrainingWeekWithRelations;
  planId: string;
  teamId: string;
  currentUserId: string | null;
}

export default function CalendarView({
  week,
  planId,
  teamId,
  currentUserId,
}: CalendarViewProps) {
  const {
    openCreateSession,
    openCreateExercise,
    openEditSession,
    openDeleteSession,
  } = useTrainingStore(); // ✅ ADD openDeleteSession

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    return groupSessionsByDay(week.sessions);
  }, [week.sessions]);

  const currentDay = getCurrentDay();

  // Days of the week (0 = Sunday, 6 = Saturday)
  const daysOfWeek: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {daysOfWeek.map((day) => {
        const daySessions = sessionsByDay[day] || [];
        const isToday = day === currentDay;

        return (
          <Card
            key={day}
            className={`border-2 transition-all ${
              isToday
                ? "border-blue-400 bg-blue-50/50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {DAY_NAMES[day]}
                </h3>
                {isToday && (
                  <Badge variant="default" className="bg-blue-600 text-xs">
                    Today
                  </Badge>
                )}
              </div>
              {daySessions.length > 0 && (
                <p className="text-xs text-slate-600">
                  {daySessions.length}{" "}
                  {daySessions.length === 1 ? "session" : "sessions"}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-3">
              {daySessions.length > 0 ? (
                <>
                  {daySessions.map((session: any) => {
                    const completionRate = currentUserId
                      ? calculateSessionCompletion(session, currentUserId)
                      : 0;

                    return (
                      <Card
                        key={session.id}
                        className="border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <CardContent className="p-3 space-y-2">
                          {/* Session Title */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm text-slate-900 line-clamp-2 flex-1">
                              {session.title}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                          </div>

                          {/* Session Meta */}
                          <div className="space-y-1 text-xs text-slate-600">
                            {session.durationMinutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatDuration(session.durationMinutes)}
                                </span>
                              </div>
                            )}
                            {session.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">
                                  {session.location}
                                </span>
                              </div>
                            )}
                            <div className="text-slate-500">
                              {session.exercises.length} exercises
                            </div>
                          </div>

                          {/* Progress */}
                          {currentUserId && (
                            <div className="space-y-1">
                              <Progress
                                value={completionRate}
                                className="h-1.5"
                              />
                              <p className="text-xs text-right text-slate-500">
                                {completionRate}%
                              </p>
                            </div>
                          )}

                          {/* ✅ EDIT + ADD EXERCISE + DELETE BUTTONS */}
                          <div className="flex gap-1 pt-2 border-t border-slate-100">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditSession(session);
                              }}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-xs border-slate-300 hover:border-green-400 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCreateExercise(session);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {session.exercises.length === 0
                                ? "Exercise"
                                : "+"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 -mr-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteSession(session.id, session.title); // ✅ NEW DELETE BUTTON
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 mb-3">No sessions</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCreateSession(week.weekNumber)}
                    className="text-xs border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
