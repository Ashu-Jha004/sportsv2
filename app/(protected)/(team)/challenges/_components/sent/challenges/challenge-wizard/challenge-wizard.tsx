"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useChallengeStore } from "@/stores/challenges/challenge-store";
import { Step1Confirm } from "./step-1-confirm";
import { Step2MatchDetails } from "./step-2-match-details";
import { Step3Participants } from "./step-3-participants";
import { Step4Review } from "./step-4-review";
import { getTeamMembersForChallenge } from "@/actions/challenges/send/challenge-actions";

const STEP_TITLES = {
  1: "Confirm Challenge",
  2: "Match Details",
  3: "Select Participants",
  4: "Review & Send",
};

export function ChallengeWizard() {
  const { isWizardOpen, closeWizard, wizardData, setParticipants } =
    useChallengeStore();

  // Fetch team members when wizard opens on step 3
  useEffect(() => {
    const fetchMembers = async () => {
      if (
        isWizardOpen &&
        wizardData?.currentStep === 3 &&
        wizardData.selectedParticipants.length === 0
      ) {
        try {
          console.log("🔍 [ChallengeWizard] Fetching team members...");
          const members = await getTeamMembersForChallenge();
          setParticipants(members);
          console.log(
            "✅ [ChallengeWizard] Team members loaded:",
            members.length
          );
        } catch (error) {
          console.error(
            "❌ [ChallengeWizard] Failed to fetch team members:",
            error
          );
        }
      }
    };

    fetchMembers();
  }, [
    isWizardOpen,
    wizardData?.currentStep,
    wizardData?.selectedParticipants.length,
    setParticipants,
  ]);

  if (!wizardData) return null;

  const currentStep = wizardData.currentStep;
  const progress = (currentStep / 4) * 100;

  return (
    <Dialog open={isWizardOpen} onOpenChange={closeWizard}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {STEP_TITLES[currentStep]}
          </DialogTitle>
          <div className="pt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of 4
            </p>
          </div>
        </DialogHeader>

        {/* Wizard Steps */}
        <div className="py-6">
          {currentStep === 1 && <Step1Confirm />}
          {currentStep === 2 && <Step2MatchDetails />}
          {currentStep === 3 && <Step3Participants />}
          {currentStep === 4 && <Step4Review />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
