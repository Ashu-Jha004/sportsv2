"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamStore } from "@/stores/team/fetching/teamStore";
import { getTeamPermissions } from "../../lib/utils/teamPermissions";
import { TeamWithRelations } from "../../lib/types/team";
import { Users, MapPin, Trophy, Heart, UserPlus, LogOut } from "lucide-react";
import { tokens } from "@/lib/design-tokens";

interface TeamHeaderProps {
  team: TeamWithRelations;
  currentUserId: string | null;
}

export default function TeamHeader({ team, currentUserId }: TeamHeaderProps) {
  const { isFollowing, toggleFollowing, followerCount } = useTeamStore();
  const permissions = getTeamPermissions(team, currentUserId);

  const sportBadges = [
    { label: team.sport, variant: "default" as const },
    team.rank && { label: team.rank, variant: "secondary" as const },
    team.class && { label: `Class ${team.class}`, variant: "outline" as const },
  ].filter(Boolean);

  const stats = [
    {
      icon: Users,
      label: "Members",
      value: team.counters?.membersCount || team.members.length,
    },
    {
      icon: Trophy,
      label: "Matches",
      value: team.counters?.matchesPlayed || 0,
    },
    {
      icon: Heart,
      label: "Followers",
      value: followerCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section - Simplified */}
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="relative h-32 md:h-40 bg-linear-to-r from-emerald-500 to-blue-500">
          {team.logoUrl && (
            <Image
              src={team.logoUrl}
              alt={`${team.name} banner`}
              fill
              className="object-cover opacity-20 mix-blend-overlay"
            />
          )}
        </div>

        <CardContent className="p-6 md:p-8">
          {/* Logo + Name + Actions Row */}
          <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
            {/* Team Logo */}
            <div className="shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white border-4 border-white shadow-xl overflow-hidden">
                {team.logoUrl ? (
                  <Image
                    src={team.logoUrl}
                    alt={`${team.name} logo`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-bold text-slate-600">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Team Info */}
            <div className="flex-1 min-w-0 mt-4 md:mt-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Team Name + Status */}
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 truncate">
                      {team.name}
                    </h1>
                    {team.status !== "ACTIVE" && (
                      <Badge variant="destructive" className="shrink-0">
                        {team.status.replace("_", " ")}
                      </Badge>
                    )}
                  </div>

                  {/* Sport Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sportBadges.map((badge: any, i) => (
                      <Badge
                        key={i}
                        variant={badge.variant}
                        className="text-sm"
                      >
                        {badge.label}
                      </Badge>
                    ))}
                  </div>

                  {/* Location */}
                  {team.city && (
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span>
                        {team.city}, {team.state}, {team.country}
                      </span>
                    </div>
                  )}
                </div>

                {/* Follow Button - More Prominent */}
                <div className="shrink-0">
                  <Button
                    size="lg"
                    variant={isFollowing ? "outline" : "default"}
                    onClick={toggleFollowing}
                    className="w-full md:w-auto min-w-[140px]"
                  >
                    {isFollowing ? (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>

                {permissions.isMember && !permissions.isOwner && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Team
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {team.bio && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-700 leading-relaxed">{team.bio}</p>
            </div>
          )}

          {/* Stats - Compact Design */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-slate-400" />
                    <div className="text-2xl font-bold text-slate-900">
                      {stat.value.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Owner */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-sm text-slate-500">
            <span>Created by</span>
            <div className="flex items-center gap-2">
              {team.owner.profileImage ? (
                <Image
                  src={team.owner.profileImage}
                  alt={team.owner.username || "Owner"}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold">
                  {team.owner.firstName?.charAt(0)}
                  {team.owner.lastName?.charAt(0)}
                </div>
              )}
              <span className="font-medium text-slate-700">
                {team.owner.username ||
                  `${team.owner.firstName} ${team.owner.lastName}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
