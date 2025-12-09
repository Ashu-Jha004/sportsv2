"use client";

import { useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SentChallengeCardData } from "@/types/challenges/challenge";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SentChallengeCardProps {
  challenge: SentChallengeCardData;
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

export function SentChallengeCard({
  challenge,
  canManage,
}: SentChallengeCardProps) {
  const { openActionDialog } = useSentChallengeStore();

  // Memoized computed values
  const teamInitials = useMemo(() => {
    return challenge.challengedTeamName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [challenge.challengedTeamName]);

  const sportLabel = useMemo(() => {
    return (
      SPORT_LABELS[challenge.challengedTeamSport] ||
      challenge.challengedTeamSport
    );
  }, [challenge.challengedTeamSport]);

  const statusBadge = useMemo(() => {
    if (challenge.status === "SCHEDULED") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-300"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Accepted
        </Badge>
      );
    } else if (challenge.status === "REJECTED") {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    } else if (challenge.hasCounterProposal) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
        >
          <ArrowRightLeft className="h-3 w-3 mr-1" />
          Counter-Proposal Received
        </Badge>
      );
    } else if (challenge.status === "SCHEDULING") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-300"
        >
          <Edit className="h-3 w-3 mr-1" />
          Negotiating
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-slate-50 text-slate-700 border-slate-300"
      >
        <Clock className="h-3 w-3 mr-1" />
        Pending Response
      </Badge>
    );
  }, [challenge.status, challenge.hasCounterProposal]);

  const expirationWarning = useMemo(() => {
    if (challenge.isExpiringSoon && challenge.status === "PENDING_CHALLENGE") {
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
  }, [challenge.isExpiringSoon, challenge.daysRemaining, challenge.status]);

  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-lg border-2",
        challenge.hasCounterProposal &&
          "border-amber-300/50 ring-2 ring-amber-100",
        challenge.status === "SCHEDULED" && "border-green-300/50",
        challenge.status === "REJECTED" && "border-red-300/50 opacity-75"
      )}
    >
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Team Logo */}
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage
              src={challenge.challengedTeamLogo || undefined}
              alt={challenge.challengedTeamName}
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
                  {challenge.challengedTeamName}
                </h3>
                {challenge.challengedTeamSchool && (
                  <p className="text-sm text-muted-foreground truncate">
                    {challenge.challengedTeamSchool}
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

        {/* Counter-Proposal Alert */}
        {challenge.hasCounterProposal && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  They proposed different match details!
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Review their counter-proposal below and accept or negotiate
                  further.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expiration Warning */}
        {expirationWarning && (
          <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
            {expirationWarning}
          </div>
        )}

        {/* Rejection Info */}
        {challenge.status === "REJECTED" && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Challenge Rejected
                </p>
                {challenge.rejectionReason && (
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1 italic">
                    "{challenge.rejectionReason}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Match Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            {challenge.hasCounterProposal
              ? "Their Proposed Details"
              : "Match Details"}
          </h4>

          {/* Date & Time */}
          {challenge.proposedDate ? (
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
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
              <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm italic">Date to be decided</p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {challenge.proposedLocation || "Location TBD"}
            </p>
          </div>
        </div>

        {/* Accepted Status Info */}
        {challenge.status === "SCHEDULED" && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3 inline mr-1" />
              Match confirmed! Both teams have agreed on the details.
            </p>
          </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="p-6 pt-0">
        <div className="w-full space-y-2">
          {/* Counter-Proposal Actions */}
          {challenge.hasCounterProposal && challenge.status !== "REJECTED" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() =>
                    openActionDialog(
                      challenge.matchId,
                      "ACCEPT_COUNTER",
                      challenge
                    )
                  }
                  disabled={!canManage}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="default"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept Counter
                </Button>
                <Button
                  onClick={() =>
                    openActionDialog(
                      challenge.matchId,
                      "COUNTER_AGAIN",
                      challenge
                    )
                  }
                  disabled={!canManage}
                  variant="outline"
                  className="w-full"
                  size="default"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Negotiate More
                </Button>
              </div>
              <Button
                onClick={() =>
                  openActionDialog(challenge.matchId, "CANCEL", challenge)
                }
                disabled={!canManage}
                variant="ghost"
                className="w-full"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Challenge
              </Button>
            </>
          )}

          {/* Pending Actions */}
          {challenge.status === "PENDING_CHALLENGE" &&
            !challenge.hasCounterProposal && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() =>
                    openActionDialog(
                      challenge.matchId,
                      "VIEW_DETAILS",
                      challenge
                    )
                  }
                  variant="outline"
                  className="w-full"
                  size="default"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  onClick={() =>
                    openActionDialog(challenge.matchId, "CANCEL", challenge)
                  }
                  disabled={!canManage}
                  variant="destructive"
                  className="w-full"
                  size="default"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}

          {/* Accepted Actions */}
          {challenge.status === "SCHEDULED" && (
            <Button
              onClick={() =>
                openActionDialog(challenge.matchId, "VIEW_DETAILS", challenge)
              }
              variant="outline"
              className="w-full"
              size="default"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Match Details
            </Button>
          )}

          {/* Rejected Actions */}
          {challenge.status === "REJECTED" && (
            <Button
              onClick={() =>
                openActionDialog(challenge.matchId, "VIEW_DETAILS", challenge)
              }
              variant="outline"
              className="w-full"
              size="default"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}

          {!canManage &&
            challenge.status !== "REJECTED" &&
            challenge.status !== "SCHEDULED" && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Only team owners and captains can manage challenges
              </p>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
