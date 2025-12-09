"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useReceivedChallengeStore } from "@/stores/challenges/recevied/received-challenge-store";
import { handleChallengeAction } from "@/actions/challenges/received/received-challenge-actions";
import { toast } from "sonner";
import { format } from "date-fns";

export function AcceptChallengeDialog() {
  const queryClient = useQueryClient();
  const { selectedMatchId, selectedChallenge, closeActionDialog } =
    useReceivedChallengeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const challenge = selectedChallenge;

  const handleAccept = useCallback(async () => {
    if (!selectedMatchId) return;

    try {
      setIsSubmitting(true);
      console.log(
        "✅ [AcceptChallengeDialog] Accepting challenge:",
        selectedMatchId
      );

      const result = await handleChallengeAction({
        matchId: selectedMatchId,
        action: "ACCEPT",
      });

      if (result.success) {
        toast("Challenge Accepted! 🎉");

        queryClient.invalidateQueries({ queryKey: ["received-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["challenge-teams"] });

        closeActionDialog();
      } else {
        toast("Failed to Accept");
      }
    } catch (error) {
      console.error(
        "❌ [AcceptChallengeDialog] Error accepting challenge:",
        error
      );
      toast("Error");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMatchId, toast, queryClient, closeActionDialog]);

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

  const teamInitials = challenge.challengerTeamName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Confirmation Alert */}
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          You are about to accept this challenge. The match will be scheduled
          with the proposed details below.
        </AlertDescription>
      </Alert>

      {/* Challenger Team */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
          <AvatarImage
            src={challenge.challengerTeamLogo || undefined}
            alt={challenge.challengerTeamName}
          />
          <AvatarFallback className="text-lg font-bold">
            {teamInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-bold">{challenge.challengerTeamName}</h3>
          {challenge.challengerTeamSchool && (
            <p className="text-sm text-muted-foreground">
              {challenge.challengerTeamSchool}
            </p>
          )}
        </div>
      </div>

      {/* Match Details */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Match Details to Be Locked In
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

      <Separator />

      {/* Warning */}
      <Alert
        variant="default"
        className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
      >
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Once accepted, the match will be scheduled and both teams will be
          notified. These details cannot be changed without mutual agreement.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={closeActionDialog}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAccept}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accept Challenge
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
