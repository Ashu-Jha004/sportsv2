"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrainingPlanWithRelations } from "@/types/Training/types/training";
import { getAthleteCompletionStats } from "@/app/(protected)/team/actions/training/completionActions";
import { calculateTrainingStats } from "@/lib/utils/trainingHelpers";
import DashboardHeader from "./DashboardHeader";
import StatsOverview from "./StatsOverview";
import CurrentWeekView from "./CurrentWeekView";
import RecentFootage from "./RecentFootage";
import QuickActions from "./QuickActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TrainingDashboardProps {
  plan: TrainingPlanWithRelations;
  teamId: string;
  currentUserId: string | null;
  onRefresh: () => void;
}

export default function TrainingDashboard({
  plan,
  teamId,
  currentUserId,
  onRefresh,
}: TrainingDashboardProps) {
  // Fetch athlete's completion stats
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["athlete-completion-stats", plan.id, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      return await getAthleteCompletionStats(plan.id, currentUserId);
    },
    enabled: !!currentUserId && !!plan.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Calculate overall training stats
  const trainingStats = useMemo(() => {
    return calculateTrainingStats(plan, currentUserId || undefined);
  }, [plan, currentUserId]);

  // Get current week (default to week 1)
  const currentWeekNumber = useMemo(() => {
    // TODO: Calculate based on plan.startDate if set
    return 1;
  }, []);

  const currentWeek = useMemo(() => {
    return plan.weeks.find((w) => w.weekNumber === currentWeekNumber);
  }, [plan.weeks, currentWeekNumber]);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader plan={plan} onRefresh={onRefresh} />

      {/* Quick Actions */}
      <QuickActions
        teamId={teamId}
        planId={plan.id}
        currentWeek={currentWeekNumber}
      />

      {/* Stats Overview */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : statsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Failed to load completion stats
          </AlertDescription>
        </Alert>
      ) : (
        <StatsOverview
          trainingStats={trainingStats}
          athleteStats={statsResponse?.data || null}
        />
      )}

      {/* Current Week View */}
      {currentWeek ? (
        <CurrentWeekView
          week={currentWeek}
          planId={plan.id}
          teamId={teamId}
          currentUserId={currentUserId}
        />
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            No training sessions scheduled for this week
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Footage */}
      {plan.footage && plan.footage.length > 0 && (
        <RecentFootage footage={plan.footage} teamId={teamId} />
      )}
    </div>
  );
}
