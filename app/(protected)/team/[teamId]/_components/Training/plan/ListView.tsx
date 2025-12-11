"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Video,
  Plus,
  Pencil, // ✅ ADD
} from "lucide-react";
import {
  TrainingWeekWithRelations,
  DAY_NAMES,
  TIME_OF_DAY_LABELS,
} from "@/types/Training/types/training";
import {
  groupSessionsByDay,
  formatDuration,
  calculateSessionCompletion,
  formatExercisePrescription,
  isExerciseCompleted,
} from "@/lib/utils/trainingHelpers";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
// Helper to format YouTube URLs for embedding
const getYouTubeEmbedUrl = (url: string): string => {
  // Handle different YouTube URL formats
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  
  if (videoIdMatch) {
    const videoId = videoIdMatch[1];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  }
  
  // Fallback for direct embed URLs
  if (url.includes('youtube.com/embed/') || url.includes('youtube.com/v/')) {
    return url.includes('?') 
      ? `${url}&rel=0&modestbranding=1&playsinline=1`
      : `${url}?rel=0&modestbranding=1&playsinline=1`;
  }
  
  // If not a YouTube URL, return original (for other video platforms)
  return url;
};


interface ListViewProps {
  week: TrainingWeekWithRelations;
  planId: string;
  teamId: string;
  currentUserId: string | null;
}

export default function ListView({
  week,
  planId,
  teamId,
  currentUserId,
}: ListViewProps) {
  const [expandedSessions, setExpandedSessions] = useState<
    Record<string, boolean>
  >({});
  const { openCreateExercise, openEditSession } = useTrainingStore(); // ✅ ADD openEditSession

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    return groupSessionsByDay(week.sessions);
  }, [week.sessions]);

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Get days with sessions
  const daysWithSessions = useMemo(() => {
    return Object.entries(sessionsByDay)
      .filter(([_, sessions]) => sessions.length > 0)
      .map(([day, sessions]) => ({
        day: parseInt(day),
        sessions,
      }));
  }, [sessionsByDay]);

  if (daysWithSessions.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-slate-600">No sessions scheduled for this week</p>
          <p className="text-sm text-slate-500 mt-1">
            Add sessions to get started with your training plan
          </p>
        </CardContent>
      </Card>
    );
  }
  console.log("sessions ", daysWithSessions);

  return (
    <div className="space-y-6">
      {daysWithSessions.map(({ day, sessions }) => (
        <div key={day} className="space-y-3">
          {/* Day Header */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <h3 className="text-xl font-bold text-slate-900">
              {DAY_NAMES[day as keyof typeof DAY_NAMES]}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
            </Badge>
          </div>

          {/* Sessions */}
          <div className="space-y-3 ml-6">
            {sessions.map((session: any) => {
              const isExpanded = expandedSessions[session.id];
              const completionRate = currentUserId
                ? calculateSessionCompletion(session, currentUserId)
                : 0;

              return (
                <Card
                  key={session.id}
                  className="border-slate-200 hover:shadow-md transition-shadow"
                >
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleSession(session.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="cursor-pointer">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between gap-4">
                            {/* Left side - Session info */}
                            <div className="flex-1 min-w-0 space-y-3">
                              {/* Title & Description */}
                              <div>
                                <h4 className="font-semibold text-lg text-slate-900">
                                  {session.title}
                                </h4>
                                {session.description && (
                                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                    {session.description}
                                  </p>
                                )}
                              </div>

                              {/* Meta Info */}
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                {session.timeOfDay && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {TIME_OF_DAY_LABELS[session.timeOfDay]}
                                    </span>
                                  </div>
                                )}
                                {session.durationMinutes && (
                                  <Badge variant="outline" className="text-xs">
                                    {formatDuration(session.durationMinutes)}
                                  </Badge>
                                )}
                                {session.location && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{session.location}</span>
                                  </div>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {session.exercises.length} exercises
                                </Badge>
                                {session.footage &&
                                  session.footage.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-purple-600">
                                      <Video className="w-4 h-4" />
                                      <span className="text-xs font-medium">
                                        {session.footage.length} videos
                                      </span>
                                    </div>
                                  )}
                              </div>

                              {/* Progress */}
                              {currentUserId && (
                                <div className="space-y-1.5 max-w-xs">
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
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Right side - Expand + Edit + Add Exercise */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </Button>

                              {/* ✅ NEW: Edit Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditSession(session); // ✅ NEW
                                }}
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                Edit
                              </Button>

                              {/* Add Exercise Button */}
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
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </CollapsibleTrigger>

                    {/* Expanded Content - Exercises */}
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4">
                        <div className="border-t border-slate-200 pt-4 space-y-3">
                          <h5 className="font-semibold text-slate-900 text-sm">
                            Exercises ({session.exercises.length})
                          </h5>

                          {session.exercises.length > 0 ? (
                            <div className="space-y-2">
                              {session.exercises.map(
                                (exercise: any, index: any) => {
                                  const isCompleted = currentUserId
                                    ? isExerciseCompleted(
                                        exercise,
                                        currentUserId
                                      )
                                    : false;

                                  return (
                                    <div
                                      key={exercise.id}
                                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                        isCompleted
                                          ? "bg-emerald-50 border-emerald-200"
                                          : "bg-slate-50 border-slate-200"
                                      }`}
                                    >
                                      {/* Completion Icon */}
                                      {currentUserId && (
                                        <div className="flex-shrink-0 mt-0.5">
                                          {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                          ) : (
                                            <Circle className="w-5 h-5 text-slate-400" />
                                          )}
                                        </div>
                                      )}

                                      {/* Exercise Info */}
                                      <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start gap-2">
                                          <span className="text-xs font-semibold text-slate-500 flex-shrink-0">
                                            #{index + 1}
                                          </span>
                                          <div className="flex-1">
                                            <h6 className="font-medium text-slate-900">
                                              {exercise.name}
                                            </h6>
                                            <p className="text-sm text-slate-600 mt-0.5">
                                              {formatExercisePrescription(
                                                exercise
                                              )}
                                            </p>
                                            {exercise.notes && (
                                              <p className="text-xs text-slate-500 mt-1 italic">
                                                {exercise.notes}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Exercise Meta */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {exercise.category && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {exercise.category}
                                            </Badge>
                                          )}
                                          {exercise.intensity && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs border-orange-300 text-orange-700"
                                            >
                                              {exercise.intensity}
                                            </Badge>
                                          )}

                                          {exercise?.videoUrl && (
                                            <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
                                              <iframe
                                                src={getYouTubeEmbedUrl(
                                                  exercise.videoUrl
                                                )}
                                                title={
                                                  exercise.name ||
                                                  "Exercise demonstration"
                                                }
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                                loading="lazy"
                                                className="absolute inset-0 w-full h-full"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 text-center py-4">
                              No exercises added yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
