"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import { useReceivedChallengeStore } from "@/stores/challenges/recevied/received-challenge-store";
import { handleChallengeAction } from "@/actions/challenges/received/received-challenge-actions";
import { toast } from "sonner";

export function DeleteChallengeDialog() {
  const queryClient = useQueryClient();
  const { selectedMatchId, selectedChallenge, closeActionDialog } =
    useReceivedChallengeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const challenge = selectedChallenge;

  const handleDelete = useCallback(async () => {
    if (!selectedMatchId) return;

    try {
      setIsSubmitting(true);
      console.log(
        "🗑️ [DeleteChallengeDialog] Deleting challenge:",
        selectedMatchId
      );

      const result = await handleChallengeAction({
        matchId: selectedMatchId,
        action: "DELETE",
      });

      if (result.success) {
        toast("Challenge Deleted");

        queryClient.invalidateQueries({ queryKey: ["received-challenges"] });

        closeActionDialog();
      } else {
        toast("Failed to Delete");
      }
    } catch (error) {
      console.error(
        "❌ [DeleteChallengeDialog] Error deleting challenge:",
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
      {/* Warning Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-semibold mb-1">This action cannot be undone</p>
          <p className="text-sm">
            The challenge will be permanently removed from your list. The
            challenger team will not be notified.
          </p>
        </AlertDescription>
      </Alert>

      {/* Challenger Team */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
        <Avatar className="h-16 w-16 border-2 border-border">
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

      {/* Info */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <p className="mb-2">Consider these alternatives before deleting:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Use "Reject" to formally decline with a reason</li>
            <li>Use "Negotiate" to propose different match details</li>
            <li>Delete is best for spam or invalid challenges</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Confirmation */}
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <p className="text-sm font-medium text-center">
          Are you sure you want to delete this challenge?
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
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isSubmitting}
          variant="destructive"
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Challenge
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
