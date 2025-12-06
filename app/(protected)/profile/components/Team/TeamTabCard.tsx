"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Heart,
  FileText,
  Trophy,
  Crown,
  Shield,
  UserCircle,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { TeamData } from "@/actions/team.actions";
import { cn } from "@/lib/utils";

// ============================================
// TYPE DEFINITIONS
// ============================================

type TeamTabCardProps = {
  team: TeamData;
  userRole: string;
  isOwner: boolean;
  isViewOnly?: boolean;
  isOwnProfile?: boolean;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getRoleIcon = (role: string, isOwner: boolean) => {
  if (isOwner) return <Crown className="h-3.5 w-3.5" />;

  switch (role) {
    case "CAPTAIN":
      return <Shield className="h-3.5 w-3.5" />;
    case "MANAGER":
      return <UserCircle className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const getRoleLabel = (role: string, isOwner: boolean) => {
  if (isOwner) return "Owner";

  switch (role) {
    case "CAPTAIN":
      return "Captain";
    case "MANAGER":
      return "Manager";
    case "PLAYER":
      return "Player";
    default:
      return role;
  }
};

const getRoleBadgeColor = (role: string, isOwner: boolean) => {
  if (isOwner)
    return "bg-linear-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30";

  switch (role) {
    case "CAPTAIN":
      return "bg-linear-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-500/30";
    case "MANAGER":
      return "bg-linear-to-r from-purple-500/20 to-pink-500/20 text-purple-600 border-purple-500/30";
    default:
      return "bg-muted/50 text-muted-foreground border-border";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/20 text-green-600 border-green-500/30";
    case "PENDING_MEMBERS":
      return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
    case "PENDING_GUIDE_APPROVAL":
      return "bg-orange-500/20 text-orange-600 border-orange-500/30";
    case "REVOKED":
      return "bg-red-500/20 text-red-600 border-red-500/30";
    default:
      return "bg-muted/50 text-muted-foreground border-border";
  }
};

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const formatSport = (sport: string) => {
  return sport
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

// ============================================
// MAIN COMPONENT
// ============================================

export const TeamTabCard: React.FC<TeamTabCardProps> = React.memo(
  ({ team, userRole, isOwner, isViewOnly, isOwnProfile }) => {
    console.log("🎨 [TeamTabCard] Rendering with team:", team.name);

    // Memoized values
    const roleIcon = useMemo(
      () => getRoleIcon(userRole, isOwner),
      [userRole, isOwner]
    );
    const roleLabel = useMemo(
      () => getRoleLabel(userRole, isOwner),
      [userRole, isOwner]
    );
    const roleBadgeColor = useMemo(
      () => getRoleBadgeColor(userRole, isOwner),
      [userRole, isOwner]
    );
    const statusBadgeColor = useMemo(
      () => getStatusBadgeColor(team.status),
      [team.status]
    );

    const buttonText = useMemo(() => {
      if (isViewOnly) return "View Team"; // Always "View Team" for others
      return isOwner ? "Manage Team" : "View Team";
    }, [isOwner, isViewOnly]);

    const teamLink = useMemo(() => {
      return `/team/${team.teamApplicationId || team.id}`;
    }, [team.teamApplicationId, team.id]);

    // Stats data
    const stats = useMemo(
      () => [
        {
          label: "Members",
          value: team.counters?.membersCount ?? 0,
          icon: Users,
          color: "text-blue-500",
        },
        {
          label: "Followers",
          value: team.counters?.followersCount ?? 0,
          icon: Heart,
          color: "text-pink-500",
        },
        {
          label: "Posts",
          value: team.counters?.postsCount ?? 0,
          icon: FileText,
          color: "text-purple-500",
        },
      ],
      [team.counters]
    );

    return (
      <Card className="w-full overflow-hidden border-border/50 bg-linear-to-br from-card to-card/80 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Team Logo */}
            <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 bg-linear-to-br from-primary/10 to-primary/5 border border-border/50 shadow-md">
              {team.logoUrl ? (
                <Image
                  src={team.logoUrl}
                  alt={`${team.name} logo`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <Trophy className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Team Info */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2 mb-3">
                {/* Team Name */}
                <h3 className="text-2xl font-bold text-foreground truncate">
                  {team.name}
                </h3>

                {/* Sport, Class & Rank */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground font-medium">
                    {formatSport(team.sport)}
                  </span>
                  {team.class && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="text-sm text-muted-foreground">
                        Class {team.class}
                      </span>
                    </>
                  )}
                  {team.rank && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="text-sm text-muted-foreground capitalize">
                        {team.rank.toLowerCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Role Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 font-semibold shadow-sm",
                  roleBadgeColor
                )}
              >
                {roleIcon}
                {roleLabel}
              </Badge>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center space-y-1 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Mini Stats Bar */}
          <div className="flex items-center justify-between mb-6 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground font-medium">
                {team.counters?.matchesPlayed ?? 0} Matches Played
              </span>
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs font-semibold", statusBadgeColor)}
            >
              {formatStatus(team.status)}
            </Badge>
          </div>

          {/* Action Button */}
          <Button
            asChild
            className="w-full h-11 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            size="lg"
          >
            <Link
              href={teamLink}
              className="flex items-center justify-center gap-2"
            >
              {isOwner && <TrendingUp className="h-4 w-4" />}
              {buttonText}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
);

TeamTabCard.displayName = "TeamTabCard";

export default TeamTabCard;
