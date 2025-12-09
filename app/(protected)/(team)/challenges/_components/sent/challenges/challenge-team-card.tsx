"use client";

import { useMemo, useCallback, useState } from "react";
import { MapPin, Users, Trophy, Swords, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChallengeTeamCardData } from "@/types/challenges/challenge";
import { useChallengeStore } from "@/stores/challenges/challenge-store";
import { cn } from "@/lib/utils";

interface ChallengeTeamCardProps {
  team: ChallengeTeamCardData;
  canChallenge: boolean;
}

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

export function ChallengeTeamCard({ team, canChallenge }: ChallengeTeamCardProps) {
  const { openWizard } = useChallengeStore();
  const [isLoading, setIsLoading] = useState(false);

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

  const winRate = useMemo(() => {
    if (team.matchesPlayed === 0) return "N/A";
    const rate = (team.wins / team.matchesPlayed) * 100;
    return `${rate.toFixed(0)}%`;
  }, [team.wins, team.matchesPlayed]);

  const recordText = useMemo(() => {
    if (team.matchesPlayed === 0) return "No matches played";
    return `${team.wins}W - ${team.losses}L`;
  }, [team.wins, team.losses, team.matchesPlayed]);

  // Challenge button handler
  const handleChallenge = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      
      try {
        setIsLoading(true);
        console.log("🎯 [ChallengeTeamCard] Opening challenge wizard for team:", team.id);
        
        openWizard(team.id, team.name, team.logoUrl, team.sport);
      } catch (error) {
        console.error("❌ [ChallengeTeamCard] Failed to open wizard:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [team.id, team.name, team.logoUrl, team.sport, openWizard]
  );

  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-lg border-2",
        team.hasPendingChallenge && "border-amber-500/30"
      )}
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
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{team.name}</h3>
                {team.TeamSchool && (
                  <p className="text-sm text-muted-foreground truncate">
                    {team.TeamSchool}
                  </p>
                )}
              </div>
            </div>

            {/* Sport Badge */}
            <Badge variant="secondary" className="mt-1">
              {sportLabel}
            </Badge>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Class & Rank */}
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {team.class && team.rank
                ? `Class ${team.class} • ${team.rank}`
                : team.class
                ? `Class ${team.class}`
                : team.rank
                ? team.rank
                : "Unranked"}
            </span>
          </div>

          {/* Members Count */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {team.membersCount} {team.membersCount === 1 ? "member" : "members"}
            </span>
          </div>
        </div>

        {/* Match Record */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{recordText}</span>
            </div>
            <span className="text-sm font-bold text-primary">{winRate}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {team.matchesPlayed} {team.matchesPlayed === 1 ? "match" : "matches"} played
          </div>
        </div>

        {/* Location Section */}
        <div className="flex items-center gap-2 text-sm mb-4 pb-4 border-b">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground truncate">{locationText}</span>
        </div>

        {/* Challenge Button */}
        <Button
          onClick={handleChallenge}
          disabled={!canChallenge || team.hasPendingChallenge || isLoading}
          className="w-full"
          size="lg"
        >
          <Swords className="h-4 w-4 mr-2" />
          {team.hasPendingChallenge
            ? "Challenge Pending"
            : isLoading
            ? "Loading..."
            : "Challenge Team"}
        </Button>

        {!canChallenge && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Only team owners and captains can send challenges
          </p>
        )}
      </CardContent>
    </Card>
  );
}
