"use client";

import { useState } from "react";
import { useAssociateStore } from "@/stores/associate/associate-store";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WorkEmailStep } from "./form-steps/WorkEmailStep";
import { CoverLetterStep } from "./form-steps/CoverLetterStep";
import { SportsExpertiseStep } from "./form-steps/SportsExpertiseStep";
import { ExperienceStep } from "./form-steps/ExperienceStep";
import { LocationStep } from "./form-steps/LocationStep";
import { ResumeUploadStep } from "./form-steps/ResumeUploadStep";
import { ReviewStep } from "./form-steps/ReviewStep";

const STEPS = [
  { id: 0, title: "Work Email", component: WorkEmailStep },
  { id: 1, title: "Cover Letter", component: CoverLetterStep },
  { id: 2, title: "Sports Expertise", component: SportsExpertiseStep },
  { id: 3, title: "Experience", component: ExperienceStep },
  { id: 4, title: "Location", component: LocationStep },
  { id: 5, title: "Resume", component: ResumeUploadStep },
  { id: 6, title: "Review & Submit", component: ReviewStep },
];

export function AssociateApplicationForm() {
  const { currentStep, setCurrentStep } = useAssociateStore();
  const [canProceed, setCanProceed] = useState(false);

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setCanProceed(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Become an Associate
          </h1>
          <p className="text-gray-600">
            Complete the application to join as a guide/moderator
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {STEPS[currentStep].title}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="mb-8 hidden md:block">
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>
                <span className="text-xs mt-2 text-center max-w-80px">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8 mb-6">
          <CurrentStepComponent onValidationChange={setCanProceed} />
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : null}
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Need help? Contact us at support@sparta.com
        </p>
      </div>
    </div>
  );
}
