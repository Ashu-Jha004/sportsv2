// app/team/[teamId]/_components/TeamPageClient.tsx (Import fixes)
"use client";

import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTeamStore } from "@/stores/team/fetching/teamStore";
import { useTeamData } from "../../hooks/useTeamData";
import TeamHeader from "./TeamHeader";
import TeamActions from "./TeamActions";
import TeamTabs from "./TeamTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { logger } from "../../lib/utils/logger";
import NotificationBadge from "../../components/notifications/NotificationBadge";
import NotificationsDropdown from "../../components/notifications/NotificationsDropdown";
// ✅ FIXED: Import React for useEffect
interface TeamPageClientProps {
  initialTeamData: any;
  currentUserId: string | null;
  teamId: string;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.message?.includes("404")) return false;
        return failureCount < 3;
      },
    },
  },
});

function TeamPageClientContent({
  initialTeamData,
  currentUserId,
  teamId,
}: TeamPageClientProps) {
  const setTeamData = useTeamStore((state) => state.setTeamData);

  // Hydrate with SSR data
  React.useEffect(() => {
    if (initialTeamData) {
      logger.team.debug("💧 Hydrating TeamPageClient with SSR data", {
        teamId,
        memberCount: initialTeamData.members?.length || 0,
      });
      setTeamData(initialTeamData);
    }
  }, [initialTeamData, setTeamData, teamId]);

  const { teamData, isLoading, error, refetch } = useTeamData({
    teamId,
    initialData: initialTeamData,
    currentUserId,
  });

  if (error) {
    logger.team.error(error, { teamId, userId: currentUserId });
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Failed to load team
            </h2>
            <p className="text-slate-600 mb-8">{error.message}</p>
            <div className="space-x-3">
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Retry
              </button>
              <a
                href="/teams"
                className="px-6 py-2 bg-slate-200 text-slate-900 rounded-xl hover:bg-slate-300"
              >
                Go Back
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : teamData ? (
            <TeamHeader team={teamData} currentUserId={currentUserId} />
          ) : null}
        </div>

        {/* Actions */}
        {teamData && !isLoading && (
          <div className="mb-12">
            <TeamActions team={teamData} currentUserId={currentUserId} />
          </div>
        )}

        {/* Content */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96 rounded-3xl col-span-2" />
              <div className="space-y-6 lg:col-span-1">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
              </div>
            </div>
          ) : teamData ? (
            <Suspense
              fallback={<Skeleton className="h-96 w-full rounded-3xl" />}
            >
              <TeamTabs team={teamData} currentUserId={currentUserId} />
            </Suspense>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function TeamPageClient(props: TeamPageClientProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TeamPageClientContent {...props} />
    </QueryClientProvider>
  );
}
