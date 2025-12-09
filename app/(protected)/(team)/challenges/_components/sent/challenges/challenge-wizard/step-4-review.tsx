"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Swords,
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { useChallengeStore } from "@/stores/challenges/challenge-store";
import { createChallenge } from "@/actions/challenges/send/challenge-actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function Step4Review() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { wizardData, prevStep, closeWizard, resetWizard, setSubmitting } =
    useChallengeStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user's team ID (from first participant's teamId)
  const userTeamId = useMemo(() => {
    // This should be fetched properly, but for now we'll get it from context
    // In production, you'd want to fetch this from the server or pass it through
    return ""; // Will be populated in the actual submission
  }, []);

  const selectedParticipants = useMemo(() => {
    if (!wizardData) return [];
    return wizardData.selectedParticipants.filter((p) => p.isSelected);
  }, [wizardData?.selectedParticipants]);

  const starters = useMemo(() => {
    return selectedParticipants.filter((p) => p.isStarter);
  }, [selectedParticipants]);

  const handleSubmit = useCallback(async () => {
    if (!wizardData) return;

    try {
      setIsSubmitting(true);
      setSubmitting(true);

      console.log("🚀 [Step4Review] Submitting challenge...");

      // Build proposed start datetime
      let proposedStart: Date | null = null;
      if (wizardData.proposedDate) {
        proposedStart = new Date(wizardData.proposedDate);
        if (wizardData.proposedTime) {
          const [hours, minutes] = wizardData.proposedTime.split(":");
          proposedStart.setHours(parseInt(hours), parseInt(minutes));
        }
      }

      // Get user's team ID from server
      // For now, we'll let the server action handle this
      const request = {
        challengerTeamId: "", // Server will fill this
        challengedTeamId: wizardData.targetTeamId,
        proposedStart,
        proposedEnd: null, // Server will calculate based on duration
        proposedLocation: wizardData.proposedLocation,
        proposedLatitude: wizardData.proposedLatitude,
        proposedLongitude: wizardData.proposedLongitude,
        matchLengthMinutes: wizardData.matchDurationMinutes,
        messageToOpponent: wizardData.messageToOpponent,
        participants: selectedParticipants.map((p) => ({
          athleteId: p.athleteId,
          isStarter: p.isStarter,
        })),
      };

      console.log("📤 [Step4Review] Challenge request:", request);

      const result = await createChallenge(request);

      if (result.success) {
        console.log(
          "✅ [Step4Review] Challenge sent successfully:",
          result.matchId
        );

        toast("Challenge sent successfully");

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["challenge-teams"] });

        // Close wizard and reset
        resetWizard();
        closeWizard();

        // Optional: Navigate to challenges management page
        // router.push(`/matches/${result.matchId}`);
      } else {
        console.error("❌ [Step4Review] Challenge failed:", result.error);

        toast("Failed to send Challenge!");
      }
    } catch (error) {
      console.error("❌ [Step4Review] Submission error:", error);

      toast("Code Error!");
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  }, [
    wizardData,
    selectedParticipants,
    toast,
    queryClient,
    closeWizard,
    resetWizard,
    setSubmitting,
  ]);

  if (!wizardData) return null;

  const teamInitials = wizardData.targetTeamName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Review Alert */}
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Review your challenge details before sending. The opposing team will
          be notified immediately.
        </AlertDescription>
      </Alert>

      {/* Target Team */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
          <AvatarImage
            src={wizardData.targetTeamLogo || undefined}
            alt={wizardData.targetTeamName}
          />
          <AvatarFallback className="text-lg font-bold">
            {teamInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Swords className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Challenging
            </span>
          </div>
          <h3 className="text-xl font-bold">{wizardData.targetTeamName}</h3>
        </div>
      </div>

      {/* Match Details */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Match Details
        </h4>

        {/* Date & Time */}
        {wizardData.proposedDate && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                {format(wizardData.proposedDate, "EEEE, MMMM d, yyyy")}
              </p>
              {wizardData.proposedTime && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {wizardData.proposedTime}
                </p>
              )}
            </div>
          </div>
        )}

        {!wizardData.proposedDate && (
          <div className="flex items-start gap-3 text-muted-foreground">
            <Calendar className="h-5 w-5 mt-0.5" />
            <p className="text-sm italic">Date and time to be decided</p>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{wizardData.proposedLocation}</p>
            {wizardData.matchDurationMinutes && (
              <p className="text-sm text-muted-foreground mt-1">
                Duration: {wizardData.matchDurationMinutes} minutes
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        {wizardData.messageToOpponent && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Your Message</p>
                <p className="text-sm text-muted-foreground italic">
                  "{wizardData.messageToOpponent}"
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Participants */}
      {selectedParticipants.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Users className="h-4 w-4" />
              Selected Participants ({selectedParticipants.length})
            </h4>

            {/* Starters */}
            {starters.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  Starters
                </p>
                <div className="space-y-2">
                  {starters.map((participant) => (
                    <div
                      key={participant.athleteId}
                      className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={participant.profileImage || undefined}
                          alt={participant.athleteName}
                        />
                        <AvatarFallback className="text-xs">
                          {participant.athleteName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {participant.athleteName}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {participant.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Participants */}
            {selectedParticipants.filter((p) => !p.isStarter).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Other Participants</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedParticipants
                    .filter((p) => !p.isStarter)
                    .map((participant) => (
                      <div
                        key={participant.athleteId}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={participant.profileImage || undefined}
                            alt={participant.athleteName}
                          />
                          <AvatarFallback className="text-xs">
                            {participant.athleteName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-xs">
                          {participant.athleteName}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Warning */}
      <Alert variant="default" className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          The opposing team can accept, reject, or propose different match
          details. You'll receive a notification when they respond.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Swords className="h-4 w-4 mr-2" />
              Send Challenge
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
