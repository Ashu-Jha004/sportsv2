"use client";

import React, { useCallback, useEffect } from "react";
import { useTeam } from "../hooks/profile/useTeam";
import TeamTabCard from "./Team/TeamTabCard";
import NoTeamState from "./Team/NoTeamState";
import TeamTabSkeleton from "./Team/TeamTabSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// ============================================
// TYPE DEFINITIONS
// ============================================

type TeamTabProps = {
  variant?: "default" | "compact" | "detailed";
  showSkeleton?: boolean;
  isOwnProfile?: any;
  username?: any;
  isLoadings?: any;
  profileData?: any;
};

// ============================================
// ERROR STATE COMPONENT
// ============================================

const TeamTabError: React.FC<{
  error: string | null;
  errorCode: string | null;
  onRetry: () => void;
}> = React.memo(({ error, errorCode, onRetry }) => {
  console.log("❌ [TeamTabError] Rendering error state:", { error, errorCode });

  return (
    <Card className="w-full overflow-hidden border-destructive/50 bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center shadow-lg">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        {/* Error Title */}
        <h3 className="text-2xl font-bold text-foreground mb-3">
          Failed to Load Team Data
        </h3>

        {/* Error Message */}
        <p className="text-muted-foreground mb-2 max-w-md mx-auto">
          {error ||
            "An unexpected error occurred while fetching team information."}
        </p>

        {/* Error Code */}
        {errorCode && (
          <p className="text-xs text-muted-foreground/70 mb-6 font-mono">
            Error Code: {errorCode}
          </p>
        )}

        {/* Retry Button */}
        <Button
          onClick={onRetry}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>

        {/* Additional Help */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please{" "}
            <button
              onClick={() => {
                toast.info("Contact support at support@example.com", {
                  duration: 5000,
                });
              }}
              className="text-primary hover:underline font-medium"
            >
              contact support
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

TeamTabError.displayName = "TeamTabError";

// ============================================
// MAIN COMPONENT
// ============================================

export const TeamTab: React.FC<TeamTabProps> = React.memo(
  ({
    variant = "default",
    showSkeleton = true,
    username,
    profileData,
    isLoadings,
    isOwnProfile,
  }) => {
    const { clerkUserId } = profileData;
    const {
      team,
      userRole,
      isOwner,
      hasTeam,
      isLoading,
      isError,
      error,
      errorCode,
      retry,
      refetch,
    } = useTeam(clerkUserId);

    // Handle retry with toast feedback
    const handleRetry = useCallback(() => {
      console.log("🔄 [TeamTab] Retry button clicked");
      toast.loading("Retrying...", { id: "team-retry" });
      retry();
    }, [retry]);

    // Show error toast on error
    useEffect(() => {
      if (isError && error) {
        console.error("❌ [TeamTab] Error detected:", error);
        toast.error("Failed to load team data", {
          description: error,
          action: {
            label: "Retry",
            onClick: handleRetry,
          },
          duration: 5000,
        });
      }
    }, [isError, error, handleRetry]);

    // Show success toast when team loads
    useEffect(() => {
      if (hasTeam && team && !isLoading) {
        console.log("✅ [TeamTab] Team loaded successfully:", team.name);
        // Optional: Show a subtle success toast
        // toast.success("Team data loaded", { duration: 2000 });
      }
    }, [hasTeam, team, isLoading]);

    // ============================================
    // RENDER LOGIC
    // ============================================

    // Loading State
    if (isLoading) {
      console.log("⏳ [TeamTab] Rendering loading state");
      return showSkeleton ? <TeamTabSkeleton /> : null;
    }

    // Error State
    if (isError) {
      console.log("❌ [TeamTab] Rendering error state");
      return (
        <TeamTabError
          error={error}
          errorCode={errorCode}
          onRetry={handleRetry}
        />
      );
    }

    // No Team State
    if (!hasTeam || !team) {
      console.log("ℹ️ [TeamTab] Rendering no team state");
      return <NoTeamState variant={variant} />;
    }
    let isViewOnly = null;
    if (isOwnProfile == true) {
      isViewOnly = false;
    } else isViewOnly = true;
    // Success State - Show Team Card
    console.log("✅ [TeamTab] Rendering team card");
    return (
      <TeamTabCard
        team={team}
        userRole={userRole || "PLAYER"}
        isOwner={isOwner}
        isViewOnly={isViewOnly}
        isOwnProfile={isOwnProfile}
      />
    );
  }
);

TeamTab.displayName = "TeamTab";

export default TeamTab;
