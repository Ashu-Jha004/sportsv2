"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";
import { handleSentChallengeAction } from "@/actions/challenges/negotition/sent/sent-challenge-actions";
import { toast } from "sonner";

export function CancelChallengeDialog() {
  const queryClient = useQueryClient();
  const { selectedMatchId, selectedChallenge, closeActionDialog } =
    useSentChallengeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const challenge = selectedChallenge;

  const handleCancel = useCallback(async () => {
    if (!selectedMatchId) return;

    try {
      setIsSubmitting(true);
      console.log(
        "🗑️ [CancelChallengeDialog] Cancelling challenge:",
        selectedMatchId
      );

      const result = await handleSentChallengeAction({
        matchId: selectedMatchId,
        action: "CANCEL",
      });

      if (result.success) {
        toast("Challenge Cancelled");

        queryClient.invalidateQueries({ queryKey: ["sent-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["received-challenges"] });

        closeActionDialog();
      } else {
        toast("Failed to Cancel");
      }
    } catch (error) {
      console.error(
        "❌ [CancelChallengeDialog] Error cancelling challenge:",
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
      {/* Warning Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-semibold mb-1">This action cannot be undone</p>
          <p className="text-sm">
            The challenge will be permanently removed. The opponent team will be
            notified that you've withdrawn your challenge.
          </p>
        </AlertDescription>
      </Alert>

      {/* Team */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
        <Avatar className="h-16 w-16 border-2 border-border">
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

      {/* Info */}
      {challenge.status === "SCHEDULED" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <p className="font-semibold mb-2">This match has been accepted!</p>
            <p>
              Cancelling now will disappoint the opponent. Consider rescheduling
              instead by contacting them directly.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {challenge.hasCounterProposal && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            The opponent has sent a counter-proposal. Are you sure you want to
            cancel instead of accepting or negotiating further?
          </AlertDescription>
        </Alert>
      )}

      {/* Confirmation */}
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <p className="text-sm font-medium text-center">
          Are you sure you want to cancel this challenge?
        </p>
      </div>

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
          onClick={handleCancel}
          disabled={isSubmitting}
          variant="destructive"
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cancelling...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Challenge
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
