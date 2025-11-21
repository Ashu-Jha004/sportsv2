"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import AthleteHeader from "../components/AthleteHeader";
import AthleteBody from "../components/AthleteBody";
import type {
  AthleteProfile,
  AthleteStats,
  MediaItem,
  MatchHistory,
} from "@/types/profile/athlete-profile.types";
import { Sport } from "../schemas/edit-profile-schema";

interface PageProps {
  params: Promise<{ username?: string }>;
}

export default function DynamicProfilePage({ params }: PageProps) {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<AthleteProfile | null>(null);
  const [statsData, setStatsData] = useState<AthleteStats | null>(null);
  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [matchesData, setMatchesData] = useState<MatchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOwnProfile = !username;

  useEffect(() => {
    params.then((resolvedParams) => {
      setUsername(resolvedParams.username ?? null);
    });
  }, [params]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded) return;

      setIsLoading(true);
      setError(null);

      try {
        const url = isOwnProfile
          ? `/api/user/current`
          : `/api/user/${encodeURIComponent(username!)}`;

        console.log("🔍 STEP 1: Fetching from:", url);

        const response = await fetch(url);
        const data = await response.json();

        console.log("🔍 STEP 2: Raw API response:", {
          success: data.success,
          hasData: !!data.data,
          dataKeys: data.data ? Object.keys(data.data) : [],
          fullData: data.data,
        });

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load profile");
        }

        if (data.data) {
          console.log("🔍 STEP 3: Setting profileData with:", {
            id: data.data.id,
            username: data.data.username,
            hasCity: !!data.data.city,
            city: data.data.city,
            allKeys: Object.keys(data.data),
          });

          setProfileData(data.data);

          // Mock data for stats, media and matches for demo:
          setStatsData({
            weight: 75,
            height: 180,
            strength: 85,
            speed: 78,
            agility: 82,
            endurance: 88,
            power: 80,
            flexibility: 75,
            lastUpdated: new Date().toISOString(),
          });

          setMediaData([
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
          ]);

          setMatchesData([
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
          ]);
        }
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (username !== null || isOwnProfile) {
      fetchProfile();
    }
  }, [username, isOwnProfile, user, isLoaded]);

  useEffect(() => {
    console.log("🔍 STEP 4: Rendering with profileData:", {
      exists: !!profileData,
      id: profileData?.id,
      username: profileData?.username,
      hasCity: !!profileData?.city,
      city: profileData?.city,
      keys: profileData ? Object.keys(profileData) : [],
    });
  }, [profileData]);

  if (isLoading || username === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        </div>
      </div>
    );
  }

  // Step 5: Log before passing to components
  console.log("🔍 STEP 5: About to render components with athlete:", {
    athleteExists: !!profileData,
    athleteKeys: Object.keys(profileData),
    hasCity: !!profileData.city,
    cityValue: profileData.city,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AthleteHeader athlete={profileData} isOwnProfile={isOwnProfile} />
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
