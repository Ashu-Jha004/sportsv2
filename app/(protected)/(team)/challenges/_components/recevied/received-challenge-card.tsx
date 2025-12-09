"use client";

import { useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Check,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReceivedChallengeCardData } from "@/types/challenges/challenge";
import { useReceivedChallengeStore } from "@/stores/challenges/recevied/received-challenge-store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ReceivedChallengeCardProps {
  challenge: ReceivedChallengeCardData;
  canManage: boolean;
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

export function ReceivedChallengeCard({
  challenge,
  canManage,
}: ReceivedChallengeCardProps) {
  const { openActionDialog } = useReceivedChallengeStore();

  // Memoized computed values
  const teamInitials = useMemo(() => {
    return challenge.challengerTeamName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [challenge.challengerTeamName]);

  const sportLabel = useMemo(() => {
    return (
      SPORT_LABELS[challenge.challengerTeamSport] ||
      challenge.challengerTeamSport
    );
  }, [challenge.challengerTeamSport]);

  const isNegotiating = challenge.status === "SCHEDULING";

  const statusBadge = useMemo(() => {
    if (isNegotiating) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-300"
        >
          <Users className="h-3 w-3 mr-1" />
          Negotiating
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-300"
      >
        Pending Response
      </Badge>
    );
  }, [isNegotiating]);

  const expirationWarning = useMemo(() => {
    if (challenge.isExpiringSoon) {
      return (
        <div className="flex items-center gap-2 text-amber-600 text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span>
            Expires in {challenge.daysRemaining} day
            {challenge.daysRemaining !== 1 ? "s" : ""}
          </span>
        </div>
      );
    }
    return null;
  }, [challenge.isExpiringSoon, challenge.daysRemaining]);

  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-lg border-2",
        challenge.isExpiringSoon && "border-amber-300/50"
      )}
    >
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Team Logo */}
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage
              src={challenge.challengerTeamLogo || undefined}
              alt={challenge.challengerTeamName}
            />
            <AvatarFallback className="text-lg font-bold bg-primary/10">
              {teamInitials}
            </AvatarFallback>
          </Avatar>

          {/* Team Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {challenge.challengerTeamName}
                </h3>
                {challenge.challengerTeamSchool && (
                  <p className="text-sm text-muted-foreground truncate">
                    {challenge.challengerTeamSchool}
                  </p>
                )}
              </div>
            </div>

            {/* Status & Sport Badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              {statusBadge}
              <Badge variant="secondary">{sportLabel}</Badge>
            </div>
          </div>
        </div>

        {/* Expiration Warning */}
        {expirationWarning && (
          <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
            {expirationWarning}
          </div>
        )}

        <Separator className="my-4" />

        {/* Match Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Proposed Match Details
          </h4>

          {/* Date & Time */}
          {challenge.proposedDate ? (
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {format(
                    new Date(challenge.proposedDate),
                    "EEEE, MMMM d, yyyy"
                  )}
                </p>
                {challenge.proposedTime && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {challenge.proposedTime}
                    {challenge.matchDurationMinutes && (
                      <span className="ml-1">
                        ({challenge.matchDurationMinutes} min)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-muted-foreground">
              <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm italic">Date to be decided</p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm">
              {challenge.proposedLocation || "Location TBD"}
            </p>
          </div>

          {/* Message */}
          {challenge.messageFromChallenger && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Message from challenger
                  </p>
                  <p className="text-sm italic text-muted-foreground">
                    "{challenge.messageFromChallenger}"
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Negotiation Status */}
        {isNegotiating && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <Users className="h-3 w-3 inline mr-1" />
              This challenge is in negotiation. Review the proposed changes and
              respond.
            </p>
          </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      {/* Action Buttons */}
      <CardFooter className="p-6 pt-0">
        <div className="w-full space-y-2">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() =>
                openActionDialog(challenge.matchId, "ACCEPT", challenge)
              }
              disabled={!canManage}
              className="w-full"
              size="default"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              onClick={() =>
                openActionDialog(challenge.matchId, "REJECT", challenge)
              }
              disabled={!canManage}
              variant="destructive"
              className="w-full"
              size="default"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() =>
                openActionDialog(challenge.matchId, "COUNTER", challenge)
              }
              disabled={!canManage}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Negotiate
            </Button>
            <Button
              onClick={() =>
                openActionDialog(challenge.matchId, "DELETE", challenge)
              }
              disabled={!canManage}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          {!canManage && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Only team owners and captains can manage challenges
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
