"use client";

import React, { useState, useMemo, useCallback } from "react";
import { AthleteHeaderProps } from "@/types/profile/athlete-profile.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditProfileDialog } from "./EditProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  MapPin,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Shield,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSportBanner,
  formatDate,
  formatCount,
} from "@/lib/design-system/utils";
import { SportBadge } from "@/components/ui/sport-badge";
import { FollowButton } from "@/components/ui/follow-button";
import { toast } from "sonner";

// Stats Preview Component
function StatsPreview({
  wins = 0,
  losses = 0,
  totalMatches = 0,
}: {
  wins?: number;
  losses?: number;
  totalMatches?: number;
}) {
  const winRate =
    totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {/* Wins */}
      <div className="flex flex-col items-center p-3 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-md transition-all">
        <div className="flex items-center gap-1.5 mb-1">
          <Trophy className="text-green-600" size={16} strokeWidth={2.5} />
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            Wins
          </span>
        </div>
        <p className="text-2xl font-bold text-green-900">{wins}</p>
      </div>

      {/* Losses */}
      <div className="flex flex-col items-center p-3 bg-linear-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl hover:shadow-md transition-all">
        <div className="flex items-center gap-1.5 mb-1">
          <Target className="text-red-600" size={16} strokeWidth={2.5} />
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
            Losses
          </span>
        </div>
        <p className="text-2xl font-bold text-red-900">{losses}</p>
      </div>

      {/* Win Rate */}
      <div className="flex flex-col items-center p-3 bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-md transition-all">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="text-blue-600" size={16} strokeWidth={2.5} />
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Win Rate
          </span>
        </div>
        <p className="text-2xl font-bold text-blue-900">{winRate}%</p>
      </div>
    </div>
  );
}

// Role Badge Component
function RoleBadge({ role }: { role: string }) {
  const roleColors: Record<string, { bg: string; text: string; icon: string }> =
    {
      ATHLETE: { bg: "bg-blue-100", text: "text-blue-700", icon: "🏃" },
      GUIDE: { bg: "bg-purple-100", text: "text-purple-700", icon: "🎯" },
      ADMIN: { bg: "bg-red-100", text: "text-red-700", icon: "⚡" },
      MODERATOR: { bg: "bg-orange-100", text: "text-orange-700", icon: "🛡️" },
    };

  const roleStyle = roleColors[role] || roleColors.ATHLETE;

  return (
    <Badge
      className={cn(
        "text-xs font-semibold px-3 py-1 rounded-full border-2",
        roleStyle.bg,
        roleStyle.text
      )}
    >
      <span className="mr-1">{roleStyle.icon}</span>
      {role}
    </Badge>
  );
}

export default function AthleteHeader({
  athlete,
  isOwnProfile,
  onMessageUser,
  isFriendProfile,
}: AthleteHeaderProps & { isFriendProfile?: boolean }) {
  const fullName = useMemo(
    () => `${athlete.firstName} ${athlete.lastName}`,
    [athlete.firstName, athlete.lastName]
  );

  // Get sport-specific banner
  const bannerUrl = useMemo(
    () => getSportBanner(athlete.primarySport || "DEFAULT"),
    [athlete.primarySport]
  );

  const handleMessageClick = useCallback(() => {
    if (onMessageUser) {
      onMessageUser();
    } else {
      toast.success(`Opening chat with ${athlete.username}`, {
        description: "This feature is coming soon!",
      });
      console.log(`Message button clicked for ${athlete.username}`);
    }
  }, [athlete.username, onMessageUser]);

  // Location string
  const location = useMemo(() => {
    const parts = [athlete.city, athlete.state, athlete.country].filter(
      Boolean
    );
    return parts.length > 0 ? parts.join(", ") : "Location not set";
  }, [athlete.city, athlete.state, athlete.country]);

  // Member since
  const memberSince = useMemo(() => {
    return athlete.createdAt
      ? formatDate(athlete.createdAt, "medium")
      : "Recently";
  }, [athlete.createdAt]);

  return (
    <section className="relative w-full max-w-6xl mx-auto mb-6">
      {/* Banner Image */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden rounded-t-2xl shadow-lg">
        <img
          src={"/hero-athletes.png"}
          alt={`${athlete.primarySport || "Sport"} banner`}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

        {/* Edit Button (Own Profile) */}
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
          >
            <Edit size={16} className="mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <div className="relative bg-white rounded-b-2xl shadow-xl border border-slate-200 -mt-6 mx-4 sm:mx-6 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:items-start -mt-20 sm:-mt-24">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-white shadow-2xl ring-4 ring-blue-100">
              <AvatarImage
                src={athlete.profileImage || undefined}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white text-4xl font-bold">
                {athlete.firstName?.charAt(0)}
                {athlete.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Rank & Class Badges */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              {athlete.rank && (
                <Badge className="bg-linear-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-md">
                  <Trophy size={14} className="mr-1" />
                  Rank #{athlete.rank}
                </Badge>
              )}
              {athlete.class && (
                <Badge className="bg-linear-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full font-bold shadow-md">
                  <Award size={14} className="mr-1" />
                  Class {athlete.class}
                </Badge>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Name & Username */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">
                {fullName}
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-blue-600 mb-2">
                @{athlete.username}
              </p>

              {/* Roles */}
              {athlete.roles && athlete.roles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {athlete.roles.map((role: string) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>
              )}

              {/* Follower Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                <button className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <span className="text-2xl font-bold text-slate-900 group-hover:text-blue-600">
                    {formatCount(athlete.followersCount || 0)}
                  </span>
                  <span className="text-slate-600 group-hover:text-blue-600">
                    Followers
                  </span>
                </button>
                <button className="group flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <span className="text-2xl font-bold text-slate-900 group-hover:text-blue-600">
                    {formatCount(athlete.followingCount || 0)}
                  </span>
                  <span className="text-slate-600 group-hover:text-blue-600">
                    Following
                  </span>
                </button>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Trophy size={16} className="text-blue-600" />
                  <span className="font-semibold">{0} Matches</span>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              {location !== "Location not set" && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-slate-400" />
                <span>Joined {memberSince}</span>
              </div>
              {athlete.gender && (
                <div className="flex items-center gap-1.5">
                  <Shield size={16} className="text-slate-400" />
                  <span>{athlete.gender}</span>
                </div>
              )}
            </div>

            {/* Sports */}
            <div className="flex flex-wrap gap-2">
              {athlete.primarySport && (
                <SportBadge
                  sport={athlete.primarySport}
                  variant="primary"
                  size="md"
                />
              )}
              {athlete.secondarySports?.map((sport: string) => (
                <SportBadge
                  key={sport}
                  sport={sport}
                  variant="secondary"
                  size="sm"
                />
              ))}
            </div>

            {/* Action Buttons */}
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {isOwnProfile ? (
                <EditProfileDialog>
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 shadow-lg shadow-blue-500/25"
                  >
                    <Edit size={18} className="mr-2" />
                    Edit Profile
                  </Button>
                </EditProfileDialog>
              ) : (
                <>
                  <FollowButton
                    username={athlete.username}
                    initialFollowing={isFriendProfile}
                    size="lg"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleMessageClick}
                    className="font-semibold border-2 hover:bg-slate-50 shadow-md"
                  >
                    <MessageSquare size={18} className="mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
            Performance Overview
          </h3>
          <StatsPreview wins={0} losses={0} totalMatches={0} />
        </div>
      </div>
    </section>
  );
}
