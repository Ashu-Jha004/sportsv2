"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  Circle,
  FileText,
  Activity,
  Zap,
  Heart,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  WIZARD_STEPS,
  type WizardStepType,
} from "@/stores/statsWizard/statsWizardStore";

type StepsIndicatorProps = {
  currentStep: number;
  completedSteps: number[];
  visitedSteps: number[];
  onStepClick: (step: number) => void;
  className?: string;
};

// Icon mapping for different step types
const getStepIcon = (stepId: number, stepType: WizardStepType) => {
  const iconClass = "h-4 w-4";

  // Instructions steps
  if (stepType === "instruction") {
    return <FileText className={iconClass} />;
  }

  // Form steps - map to assessment category
  if (stepId === 2) return <Activity className={iconClass} />; // Basic Measurements
  if (stepId === 4) return <Zap className={iconClass} />; // Strength & Power
  if (stepId === 6) return <Zap className={iconClass} />; // Speed & Agility
  if (stepId === 8) return <Heart className={iconClass} />; // Stamina & Recovery
  if (stepId === 9) return <AlertCircle className={iconClass} />; // Injuries
  if (stepId === 10) return <ClipboardCheck className={iconClass} />; // Review

  return <Circle className={iconClass} />;
};

// Get step status
type StepStatus = "completed" | "current" | "upcoming" | "visited";

const getStepStatus = (
  stepId: number,
  currentStep: number,
  completedSteps: number[],
  visitedSteps: number[]
): StepStatus => {
  if (completedSteps.includes(stepId)) return "completed";
  if (stepId === currentStep) return "current";
  if (visitedSteps.includes(stepId)) return "visited";
  return "upcoming";
};

export function StepsIndicator({
  currentStep,
  completedSteps,
  visitedSteps,
  onStepClick,
  className,
}: StepsIndicatorProps) {
  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const totalFormSteps = WIZARD_STEPS.filter(
      (s) => s.type !== "instruction"
    ).length;
    return Math.round((completedSteps.length / totalFormSteps) * 100);
  }, [completedSteps.length]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Evaluation Progress
          </h3>
          <p className="text-xs text-muted-foreground">
            Step {currentStep} of {WIZARD_STEPS.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {progressPercentage}%
            </p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps Grid */}
      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {WIZARD_STEPS.map((step) => {
            const status = getStepStatus(
              step.id,
              currentStep,
              completedSteps,
              visitedSteps
            );
            const isClickable =
              visitedSteps.includes(step.id) || status === "completed";

            return (
              <Tooltip key={step.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "relative flex h-12 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 p-2 transition-all",
                      // Completed
                      status === "completed" &&
                        "border-emerald-500 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400",
                      // Current
                      status === "current" &&
                        "border-primary bg-primary/10 text-primary shadow-lg ring-2 ring-primary/20 hover:bg-primary/20",
                      // Visited but not completed
                      status === "visited" &&
                        "border-amber-500 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400",
                      // Upcoming
                      status === "upcoming" &&
                        "border-muted-foreground/20 bg-muted/30 text-muted-foreground hover:bg-muted",
                      // Disabled styles
                      !isClickable && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {/* Step Icon/Number */}
                    <div className="relative flex items-center justify-center">
                      {status === "completed" ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center">
                          {getStepIcon(step.id, step.type)}
                        </div>
                      )}
                    </div>

                    {/* Step Number */}
                    <span className="text-[10px] font-semibold leading-none">
                      {step.id}
                    </span>

                    {/* Current Step Pulse Effect */}
                    {status === "current" && (
                      <span className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[200px] text-center"
                >
                  <p className="text-xs font-semibold">{step.name}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {status === "completed" && "✓ Completed"}
                    {status === "current" && "← Current Step"}
                    {status === "visited" && "In Progress"}
                    {status === "upcoming" && "Not Started"}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Steps Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 p-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-500/10" />
          <span className="text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-primary bg-primary/10" />
          <span className="text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-500/10" />
          <span className="text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/20 bg-muted/30" />
          <span className="text-muted-foreground">Not Started</span>
        </div>
      </div>
    </div>
  );
}
