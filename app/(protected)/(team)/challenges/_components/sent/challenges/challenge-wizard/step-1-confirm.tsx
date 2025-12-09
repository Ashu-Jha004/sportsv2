"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, MapPin, Trophy } from "lucide-react";
import { useChallengeStore } from "@/stores/challenges/challenge-store";
import { useMemo } from "react";

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

export function Step1Confirm() {
  const { wizardData, nextStep, closeWizard } = useChallengeStore();

  const teamInitials = useMemo(() => {
    if (!wizardData) return "";
    return wizardData.targetTeamName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [wizardData?.targetTeamName]);

  const sportLabel = useMemo(() => {
    if (!wizardData) return "";
    return SPORT_LABELS[wizardData.targetTeamSport] || wizardData.targetTeamSport;
  }, [wizardData?.targetTeamSport]);

  if (!wizardData) return null;

  const handleContinue = () => {
    try {
      console.log("✅ [Step1Confirm] User confirmed challenge");
      nextStep();
    } catch (error) {
      console.error("❌ [Step1Confirm] Navigation error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Display */}
      <div className="flex flex-col items-center text-center space-y-4 py-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage
              src={wizardData.targetTeamLogo || undefined}
              alt={wizardData.targetTeamName}
            />
            <AvatarFallback className="text-2xl font-bold bg-primary/10">
              {teamInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
            <Swords className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-1">{wizardData.targetTeamName}</h3>
          <Badge variant="secondary" className="text-sm">
            {sportLabel}
          </Badge>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-3">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Challenge Confirmation
        </h4>
        <p className="text-muted-foreground">
          You are about to send a match challenge to{" "}
          <span className="font-semibold text-foreground">
            {wizardData.targetTeamName}
          </span>
          . You'll be able to propose a date, time, and location for the match.
        </p>
        <div className="pt-3 border-t space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>The opposing team can accept, reject, or negotiate the match details</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>You can cancel the challenge before it's accepted</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>All team members will be notified</span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={closeWizard} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleContinue} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
