// components/team/application/TeamApplicationStepper.tsx
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ["Team Info", "Location", "Choose Guide"];

export function TeamApplicationStepper({
  currentStep,
  totalSteps,
}: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-200",
                    isCompleted &&
                      "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent && "border-blue-500 bg-blue-50 text-blue-600",
                    !isCompleted &&
                      !isCurrent &&
                      "border-slate-300 bg-white text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCurrent && "text-blue-600",
                    isCompleted && "text-emerald-600",
                    !isCompleted && !isCurrent && "text-slate-400"
                  )}
                >
                  {STEP_LABELS[index]}
                </span>
              </div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-all duration-200",
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
