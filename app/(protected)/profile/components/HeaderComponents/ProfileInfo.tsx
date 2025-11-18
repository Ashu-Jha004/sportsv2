// components/profile/ProfileInfo.tsx

"use client";

import Image from "next/image";
import { ProfileData } from "../../types/profile.types";
import { ProfileBadges } from "./ProfileBadges";
import { MapPin, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileInfoProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
  onEditClick: () => void;
}

export function ProfileInfo({
  profile,
  isOwnProfile = true,
  onEditClick,
}: ProfileInfoProps) {
  return (
    <div className="relative px-4 md:px-6 lg:px-8">
      {/* Avatar - Overlaps banner */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 md:-mt-20">
          <div className="relative group">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
              <Image
                src="/images.webp"
                alt={profile.fullName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 128px, 160px"
              />
            </div>

            {/* Edit Avatar Button */}
            {isOwnProfile && (
              <button
                className="absolute bottom-2 right-2 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Change profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Name & Username */}
          <div className="flex flex-col items-center sm:items-start mb-2 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {profile.fullName}
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-medium">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* Edit Profile Button - Desktop */}
        {isOwnProfile && (
          <Button
            onClick={onEditClick}
            variant="outline"
            className="hidden md:flex items-center gap-2 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-900 font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Details */}
      <div className="mt-6 space-y-4">
        {/* Badges */}
        <ProfileBadges rank={profile.rank} class={profile.class} />

        {/* Bio */}
        {profile.bio && (
          <p className="text-base text-slate-700 leading-relaxed max-w-3xl">
            {profile.bio}
          </p>
        )}

        {/* Sports & Location */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
          {/* Sports */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">Sports:</span>
            <div className="flex gap-2 flex-wrap">
              {profile.sports.map((sport, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>
              {profile.state}, {profile.country}
            </span>
          </div>
        </div>

        {/* Edit Profile Button - Mobile */}
        {isOwnProfile && (
          <Button
            onClick={onEditClick}
            variant="outline"
            className="md:hidden w-full bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-900 font-semibold py-2.5 rounded-lg shadow-sm transition-all"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
}
