// components/profile/tabs/AboutTab.tsx

"use client";

import { ProfileData } from "../../types/profile.types";
import { PersonalInfoCard } from "./SubComponents/PersonalInfoCard";
import { LocationCard } from "./SubComponents/LocationCard";
import { SportsInfoCard } from "./SubComponents/SportsInfoCard";
import { RankClassCard } from "./SubComponents/RankClassCard";
import { Separator } from "@/components/ui/separator";

interface AboutTabProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
}

export default function AboutTab({ profile, isOwnProfile }: AboutTabProps) {
  return (
    <div className="space-y-6">
      {/* Bio Section */}
      {profile.bio && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">Bio</h3>
          <p className="text-base text-slate-700 leading-relaxed">
            {profile.bio}
          </p>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <PersonalInfoCard profile={profile} />

        {/* Location Information */}
        <LocationCard
          city={profile.city}
          country={profile.country}
          state={profile.state}
          longitude={profile?.longitude}
          latitude={profile?.latitude}
        />

        {/* Sports Information */}
        <SportsInfoCard sportsInfo={profile.sportsInfo} />

        {/* Rank & Class Information */}
        <RankClassCard rank={profile.rank} class={profile.class} />
      </div>
    </div>
  );
}
