"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useAthleteStatsStore } from "@/stores/athlete/athleteStats.store";
import {
  processAthleteStats,
  type CleanedAthleteStats,
} from "../../lib/utils/statsDataProcessor";

import { AIHeaderMenu } from "@/components/ai/AIHeaderMenu";
import { StatsPageHeader } from "../../components/stats/layout/StatsPageHeader";
import { PerformanceOverview } from "../../components/stats/layout/PerformanceOverview";
import { StatsNavigation } from "../../components/stats/layout/StatsNavigation";
import { TimelineView } from "../../components/stats/layout/TimelineView";
import { AnthropometricSection } from "../../components/stats/sections/AnthropometricSection";
import { StrengthSection } from "../../components/stats/sections/StrengthSection";
import { SpeedSection } from "../../components/stats/sections/SpeedSection";
import { StaminaSection } from "../../components/stats/sections/StaminaSection";

type ActiveView =
  | "overview"
  | "timeline"
  | "strength"
  | "speed"
  | "stamina"
  | "anthropometric";

interface PageProps {
  // Next 16: params is a Promise and must be unwrapped with React.use()
  params: Promise<{ username?: string }>;
}

type ProfileResponse = {
  id: string;
  clerkUserId?: string;
  firstName?: string;
  // ...whatever else StatsPageHeader expects
};

async function fetchProfile(
  username: string | undefined,
  isOwnProfile: boolean
): Promise<ProfileResponse> {
  const url = isOwnProfile
    ? "/api/user/current"
    : `/api/user/${encodeURIComponent(username!)}`;

  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();

  if (!res.ok || !data?.success || !data?.data) {
    throw new Error(data?.error || "Failed to load profile");
  }

  return data.data as ProfileResponse;
}

