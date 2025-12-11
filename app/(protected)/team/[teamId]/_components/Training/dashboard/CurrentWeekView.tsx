"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  ChevronRight,
} from "lucide-react";
import { TrainingWeekWithRelations } from "@/types/Training/types/training";
import {
  groupSessionsByDay,
  getDayName,
  formatDuration,
  calculateSessionCompletion,
  getCurrentDay,
} from "@/lib/utils/trainingHelpers";
import { TIME_OF_DAY_LABELS } from "@/types/Training/types/training";

interface CurrentWeekViewProps {
  week: TrainingWeekWithRelations;
  planId: string;
  teamId: string;
  currentUserId: string | null;
}

export default function CurrentWeekView({
  week,
  planId,
  teamId,
  currentUserId,
}: CurrentWeekViewProps) {
  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    return groupSessionsByDay(week.sessions);
  }, [week.sessions]);

  const currentDay = getCurrentDay();

  // Get upcoming sessions (today and future)
  const upcomingSessions = useMemo(() => {
    const sessions = [];
    for (let day = currentDay; day <= 6; day++) {
      if (sessionsByDay[day as keyof typeof sessionsByDay]?.length > 0) {
        sessions.push({
          day,
          sessions: sessionsByDay[day as keyof typeof sessionsByDay],
        });
      }
    }
    return sessions.slice(0, 3); // Show next 3 days max
  }, [sessionsByDay, currentDay]);

  if (upcomingSessions.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Week {week.weekNumber}
            {week.title && (
              <span className="text-slate-600">- {week.title}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <p className="text-slate-600 font-medium">
              No upcoming sessions this week
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Great job! You're all caught up.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Week {week.weekNumber}
            {week.title && (
              <span className="text-base text-slate-600 font-normal">
                - {week.title}
              </span>
            )}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {week.sessions.length} sessions
          </Badge>
        </div>
        {week.notes && (
          <p className="text-sm text-slate-600 mt-2">{week.notes}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingSessions.map(({ day, sessions }) => (
            <div key={day} className="space-y-3">
              {/* Day Header */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    day === currentDay ? "bg-blue-600" : "bg-slate-300"
                  }`}
                />
                <h3 className="font-semibold text-slate-900">
                  {getDayName(day)}
                  {day === currentDay && (
                    <span className="text-blue-600 ml-2 text-sm font-normal">
                      (Today)
                    </span>
                  )}
                </h3>
              </div>

              {/* Sessions for this day */}
              <div className="space-y-3 ml-4">
                {sessions.map((session) => {
                  const completionRate = currentUserId
                    ? calculateSessionCompletion(session, currentUserId)
                    : 0;

                  return (
                    <Card
                      key={session.id}
                      className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="space-y-3">
                          {/* Session Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 truncate">
                                {session.title}
                              </h4>
                              {session.description && (
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                  {session.description}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          </div>

                          {/* Session Meta */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            {session.timeOfDay && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {TIME_OF_DAY_LABELS[session.timeOfDay]}
                                </span>
                              </div>
                            )}
                            {session.durationMinutes && (
                              <div className="flex items-center gap-1">
                                <span>
                                  {formatDuration(session.durationMinutes)}
                                </span>
                              </div>
                            )}
                            {session.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{session.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span>{session.exercises.length} exercises</span>
                            </div>
                          </div>

                          {/* Progress (if user is logged in) */}
                          {currentUserId && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600">
                                  Your Progress
                                </span>
                                <span className="font-medium text-slate-900">
                                  {completionRate}%
                                </span>
                              </div>
                              <Progress
                                value={completionRate}
                                className="h-1.5"
                              />
                            </div>
                          )}

                          {/* Equipment Tags */}
                          {session.equipment &&
                            session.equipment.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {session.equipment
                                  .slice(0, 3)
                                  .map((item, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs border-slate-300 text-slate-700"
                                    >
                                      {item}
                                    </Badge>
                                  ))}
                                {session.equipment.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-slate-300 text-slate-700"
                                  >
                                    +{session.equipment.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
