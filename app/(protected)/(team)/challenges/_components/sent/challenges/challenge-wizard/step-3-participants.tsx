"use client";

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Star, AlertCircle } from "lucide-react";
import { useChallengeStore } from "@/stores/challenges/challenge-store";
import { cn } from "@/lib/utils";

export function Step3Participants() {
  const { wizardData, toggleParticipant, toggleStarter, nextStep, prevStep } =
    useChallengeStore();

  const selectedCount = useMemo(() => {
    if (!wizardData) return 0;
    return wizardData.selectedParticipants.filter((p) => p.isSelected).length;
  }, [wizardData?.selectedParticipants]);

  const startersCount = useMemo(() => {
    if (!wizardData) return 0;
    return wizardData.selectedParticipants.filter(
      (p) => p.isSelected && p.isStarter
    ).length;
  }, [wizardData?.selectedParticipants]);

  const handleToggleParticipant = useCallback(
    (athleteId: string) => {
      try {
        console.log("🔄 [Step3Participants] Toggling participant:", athleteId);
        toggleParticipant(athleteId);
      } catch (error) {
        console.error("❌ [Step3Participants] Toggle participant error:", error);
      }
    },
    [toggleParticipant]
  );

  const handleToggleStarter = useCallback(
    (athleteId: string, isSelected: boolean) => {
      if (!isSelected) {
        console.warn("⚠️ [Step3Participants] Cannot set starter for unselected participant");
        return;
      }
      try {
        console.log("⭐ [Step3Participants] Toggling starter:", athleteId);
        toggleStarter(athleteId);
      } catch (error) {
        console.error("❌ [Step3Participants] Toggle starter error:", error);
      }
    },
    [toggleStarter]
  );

  const handleContinue = useCallback(() => {
    try {
      console.log("✅ [Step3Participants] Participants saved:", {
        total: wizardData?.selectedParticipants.length,
        selected: selectedCount,
        starters: startersCount,
      });
      nextStep();
    } catch (error) {
      console.error("❌ [Step3Participants] Navigation error:", error);
    }
  }, [selectedCount, startersCount, wizardData?.selectedParticipants.length, nextStep]);

  const handleSkip = useCallback(() => {
    try {
      console.log("⏭️ [Step3Participants] User skipped participant selection");
      nextStep();
    } catch (error) {
      console.error("❌ [Step3Participants] Skip error:", error);
    }
  }, [nextStep]);

  if (!wizardData) return null;

  const participants = wizardData.selectedParticipants;

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Select which team members will participate in this match. Mark key players
          as starters. This is optional and can be updated later.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold">{selectedCount}</div>
          <div className="text-xs text-muted-foreground">Selected</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold">{startersCount}</div>
          <div className="text-xs text-muted-foreground">Starters</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold">{participants.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Participants List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No team members found</p>
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.athleteId}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border-2 transition-colors",
                participant.isSelected
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/30 border-transparent"
              )}
            >
              {/* Select Checkbox */}
              <Checkbox
                checked={participant.isSelected}
                onCheckedChange={() => handleToggleParticipant(participant.athleteId)}
                aria-label={`Select ${participant.athleteName}`}
              />

              {/* Avatar & Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={participant.profileImage || undefined}
                    alt={participant.athleteName}
                  />
                  <AvatarFallback>
                    {participant.athleteName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{participant.athleteName}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {participant.role}
                  </Badge>
                </div>
              </div>

              {/* Starter Toggle */}
              <Button
                variant={participant.isStarter ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleToggleStarter(participant.athleteId, participant.isSelected)
                }
                disabled={!participant.isSelected}
                className={cn(
                  "gap-2",
                  participant.isStarter && "bg-amber-500 hover:bg-amber-600"
                )}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    participant.isStarter && "fill-current"
                  )}
                />
                {participant.isStarter ? "Starter" : "Set Starter"}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button variant="ghost" onClick={handleSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={handleContinue} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