const StatsPage = ({ params }: PageProps) => {
  const { user, isLoaded } = useUser();
  const { username: routeUsername } = React.use(params);
  const isOwnProfile = routeUsername == null;

  const [activeView, setActiveView] = React.useState<ActiveView>("overview");
  const [cleanedStats, setCleanedStats] =
    React.useState<CleanedAthleteStats | null>(null);
  const [statsFetchAttempted, setStatsFetchAttempted] = React.useState(false);

  const {
    fetchStatsByAthleteId,
    fetchStatsByUsername,
    fetchCurrentUserStats,
    getStats,
    getStatus,
  } = useAthleteStatsStore();

  // Profile via React Query (cached)
  const {
    data: profileData,
    isPending: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery<ProfileResponse>({
    queryKey: ["athlete-profile-stats", isOwnProfile ? "me" : routeUsername],
    queryFn: () => fetchProfile(routeUsername, isOwnProfile),
    enabled: isLoaded && (isOwnProfile || !!routeUsername),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const cacheKey = React.useMemo(() => {
    if (!profileData && !isOwnProfile && routeUsername) {
      return `username:${routeUsername}`;
    }
    if (isOwnProfile) {
      return "current:user";
    }
    if (profileData?.clerkUserId) {
      return `athlete:${profileData.clerkUserId}`;
    }
    return null;
  }, [isOwnProfile, profileData, routeUsername]);

  const statsStatus = cacheKey ? getStatus(cacheKey) : null;

  // Fetch stats once profile is available
  React.useEffect(() => {
    if (!profileData || !cacheKey || statsFetchAttempted) return;

    const fetchStats = async () => {
      try {
        if (isOwnProfile) {
          await fetchCurrentUserStats();
        } else if (profileData.clerkUserId) {
          await fetchStatsByAthleteId(profileData.clerkUserId);
        } else if (routeUsername) {
          await fetchStatsByUsername(routeUsername);
        }
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setStatsFetchAttempted(true);
      }
    };

    fetchStats();
  }, [
    profileData,
    cacheKey,
    statsFetchAttempted,
    isOwnProfile,
    routeUsername,
    fetchCurrentUserStats,
    fetchStatsByAthleteId,
    fetchStatsByUsername,
  ]);

  // Process stats once they exist in the store
  React.useEffect(() => {
    if (!cacheKey || !statsFetchAttempted) return;

    const rawStats = getStats(cacheKey);
    if (!rawStats) return;

    try {
      const processed = processAthleteStats(rawStats);
      setCleanedStats(processed);
    } catch (err) {
      console.error("Error processing stats:", err);
    }
  }, [cacheKey, statsFetchAttempted, getStats]);

  // ----- Profile loading/error states -----

  if (!isLoaded || isProfileLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-800 mb-3">
              Error Loading Profile
            </h2>
            <p className="text-red-600 mb-6">
              {profileError instanceof Error
                ? profileError.message
                : "Failed to load profile."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">Profile Not Available</h2>
          <p className="text-gray-600">Profile data could not be loaded.</p>
        </div>
      </div>
    );
  }

  // ----- Stats loading / error / empty states -----

  if (statsStatus?.isLoading || !statsFetchAttempted) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
          <StatsPageHeader
            profileData={profileData}
            isOwnProfile={isOwnProfile}
          />
          <div className="mt-8 flex items-center justify-center min-h-[400px]">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">
                Loading athlete stats...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Fetching performance data
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (statsStatus?.hasError) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
          <StatsPageHeader
            profileData={profileData}
            isOwnProfile={isOwnProfile}
          />
          <div className="mt-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
              <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-red-800 mb-3">
                  Error Loading Stats
                </h2>
                <p className="text-red-600 mb-4">{statsStatus.error}</p>
                <button
                  onClick={() => {
                    setStatsFetchAttempted(false);
                    window.location.reload();
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statsStatus?.hasData || !cleanedStats) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
          <StatsPageHeader
            profileData={profileData}
            isOwnProfile={isOwnProfile}
          />
          <div className="mt-8">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-6">📊</div>
                <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                  No Performance Data Available
                </h2>
                <p className="text-yellow-700 text-lg mb-6">
                  {isOwnProfile
                    ? "You haven't completed a performance evaluation yet."
                    : `${
                        profileData.firstName ?? "This athlete"
                      } hasn't completed a performance evaluation yet.`}
                </p>
                {isOwnProfile && (
                  <button className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold">
                    Find a Guide to Get Started
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- Main stats display -----

  return (
    <div className="fixed inset-0 overflow-y-auto bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <StatsPageHeader
          profileData={profileData}
          isOwnProfile={isOwnProfile}
          stats={cleanedStats}
        />

        <div className="mt-4 flex justify-end">
          <AIHeaderMenu stats={cleanedStats} />
        </div>

        <div className="mt-8">
          <PerformanceOverview stats={cleanedStats} />
        </div>

        <div className="mt-8 sticky top-0 z-20 bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 py-2">
          <StatsNavigation
            activeView={activeView}
            onViewChange={setActiveView}
            stats={cleanedStats}
          />
        </div>

        <div className="mt-8 pb-20">
          {activeView === "overview" && (
            <div className="space-y-8">
              <AnthropometricSection stats={cleanedStats} />
              <StrengthSection stats={cleanedStats} preview />
              <SpeedSection stats={cleanedStats} preview />
              <StaminaSection stats={cleanedStats} preview />
            </div>
          )}

          {activeView === "timeline" && <TimelineView stats={cleanedStats} />}

          {activeView === "anthropometric" && (
            <AnthropometricSection stats={cleanedStats} expanded />
          )}

          {activeView === "strength" && (
            <StrengthSection stats={cleanedStats} />
          )}

          {activeView === "speed" && <SpeedSection stats={cleanedStats} />}

          {activeView === "stamina" && <StaminaSection stats={cleanedStats} />}
        </div>

        <div className="pb-8 text-center text-sm text-gray-500">
          <p>
            Last updated:{" "}
            {new Date(cleanedStats.recordedAt).toLocaleDateString()}
          </p>
          {cleanedStats.profile.lastUpdated.by && (
            <p className="mt-1">
              Updated by: {cleanedStats.profile.lastUpdated.by}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
