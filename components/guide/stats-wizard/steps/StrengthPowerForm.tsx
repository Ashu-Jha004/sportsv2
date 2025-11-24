"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Circle, Info, Loader2 } from "lucide-react";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";
import { CountermovementJumpForm } from "./strength-tests/CountermovementJumpForm";
import { calculateStrengthScore } from "@/lib/calculations/stats-calculations";
import { PushUpsTestForm } from "./strength-tests/PushUpsTestForm";
import { PullUpsTestForm } from "./strength-tests/PullUpsTestForm";
import { PlankHoldForm } from "./strength-tests/PlankHoldForm";
import { DeadliftVelocityForm } from "./strength-tests/DeadliftVelocityForm";
import { BarbellHipThrustForm } from "./strength-tests/BarbellHipThrustForm";
import { WeightedPullUpsForm } from "./strength-tests/WeightedPullUpsForm";
import { BarbellRowForm } from "./strength-tests/BarbellRowForm";
type StrengthPowerFormProps = {
  onComplete: () => void;
};

// Track which tests have been completed
type TestCompletionStatus = {
  cmj: boolean;
  loadedJump: boolean;
  depthJump: boolean;
  ballisticBench: boolean;
  pushUp: boolean;
  ballisticPushUp: boolean;
  deadlift: boolean;
  hipThrust: boolean;
  pullUp: boolean;
  barbellRow: boolean;
  weightedPullUps: boolean;
  plank: boolean;
  bodyweightPullUps: boolean;
};

