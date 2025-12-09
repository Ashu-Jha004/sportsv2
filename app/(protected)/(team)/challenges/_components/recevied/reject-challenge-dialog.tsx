"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useReceivedChallengeStore } from "@/stores/challenges/recevied/received-challenge-store";
import { handleChallengeAction } from "@/actions/challenges/received/received-challenge-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RejectChallengeDialog() {
  const queryClient = useQueryClient();
  const { selectedMatchId, selectedChallenge, closeActionDialog } =
    useReceivedChallengeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  const challenge = selectedChallenge;

  const handleReject = useCallback(async () => {
    if (!selectedMatchId) return;

    if (rejectionReason.length > 500) {
      setError("Reason is too long (max 500 characters)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      console.log(
        "❌ [RejectChallengeDialog] Rejecting challenge:",
        selectedMatchId
      );

      const result = await handleChallengeAction({
        matchId: selectedMatchId,
        action: "REJECT",
        rejectionReason: rejectionReason.trim() || undefined,
      });

      if (result.success) {
        toast("Challenge Rejected");

        queryClient.invalidateQueries({ queryKey: ["received-challenges"] });

        closeActionDialog();
      } else {
        toast("Failed to Reject");
      }
    } catch (error) {
      console.error(
        "❌ [RejectChallengeDialog] Error rejecting challenge:",
        error
      );
      toast("Error");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMatchId, rejectionReason, toast, queryClient, closeActionDialog]);

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
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You are about to reject this challenge. The challenger team will be
          notified. This action cannot be undone.
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

      {/* Rejection Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">
          Reason for Rejection{" "}
          <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="reason"
          value={rejectionReason}
          onChange={(e) => {
            setRejectionReason(e.target.value);
            setError("");
          }}
          className={cn(error && "border-destructive")}
          placeholder="Let them know why you're declining (e.g., schedule conflict, venue preference, etc.)"
          rows={4}
          maxLength={500}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          {rejectionReason.length}/500 characters
        </p>
      </div>

      {/* Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          If you're not rejecting outright, consider using the "Negotiate"
          option to propose different match details instead.
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
          onClick={handleReject}
          disabled={isSubmitting}
          variant="destructive"
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Rejecting...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Reject Challenge
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
