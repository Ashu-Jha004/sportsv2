"use client";

import { useEffect } from "react";
import { StepsIndicator } from "./StepsIndicator";
import { DraftManager } from "./DraftManager"; // ADDED
import { BasicMeasurementsInstructions } from "./steps/BasicMeasurementsInstructions";
import { BasicMeasurementsForm } from "./steps/BasicMeasurementsForm";
import {
  useStatsWizardStore,
  WIZARD_STEPS,
} from "@/stores/statsWizard/statsWizardStore";
import type {
  AthleteInfo,
  GuideInfo,
  EvaluationMetadata,
} from "@/stores/statsWizard/statsWizardStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type StatsWizardShellProps = {
  athlete: AthleteInfo;
  guide: GuideInfo;
  evaluation: EvaluationMetadata;
};

export function StatsWizardShell({
  athlete,
  guide,
  evaluation,
}: StatsWizardShellProps) {
  // Zustand store
  const currentStep = useStatsWizardStore((s) => s.currentStep);
  const completedSteps = useStatsWizardStore((s) => s.completedSteps);
  const visitedSteps = useStatsWizardStore((s) => s.visitedSteps);
  const initializeWizard = useStatsWizardStore((s) => s.initializeWizard);
  const goToStep = useStatsWizardStore((s) => s.goToStep);
  const nextStep = useStatsWizardStore((s) => s.nextStep);
  const prevStep = useStatsWizardStore((s) => s.prevStep);
  const canProceedToNextStep = useStatsWizardStore(
    (s) => s.canProceedToNextStep
  );

  // Initialize wizard on mount
  useEffect(() => {
    initializeWizard(athlete, guide, evaluation);
  }, [athlete, guide, evaluation, initializeWizard]);

  // Get current step configuration
  const currentStepConfig = WIZARD_STEPS.find((s) => s.id === currentStep);

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicMeasurementsInstructions onProceed={nextStep} />;

      case 2:
        return <BasicMeasurementsForm onComplete={nextStep} />;

      case 3:
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <h3 className="text-lg font-semibold">
              Strength & Power Instructions
            </h3>
            <p className="text-sm text-muted-foreground">
              Coming in next phase
            </p>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <h3 className="text-lg font-semibold">
              Strength & Power Assessment
            </h3>
            <p className="text-sm text-muted-foreground">
              Coming in next phase
            </p>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Step {currentStep}: {currentStepConfig?.name || "Unknown Step"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This step content will be added in upcoming phases
              </p>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-xs">
                <p className="font-semibold">Debug Info:</p>
                <p>Current Step: {currentStep}</p>
                <p>Step Type: {currentStepConfig?.type}</p>
                <p>Completed Steps: [{completedSteps.join(", ")}]</p>
                <p>Visited Steps: [{visitedSteps.join(", ")}]</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ADDED: Header with Steps Indicator and Draft Manager */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <StepsIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            visitedSteps={visitedSteps}
            onStepClick={goToStep}
          />
        </div>

        {/* ADDED: Draft Manager */}
        <DraftManager className="sm:ml-4" />
      </div>

      {/* Wizard Content */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6 sm:p-8">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between rounded-lg border-t bg-muted/30 px-6 py-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {WIZARD_STEPS.length}
        </div>

        <Button
          onClick={nextStep}
          disabled={
            currentStep === WIZARD_STEPS.length ||
            (currentStepConfig?.type === "form" && !canProceedToNextStep())
          }
          className="gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
