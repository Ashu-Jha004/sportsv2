"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AthleteHeader from "../components/AthleteHeader";
import AthleteBody from "../components/AthleteBody";
import {
  useAthleteProfile,
  useOwnProfile,
} from "../hooks/profile/use-athlete-profile";
import type {
  AthleteStats,
  MediaItem,
  MatchHistory,
} from "@/types/profile/athlete-profile.types";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function DynamicProfilePage({ params }: PageProps) {
  const { user, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // ✅ Unwrap params
  const { username: routeUsername } = React.use(params);

  // ✅ Get username from Clerk (check both locations)
  const clerkUsername = React.useMemo(() => {
    // Try native username first
    if (user?.username) return user.username;

    // Fallback to publicMetadata (your onboarding uses this)
    if (user?.publicMetadata?.username) {
      return user.publicMetadata.username as string;
    }

    return null;
  }, [user]);

  // 🐛 COMPREHENSIVE DEBUG
  console.log("=".repeat(60));
  console.log("🔍 PROFILE PAGE DEBUG");
  console.log("=".repeat(60));
  console.log("📍 Route username:", routeUsername);
  console.log("🔐 Clerk isLoaded:", isClerkLoaded);
  console.log("🔐 Clerk isSignedIn:", isSignedIn);
  console.log("👤 Clerk user.username:", user?.username);
  console.log(
    "👤 Clerk publicMetadata.username:",
    user?.publicMetadata?.username
  );
  console.log("✅ Final username used:", clerkUsername);
  console.log("=".repeat(60));

  // ✅ Determine ownership
  const [isOwnProfile, setIsOwnProfile] = React.useState(false);
  const isFriendProfile = !isOwnProfile && !!routeUsername;

  // Check ownership (improved logic)
  React.useEffect(() => {
    if (!isClerkLoaded) {
      console.log("⏳ Clerk still loading...");
      return;
    }

    if (!isSignedIn || !user) {
      console.log("❌ User not signed in or user object null");
      setIsOwnProfile(false);
      return;
    }

    if (!clerkUsername) {
      console.log("⚠️ User signed in but username not set");
      setIsOwnProfile(false);
      return;
    }

    const viewingOwn = routeUsername === clerkUsername;

    console.log("✅ Ownership check complete:", {
      routeUsername,
      clerkUsername,
      isOwnProfile: viewingOwn,
    });

    setIsOwnProfile(viewingOwn);
  }, [isClerkLoaded, isSignedIn, user, clerkUsername, routeUsername]);

  // ✅ Fetch own profile (only if signed in and viewing own)
  const {
    data: ownProfileData,
    isPending: isOwnPending,
    isError: isOwnError,
    error: ownError,
  } = useOwnProfile(isClerkLoaded && isSignedIn && isOwnProfile);

  // ✅ Fetch public profile
  const {
    data: publicProfileData,
    isPending: isPublicPending,
    isError: isPublicError,
    error: publicError,
  } = useAthleteProfile(routeUsername || "", isClerkLoaded && isFriendProfile);

  // ✅ Select data source
  const profileData = isOwnProfile ? ownProfileData : publicProfileData;
  const isPending = isOwnProfile ? isOwnPending : isPublicPending;
  const isError = isOwnProfile ? isOwnError : isPublicError;
  const error = isOwnProfile ? ownError : publicError;

  // ✅ Mock data
  const statsData: AthleteStats | null = null;

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
              sport: "CRICKET" as any,
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
              sport: "CRICKET" as any,
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

  // ============================================================================
  // LOADING
  // ============================================================================

  if (!isClerkLoaded || isPending) {
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

  // ============================================================================
  // ERROR
  // ============================================================================

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

  // ============================================================================
  // NOT FOUND
  // ============================================================================

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

  // ============================================================================
  // SUCCESS
  // ============================================================================

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
