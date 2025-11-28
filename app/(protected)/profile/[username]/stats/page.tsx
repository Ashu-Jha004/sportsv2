// app/(protected)/profile/[username]/stats/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ username?: string }>;
}

type ActiveView =
  | "overview"
  | "timeline"
  | "strength"
  | "speed"
  | "stamina"
  | "anthropometric";

const StatsPage = ({ params }: PageProps) => {
  const { user, isLoaded } = useUser();
  const { username: routeUsername } = React.use(params);
  const isOwnProfile = routeUsername == null;

  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [cleanedStats, setCleanedStats] = useState<CleanedAthleteStats | null>(
    null
  );
  const [statsFetchAttempted, setStatsFetchAttempted] = useState(false);

  // Get stats store functions
  const {
    fetchStatsByAthleteId,
    fetchStatsByUsername,
    fetchCurrentUserStats,
    getStats,
    getStatus, // ✅ Add getStatus
  } = useAthleteStatsStore();

  // Determine cache key
  const cacheKey = isOwnProfile
    ? "current:user"
    : profileData?.clerkUserId
    ? `athlete:${profileData.clerkUserId}`
    : routeUsername
    ? `username:${routeUsername}`
    : null;

  // Get comprehensive status
  const statsStatus = cacheKey ? getStatus(cacheKey) : null;

  // --- Profile Data Fetching ---
  useEffect(() => {
    if (!isLoaded) return;

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setError(null);

      try {
        const url = isOwnProfile
          ? "/api/user/current"
          : `/api/user/${encodeURIComponent(routeUsername!)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load profile");
        }

        if (data.data) {
          setProfileData(data.data);
        }
      } catch (err) {
        console.error("❌ Profile fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isOwnProfile || routeUsername) {
      fetchProfile();
    }
  }, [isLoaded, isOwnProfile, routeUsername]);

  // --- Stats Fetching ---
  useEffect(() => {
    if (!profileData || statsFetchAttempted) return;

    const fetchStats = async () => {
      console.log("🔄 Fetching stats for:", {
        isOwnProfile,
        profileData,
        routeUsername,
      });

      try {
        if (isOwnProfile) {
          await fetchCurrentUserStats();
        } else if (profileData.clerkUserId) {
          await fetchStatsByAthleteId(profileData.clerkUserId);
        } else if (routeUsername) {
          await fetchStatsByUsername(routeUsername);
        }
      } catch (err) {
        console.error("❌ Stats fetch error:", err);
      } finally {
        setStatsFetchAttempted(true);
      }
    };

    fetchStats();
  }, [
    profileData,
    isOwnProfile,
    routeUsername,
    statsFetchAttempted,
    fetchCurrentUserStats,
    fetchStatsByAthleteId,
    fetchStatsByUsername,
  ]);

  // --- Process Stats Data ---
  useEffect(() => {
    if (!cacheKey || !statsFetchAttempted) return;

    console.log("🔍 Checking stats in cache:", cacheKey);
    const rawStats = getStats(cacheKey);

    if (rawStats) {
      console.log("✅ Stats found in cache, processing...");
      try {
        const processed = processAthleteStats(rawStats);
        setCleanedStats(processed);
        console.log("✅ Stats processed successfully");
      } catch (err) {
        console.error("❌ Error processing stats:", err);
      }
    } else {
      console.log("⚠️ No stats in cache yet");
    }
  }, [cacheKey, statsFetchAttempted, getStats]);

  // Debug logging
  console.log("📊 Current state:", {
    cacheKey,
    statsStatus,
    statsFetchAttempted,
    hasCleanedStats: !!cleanedStats,
  });

  // --- Loading State ---
  if (isLoadingProfile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-800 mb-3">
              Error Loading Profile
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
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

  // --- No Profile State ---
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

  // --- Stats Loading State ---
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

  // --- Stats Error State ---
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

  console.log("✅ Stats loaded successfully:", cleanedStats);

  // --- No Stats State ---
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
                    : `${profileData.firstName} hasn't completed a performance evaluation yet.`}
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

  // --- Main Stats Display ---
  return (
    <div className="fixed inset-0 overflow-y-auto bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <StatsPageHeader
          profileData={profileData}
          isOwnProfile={isOwnProfile}
          stats={cleanedStats}
        />

        {/* Add this after StatsPageHeader or in a logical spot */}
        <div className="mt-4 flex justify-end">
          <AIHeaderMenu stats={cleanedStats} />
        </div>

        {/* Performance Overview Hero Section */}
        <div className="mt-8">
          <PerformanceOverview stats={cleanedStats} />
        </div>

        {/* Navigation Tabs - Sticky */}
        <div className="mt-8 sticky top-0 z-20 bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 py-2">
          <StatsNavigation
            activeView={activeView}
            onViewChange={setActiveView}
            stats={cleanedStats}
          />
        </div>

        {/* Content Area */}
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

        {/* Footer */}
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
