"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import { getActiveTrainingPlan } from "../../../actions/training/trainingPlanActions";
import { getTeamFootage } from "../../../actions/training/trainingFootageActions";
import TrainingDashboard from "./dashboard/TrainingDashboard";
import TrainingPlanView from "./plan/TrainingPlanView";
import FootageGallery from "./footage/FootageGallery";
import EmptyTrainingState from "./EmptyTrainingState";
import EditPlanDialog from "./dialogs/EditPlanDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import UploadFootageDialog from "./footage/UploadFootageDialog";

export default function Training() {
  const params = useParams();
  const { userId } = useAuth();

  // DEBUG: Log initial values
  console.log("[Training] Component mounted");
  console.log("[Training] Params:", params);
  console.log("[Training] UserId:", userId);

  const teamId = params?.teamId as string;

  console.log("[Training] TeamId extracted:", teamId);

  const {
    activePlan,
    setActivePlan,
    setIsLoadingPlan,
    setPlanError,
    viewMode,
    setFootageList,
    setIsLoadingFootage,
    resetTrainingState,
  } = useTrainingStore();

  // Fetch active training plan
  const {
    data: planResponse,
    isLoading: isLoadingPlan,
    error: planError,
    refetch: refetchPlan,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["training-plan", teamId],
    queryFn: async () => {
      console.log("[Training] Starting queryFn for training plan");
      console.log("[Training] TeamId in queryFn:", teamId);

      if (!teamId) {
        console.error("[Training] No teamId provided!");
        throw new Error("Team ID is required");
      }

      console.log("[Training] Calling getActiveTrainingPlan...");
      const result = await getActiveTrainingPlan(teamId);
      console.log("[Training] getActiveTrainingPlan result:", result);

      return result;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once
  });

  // DEBUG: Log query state
  console.log("[Training] Query state:", {
    isLoadingPlan,
    isFetching,
    isError,
    hasData: !!planResponse,
    planResponse,
    planError,
  });

  // Fetch team footage
  const {
    data: footageResponse,
    isLoading: isLoadingFootage,
    error: footageError,
  } = useQuery({
    queryKey: ["team-footage", teamId],
    queryFn: async () => {
      if (!teamId) throw new Error("Team ID is required");
      console.log("[Training] Fetching footage for team:", teamId);
      return await getTeamFootage(teamId, 20, 0);
    },
    enabled: !!teamId && viewMode === "footage",
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchOnWindowFocus: false,
  });

  // Update Zustand store when data changes
  useEffect(() => {
    console.log("[Training] planResponse changed:", planResponse);

    if (planResponse?.success && planResponse.data !== undefined) {
      console.log("[Training] Setting active plan:", planResponse.data);
      setActivePlan(planResponse.data);
      setIsLoadingPlan(false);
    } else if (planError) {
      console.error("[Training] Plan error:", planError);
      setPlanError(
        planError instanceof Error
          ? planError.message
          : "Failed to load training plan"
      );
      setIsLoadingPlan(false);
    } else {
      console.log("[Training] Setting loading state:", isLoadingPlan);
      setIsLoadingPlan(isLoadingPlan);
    }
  }, [
    planResponse,
    planError,
    isLoadingPlan,
    setActivePlan,
    setIsLoadingPlan,
    setPlanError,
  ]);

  useEffect(() => {
    if (footageResponse?.success && footageResponse.data) {
      setFootageList(footageResponse.data);
      setIsLoadingFootage(false);
    } else {
      setIsLoadingFootage(isLoadingFootage);
    }
  }, [footageResponse, isLoadingFootage, setFootageList, setIsLoadingFootage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("[Training] Component unmounting, resetting state");
      resetTrainingState();
    };
  }, [resetTrainingState]);

  // Memoized loading state
  const isLoading = useMemo(() => {
    const loading = isLoadingPlan || !planResponse;
    console.log("[Training] Computed isLoading:", loading, {
      isLoadingPlan,
      hasPlanResponse: !!planResponse,
    });
    return loading;
  }, [isLoadingPlan, planResponse]);

  // Memoized error state
  const hasError = useMemo(() => {
    const error = planError !== null || (planResponse && !planResponse.success);
    console.log("[Training] Computed hasError:", error);
    return error;
  }, [planError, planResponse]);

  console.log("[Training] Render decision:", {
    isLoading,
    hasError,
    activePlan: !!activePlan,
  });

  // Loading state
  if (isLoading) {
    console.log("[Training] Rendering loading state");
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600">Loading training plan...</p>
        <p className="text-xs text-slate-400">
          Team ID: {teamId || "undefined"}
        </p>
        <p className="text-xs text-slate-400">
          Status: {isFetching ? "Fetching..." : "Waiting..."}
        </p>
      </div>
    );
  }

  // Error state
  if (hasError) {
    console.log("[Training] Rendering error state");
    const errorMessage =
      planError instanceof Error
        ? planError.message
        : planResponse?.error || "Failed to load training plan";

    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{errorMessage}</AlertDescription>
        </Alert>
        <div className="mt-4 p-4 bg-slate-100 rounded text-xs">
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>Team ID: {teamId}</p>
          <p>User ID: {userId}</p>
          <p>Error: {JSON.stringify(planError)}</p>
        </div>
      </div>
    );
  }

  // Empty state - no active plan
  if (!activePlan) {
    console.log("[Training] Rendering empty state");
    return <EmptyTrainingState teamId={teamId} onPlanCreated={refetchPlan} />;
  }

  console.log("[Training] Rendering main content, viewMode:", viewMode);

  // Render based on view mode
  return (
    <div className="space-y-6">
      {viewMode === "overview" && (
        <TrainingDashboard
          plan={activePlan}
          teamId={teamId}
          currentUserId={userId || null}
          onRefresh={refetchPlan}
        />
      )}

      {(viewMode === "calendar" || viewMode === "list") && (
        <TrainingPlanView
          plan={activePlan}
          teamId={teamId}
          currentUserId={userId || null}
          viewMode={viewMode}
          onRefresh={refetchPlan}
        />
      )}

      {viewMode === "footage" && (
        <FootageGallery teamId={teamId} currentUserId={userId || null} />
      )}

      {/* Edit Plan Dialog */}
      <EditPlanDialog />

      {/* ✅ ADD THIS - Upload Footage Dialog */}
      <UploadFootageDialog teamId={teamId} onSuccess={refetchPlan} />
    </div>
  );
}
