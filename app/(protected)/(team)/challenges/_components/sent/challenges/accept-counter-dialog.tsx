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
  ArrowRight,
} from "lucide-react";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";
import { handleSentChallengeAction } from "@/actions/challenges/negotition/sent/sent-challenge-actions";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AcceptCounterDialog() {
  const queryClient = useQueryClient();
  const { selectedMatchId, selectedChallenge, closeActionDialog } =
    useSentChallengeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const challenge = selectedChallenge;

  const handleAccept = useCallback(async () => {
    if (!selectedMatchId) return;

    try {
      setIsSubmitting(true);
      console.log(
        "✅ [AcceptCounterDialog] Accepting counter-proposal:",
        selectedMatchId
      );

      const result = await handleSentChallengeAction({
        matchId: selectedMatchId,
        action: "ACCEPT_COUNTER",
      });

      if (result.success) {
        toast("Counter-Proposal Accepted! 🎉");

        queryClient.invalidateQueries({ queryKey: ["sent-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["received-challenges"] });

        closeActionDialog();
      } else {
        toast("Failed to Accept");
      }
    } catch (error) {
      console.error(
        "❌ [AcceptCounterDialog] Error accepting counter-proposal:",
        error
      );
      toast("Error");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMatchId, toast, queryClient, closeActionDialog]);

  if (!challenge) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const teamInitials = challenge.challengedTeamName
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
          You are about to accept their counter-proposal. The match will be
          scheduled with the details they proposed.
        </AlertDescription>
      </Alert>

      {/* Team */}
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
        </div>
      </div>

      <Separator />

      {/* Comparison: Your Original vs Their Counter */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Proposal Comparison
        </h4>

        {/* Your Original Proposal */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
            Your Original Proposal:
          </p>
          <div className="space-y-2 text-sm">
            {challenge.originalProposedDate ? (
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {format(new Date(challenge.originalProposedDate), "PPP")}
                {challenge.originalProposedTime &&
                  ` at ${challenge.originalProposedTime}`}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-muted-foreground italic">
                <Calendar className="h-4 w-4" />
                Date TBD
              </p>
            )}
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {challenge.originalProposedLocation}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
            <ArrowRight className="h-5 w-5 text-amber-600" />
          </div>
        </div>

        {/* Their Counter-Proposal */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-2 border-amber-200 dark:border-amber-800">
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-3 uppercase">
            Their Counter-Proposal (New):
          </p>
          <div className="space-y-2 text-sm">
            {challenge.proposedDate ? (
              <p className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-medium">
                <Calendar className="h-4 w-4" />
                {format(new Date(challenge.proposedDate), "PPP")}
                {challenge.proposedTime && ` at ${challenge.proposedTime}`}
                {challenge.matchDurationMinutes && (
                  <span className="text-xs ml-1">
                    ({challenge.matchDurationMinutes} min)
                  </span>
                )}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-amber-700 dark:text-amber-300 italic">
                <Calendar className="h-4 w-4" />
                Date TBD
              </p>
            )}
            <p className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-medium">
              <MapPin className="h-4 w-4" />
              {challenge.proposedLocation}
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <Alert
        variant="default"
        className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
      >
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Once accepted, the match will be scheduled with their proposed
          details. Both teams will be notified.
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
          Go Back
        </Button>
        <Button
          onClick={handleAccept}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accept Counter-Proposal
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
