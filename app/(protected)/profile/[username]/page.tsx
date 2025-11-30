"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import AthleteHeader from "../components/AthleteHeader";
import AthleteBody from "../components/AthleteBody";
import type {
  AthleteProfile,
  AthleteStats,
  MediaItem,
  MatchHistory,
} from "@/types/profile/athlete-profile.types";
import { Sport } from "../schemas/edit-profile-schema";
// import { useAthleteStats } from "../hooks/profile/useAthleteStats";

interface PageProps {
  // Next 16: params is a Promise and must be unwrapped with React.use()
  params: Promise<{ username?: string }>;
}

async function fetchAthleteProfile(
  username: string | undefined,
  isOwnProfile: boolean
): Promise<AthleteProfile> {
  const url = isOwnProfile
    ? "/api/user/current"
    : `/api/user/${encodeURIComponent(username!)}`;

  const response = await fetch(url, { credentials: "include" });
  const data = await response.json();

  if (!response.ok || !data?.success || !data?.data) {
    throw new Error(data?.error || "Failed to load profile");
  }

  return data.data as AthleteProfile;
}

export default function DynamicProfilePage({ params }: PageProps) {
  const { user, isLoaded } = useUser();

  // ✅ Next 16: unwrap params Promise once
  const { username: routeUsername } = React.use(params);

  // /profile        -> own profile (no username)
  // /profile/[user] -> public profile
  const isOwnProfile = routeUsername == null;
  const isFriendProfile = !isOwnProfile;

  // ✅ React Query for profile (cached, avoids redundant calls)
  const {
    data: profileData,
    isPending,
    isError,
    error,
  } = useQuery<AthleteProfile>({
    queryKey: ["athlete-profile", isOwnProfile ? "me" : routeUsername],
    queryFn: () => fetchAthleteProfile(routeUsername, isOwnProfile),
    enabled: isLoaded && (isOwnProfile || !!routeUsername),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Stats – can be wired later
  const statsData: AthleteStats | null = null;
  // const { data: statsData } = useAthleteStats(profileData?.id);

  // Mock media & matches (only derived when profile exists)
  const mediaData: MediaItem[] = React.useMemo(
    () =>
      profileData
        ? [
            {
              id: "1",
              type: "IMAGE",
              url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format",
              caption: "Training session",
              uploadedAt: new Date().toISOString(),
            },
            {
              id: "2",
              type: "IMAGE",
              url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format",
              caption: "Match day",
              uploadedAt: new Date().toISOString(),
            },
          ]
        : [],
    [profileData]
  );

  const matchesData: MatchHistory[] = React.useMemo(
    () =>
      profileData
        ? [
            {
              id: "1",
              date: "2025-11-15",
              sport: Sport.CRICKET,
              matchType: "TOURNAMENT",
              opponent: "City Rivals FC",
              result: "WIN",
              score: { own: 3, opponent: 1 },
              location: "Home Stadium",
              duration: 90,
            },
            {
              id: "2",
              date: "2025-11-10",
              sport: Sport.CRICKET,
              matchType: "LEAGUE",
              opponent: "State Champions",
              result: "LOSS",
              score: { own: 1, opponent: 2 },
              location: "Away Ground",
              duration: 90,
            },
          ]
        : [],
    [profileData]
  );

  // Loading (wait for Clerk + query)
  if (!isLoaded || isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-blue-600/70 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-5 max-w-md w-full shadow-sm">
          <h2 className="text-lg font-semibold text-red-800 mb-1">
            Unable to load profile
          </h2>
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      </div>
    );
  }

  // Not found
  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-900">
            Profile not found
          </h2>
          <p className="text-sm text-slate-500">
            This athlete profile could not be located.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AthleteHeader
        athlete={profileData}
        isOwnProfile={isOwnProfile}
        isFriendProfile={isFriendProfile}
        onMessageUser={() => {
          console.log("Open chat with", profileData.username);
        }}
      />
      <AthleteBody
        athlete={profileData}
        stats={statsData}
        media={mediaData}
        matches={matchesData}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}