export function StrengthPowerForm({ onComplete }: StrengthPowerFormProps) {
  const basicMeasurements = useStatsWizardStore((s) => s.basicMeasurements);
  const strengthAndPower = useStatsWizardStore((s) => s.strengthAndPower);
  const updateStrengthTest = useStatsWizardStore((s) => s.updateStrengthTest);
  const updateStrengthScores = useStatsWizardStore(
    (s) => s.updateStrengthScores
  );
  const markStepComplete = useStatsWizardStore((s) => s.markStepComplete);

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track test completion
  const [completion, setCompletion] = useState<TestCompletionStatus>({
    cmj: !!strengthAndPower.Countermovement_Jump,
    loadedJump: !!strengthAndPower.Loaded_Squat_Jump,
    depthJump: !!strengthAndPower.Depth_Jump,
    ballisticBench: !!strengthAndPower.Ballistic_Bench_Press,
    pushUp: !!strengthAndPower.Push_Up,
    ballisticPushUp: !!strengthAndPower.Ballistic_Push_Up,
    deadlift: !!strengthAndPower.Deadlift_Velocity,
    hipThrust: !!strengthAndPower.Barbell_Hip_Thrust,
    pullUp: !!strengthAndPower.Weighted_Pull_up,
    barbellRow: !!strengthAndPower.Barbell_Row,
    plank: !!strengthAndPower.Plank_Hold,
    weightedPullUps: !!strengthAndPower.Weighted_Pull_up,
    bodyweightPullUps: !!strengthAndPower.pullUps,
  });

  const bodyWeight = basicMeasurements?.weight || 70; // Default if missing

  // Count completed tests
  const completedCount = Object.values(completion).filter(Boolean).length;
  const totalTests = Object.keys(completion).length;

  // Handle test save
  const handleTestSave = (
    testName: keyof typeof strengthAndPower,
    completionKey: keyof TestCompletionStatus,
    data: any
  ) => {
    updateStrengthTest(testName, data);
    setCompletion((prev) => ({ ...prev, [completionKey]: true }));

    // Close the accordion item
    setOpenItems((prev) => prev.filter((item) => item !== testName));

    if (process.env.NODE_ENV === "development") {
      console.debug(`[StrengthPowerForm] Saved`, data);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Calculate aggregate scores
      const scores = calculateStrengthScore({
        cmjPeakPower:
          strengthAndPower.Countermovement_Jump?.bestAttempt?.peakPower,
        loadedJumpPower:
          strengthAndPower.Loaded_Squat_Jump?.bestAttempt?.peakPower,
        benchPressPower:
          strengthAndPower.Ballistic_Bench_Press?.bestAttempt?.peakPower,
        deadlift1RM: strengthAndPower.Deadlift_Velocity?.oneRepMax,
        pullUps: strengthAndPower.pullUps?.repsCompleted,
      });

      // Save scores
      updateStrengthScores(scores);

      // Mark step complete
      markStepComplete(4);

      if (process.env.NODE_ENV === "development") {
        console.info("[StrengthPowerForm] Completed with scores:", scores);
      }

      // Proceed to next step
      onComplete();
    } catch (error) {
      console.error("[StrengthPowerForm] Error submitting:", error);
      alert("Failed to save strength assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Strength & Power Assessment
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete the relevant tests for this athlete. Not all tests are
            required.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {completedCount} / {totalTests} Tests
        </Badge>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Each test can have multiple attempts. The system will automatically
          select the best performance. Tests marked as optional can be skipped
          if not applicable.
        </AlertDescription>
      </Alert>

      {/* Tests Accordion */}
      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="space-y-2"
      >
        {/* 1. Countermovement Jump */}
        <AccordionItem
          value="Countermovement_Jump"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.cmj ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Countermovement Jump
                </p>
                <p className="text-xs text-muted-foreground">
                  Explosive lower body power
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <CountermovementJumpForm
              bodyWeight={bodyWeight}
              initialData={strengthAndPower.Countermovement_Jump || undefined}
              onSave={(data: any) =>
                handleTestSave("Countermovement_Jump", "cmj", data)
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* 2. Loaded Squat Jump - Placeholder */}
        <AccordionItem
          value="Loaded_Squat_Jump"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.loadedJump ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Loaded Squat Jump
                </p>
                <p className="text-xs text-muted-foreground">
                  Power output with external load
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Form component coming in next iteration
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Depth Jump - Placeholder */}
        <AccordionItem value="Depth_Jump" className="rounded-lg border bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.depthJump ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">Depth Jump</p>
                <p className="text-xs text-muted-foreground">
                  Reactive strength index
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Form component coming in next iteration
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Ballistic Bench Press - Placeholder */}
        <AccordionItem
          value="Ballistic_Bench_Press"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.ballisticBench ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Ballistic Bench Press
                </p>
                <p className="text-xs text-muted-foreground">
                  Upper body explosive power
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Form component coming in next iteration
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Standard Push-Ups - Placeholder */}
        <AccordionItem value="Push_Up" className="rounded-lg border bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.pushUp ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Standard Push-Ups
                </p>
                <p className="text-xs text-muted-foreground">
                  Upper body endurance
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Form component coming in next iteration
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Add more test accordions here... */}

        {/* Push-Ups Test */}
        <AccordionItem value="Push_Up" className="rounded-lg border bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.pushUp ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">Push-Ups Test</p>
                <p className="text-xs text-muted-foreground">
                  Upper body endurance - bodyweight and weighted push-ups
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6">
            <PushUpsTestForm
              initialData={strengthAndPower.Push_Up || undefined}
              onSave={(data) => handleTestSave("Push_Up", "pushUp", data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="Weighted_Pull_up"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.pullUp ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Weighted Pull-Ups Test
                </p>
                <p className="text-xs text-muted-foreground">
                  Reps completed with weight (optional)
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <PullUpsTestForm
              initialData={strengthAndPower.Weighted_Pull_up || undefined}
              onSave={(data) =>
                handleTestSave("Weighted_Pull_up", "pullUp", data)
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* Plank Hold Test */}
        <AccordionItem value="Plank_Hold" className="rounded-lg border bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.plank ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">Plank Hold Test</p>
                <p className="text-xs text-muted-foreground">
                  Core endurance - bodyweight and weighted durations
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <PlankHoldForm
              initialData={strengthAndPower.Plank_Hold || undefined}
              onSave={(data) => handleTestSave("Plank_Hold", "plank", data)}
            />
          </AccordionContent>
        </AccordionItem>
        {/* Deadlift Velocity Test */}
        <AccordionItem
          value="Deadlift_Velocity"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.deadlift ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Deadlift Velocity Test
                </p>
                <p className="text-xs text-muted-foreground">
                  Measures 1RM and peak lifting velocity.
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <DeadliftVelocityForm
              initialData={strengthAndPower.Deadlift_Velocity || undefined}
              onSave={(data) =>
                handleTestSave("Deadlift_Velocity", "deadlift", data)
              }
            />
          </AccordionContent>
        </AccordionItem>
        {/* Barbell Hip Thrust Test */}
        <AccordionItem
          value="Barbell_Hip_Thrust"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.hipThrust ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Barbell Hip Thrust Test
                </p>
                <p className="text-xs text-muted-foreground">
                  Lower body strength test with weight and reps.
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <BarbellHipThrustForm
              initialData={strengthAndPower.Barbell_Hip_Thrust || undefined}
              onSave={(data) =>
                handleTestSave("Barbell_Hip_Thrust", "hipThrust", data)
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* Weighted Pull-Ups Test */}
        <AccordionItem
          value="Weighted_Pull_up"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.weightedPullUps ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Weighted Pull-Ups Test
                </p>
                <p className="text-xs text-muted-foreground">
                  Upper body pulling strength with added weight.
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <WeightedPullUpsForm
              initialData={strengthAndPower.Weighted_Pull_up || undefined}
              onSave={(data) =>
                handleTestSave("Weighted_Pull_up", "weightedPullUps", data)
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="Barbell_Row"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.barbellRow ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Barbell Row Test
                </p>
                <p className="text-xs text-muted-foreground">
                  Upper back strength test with load and reps.
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <BarbellRowForm
              initialData={strengthAndPower.Barbell_Row || undefined}
              onSave={(data) =>
                handleTestSave("Barbell_Row", "barbellRow", data)
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* For brevity, showing pattern. You would add all 12 tests similarly */}
      </Accordion>

      {/* Completion Alert */}
      {completedCount > 0 && (
        <Alert className="border-emerald-500/20 bg-emerald-500/5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-sm">
            You've completed {completedCount} out of {totalTests} tests. You can
            proceed when ready or complete more tests.
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={isSubmitting || completedCount === 0}
          className="gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {completedCount === 0
            ? "Complete at least one test"
            : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
