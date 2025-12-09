"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";
import { format } from "date-fns";

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

export function ViewDetailsDialog() {
  const { selectedChallenge, closeActionDialog } = useSentChallengeStore();

  const challenge = selectedChallenge;

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Challenge data not found. Please try again.
        </p>
        <Button onClick={closeActionDialog} variant="outline">
          Close
        </Button>
      </div>
    );
  }

  const teamInitials = challenge.challengedTeamName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sportLabel =
    SPORT_LABELS[challenge.challengedTeamSport] ||
    challenge.challengedTeamSport;

  const getStatusBadge = () => {
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
          className="bg-amber-50 text-amber-700 border-amber-300"
        >
          Counter-Proposal
        </Badge>
      );
    } else if (challenge.status === "SCHEDULING") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-300"
        >
          Negotiating
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-slate-50 text-slate-700 border-slate-300"
      >
        Pending Response
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
          <AvatarImage
            src={challenge.challengedTeamLogo || undefined}
            alt={challenge.challengedTeamName}
          />
          <AvatarFallback className="text-lg font-bold">
            {teamInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-bold">{challenge.challengedTeamName}</h3>
          {challenge.challengedTeamSchool && (
            <p className="text-sm text-muted-foreground">
              {challenge.challengedTeamSchool}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            {getStatusBadge()}
            <Badge variant="secondary">{sportLabel}</Badge>
          </div>
        </div>
      </div>

      {/* Status Info */}
      {challenge.status === "SCHEDULED" && (
        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <p className="font-semibold mb-1">Match Confirmed!</p>
            <p className="text-xs">
              Both teams have agreed on the match details. The match is
              scheduled.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {challenge.status === "REJECTED" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-1">Challenge Rejected</p>
            {challenge.rejectionReason && (
              <p className="text-xs italic mt-2">
                "{challenge.rejectionReason}"
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {challenge.hasCounterProposal && (
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <p className="font-semibold mb-1">Counter-Proposal Received</p>
            <p className="text-xs">
              The opponent team has proposed different match details. Review and
              respond.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Match Details */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          {challenge.hasCounterProposal
            ? "Their Proposed Details"
            : "Match Details"}
        </h4>

        {/* Date & Time */}
        {challenge.proposedDate ? (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                {format(new Date(challenge.proposedDate), "EEEE, MMMM d, yyyy")}
              </p>
              {challenge.proposedTime && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {challenge.proposedTime}
                  {challenge.matchDurationMinutes && (
                    <span className="ml-1">
                      ({challenge.matchDurationMinutes} minutes)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 text-muted-foreground">
            <Calendar className="h-5 w-5 mt-0.5" />
            <p className="text-sm italic">Date and time to be decided later</p>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <p className="font-medium">{challenge.proposedLocation}</p>
        </div>
      </div>

      {/* Additional Info */}
      {challenge.status === "PENDING_CHALLENGE" &&
        !challenge.hasCounterProposal && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Waiting for the opponent team to respond to your challenge.
              {challenge.isExpiringSoon && (
                <span className="block mt-2 text-amber-600 font-medium">
                  ⏰ Challenge expires in {challenge.daysRemaining} day
                  {challenge.daysRemaining !== 1 ? "s" : ""}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

      {/* Close Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={closeActionDialog}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
