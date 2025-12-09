"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Users, Trophy, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamCardData } from "@/types/discovery/team-discovery";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: TeamCardData;
}

// Map sport enum to display names
const SPORT_LABELS: Record<string, string> = {
  FOOTBALL: "Football",
  BASKETBALL: "Basketball",
  CRICKET: "Cricket",
  TENNIS: "Tennis",
  RUNNING: "Running",
  SWIMMING: "Swimming",
  BADMINTON: "Badminton",
  VOLLEYBALL: "Volleyball",
  HOCKEY: "Hockey",
  ATHLETICS: "Athletics",
  WRESTLING: "Wrestling",
  BOXING: "Boxing",
  MARTIAL_ARTS: "Martial Arts",
  CYCLING: "Cycling",
  GOLF: "Golf",
  OTHER: "Other",
};

export function TeamCard({ team }: TeamCardProps) {
  const router = useRouter();

  // Memoized computed values
  const teamInitials = useMemo(() => {
    return team.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [team.name]);

  const locationText = useMemo(() => {
    const parts = [team.city, team.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not set";
  }, [team.city, team.state]);

  const sportLabel = useMemo(() => {
    return SPORT_LABELS[team.sport] || team.sport;
  }, [team.sport]);

  const memberStatusBadge = useMemo(() => {
    if (team.isCurrentUserMember) {
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Member
        </Badge>
      );
    }
    if (team.hasPendingJoinRequest) {
      return (
        <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return null;
  }, [team.isCurrentUserMember, team.hasPendingJoinRequest]);

  // Navigation handler
  const handleCardClick = useCallback(() => {
    try {
      if (!team.teamApplicationId) {
        console.warn(
          "⚠️ [TeamCard] No application ID found for team:",
          team.id
        );
        return;
      }
      router.push(`/team/${team.teamApplicationId}`);
    } catch (error) {
      console.error("❌ [TeamCard] Navigation error:", error);
    }
  }, [team.teamApplicationId, team.id, router]);

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2",
        team.isCurrentUserMember && "border-green-500/30",
        team.hasPendingJoinRequest && "border-amber-500/30"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Team Logo */}
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={team.logoUrl || undefined} alt={team.name} />
            <AvatarFallback className="text-lg font-bold bg-primary/10">
              {teamInitials}
            </AvatarFallback>
          </Avatar>

          {/* Team Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                  {team.name}
                </h3>
                {team.TeamSchool && (
                  <p className="text-sm text-muted-foreground truncate">
                    {team.TeamSchool}
                  </p>
                )}
              </div>
              {memberStatusBadge}
            </div>

            {/* Sport Badge */}
            <Badge variant="secondary" className="mt-2">
              {sportLabel}
            </Badge>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Class & Rank */}
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {team.class && team.rank
                ? `Class ${team.class} • ${team.rank}`
                : team.class
                ? `Class ${team.class}`
                : team.rank
                ? team.rank
                : "Not ranked"}
            </span>
          </div>

          {/* Members Count */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {team.membersCount}{" "}
              {team.membersCount === 1 ? "member" : "members"}
            </span>
          </div>
        </div>

        {/* Location Section */}
        <div className="flex items-center gap-2 text-sm pt-3 border-t">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground truncate">{locationText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
