"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Circle, Zap } from "lucide-react";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";
import { TenMeterSprintForm } from "./speed-tests/TenMeterSprintForm";
import { FortyMeterDashForm } from "./speed-tests/FortyMeterDashForm";
import { IllinoisAgilityForm } from "./speed-tests/IllinoisAgilityForm";
import { VisualReactionSpeedForm } from "./speed-tests/VisualReactionSpeedForm";
import { ReactiveAgilityTTestForm } from "./speed-tests/ReactiveAgilityTTestForm";
import { RepeatedSprintAbilityForm } from "./speed-tests/RepeatedSprintAbility";
import { StandingLongJumpForm } from "./speed-tests/StandingLongJumpForm";
export function SpeedAndAgilityForm({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const speedAndAgility = useStatsWizardStore((s) => s.speedAndAgility);
  const updateSpeedTest = useStatsWizardStore((s) => s.updateSpeedTest);
  const updateSpeedScores = useStatsWizardStore((s) => s.updateSpeedScores);
  const markStepComplete = useStatsWizardStore((s) => s.markStepComplete);

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [completion, setCompletion] = useState<{
    tenMeterSprint: boolean;
    fortyMeterDash: boolean;
    repeatedSprintAbility: boolean;
    illinoisAgility: boolean;
    visualReactionSpeed: boolean;
    reactiveAgility: boolean;
    standingLongJump: boolean;
  }>({
    tenMeterSprint: !!speedAndAgility.Ten_Meter_Sprint,
    fortyMeterDash: !!speedAndAgility.Fourty_Meter_Dash,
    repeatedSprintAbility: !!speedAndAgility.Repeated_Sprint_Ability,
    illinoisAgility: !!speedAndAgility.Illinois_Agility_Test,
    visualReactionSpeed: !!speedAndAgility.Visual_Reaction_Speed_Drill,
    reactiveAgility: !!speedAndAgility.Reactive_Agility_T_Test,
    standingLongJump: !!speedAndAgility.Standing_Long_Jump, // ✅ FIXED: Was StandingLongJump
  });

  // ✅ ADDED: Mapping helper to convert camelCase to store keys
  const testNameMapping: Record<keyof typeof completion, string> = {
    tenMeterSprint: "Ten_Meter_Sprint",
    fortyMeterDash: "Fourty_Meter_Dash",
    repeatedSprintAbility: "Repeated_Sprint_Ability",
    illinoisAgility: "Illinois_Agility_Test",
    visualReactionSpeed: "Visual_Reaction_Speed_Drill",
    reactiveAgility: "Reactive_Agility_T_Test",
    standingLongJump: "Standing_Long_Jump",
  };

  // ✅ FIXED: Proper function signature and logic
  const handleTestSave = (testName: keyof typeof completion, data: any) => {
    const storeTestName = testNameMapping[testName];

    // Call updateSpeedTest with correct parameters
    updateSpeedTest(storeTestName, data);

    // Mark test as completed
    setCompletion((prev) => ({ ...prev, [testName]: true }));

    // Remove from open items using the correct store name
    setOpenItems((prev) => prev.filter((item) => item !== storeTestName));

    if (process.env.NODE_ENV === "development") {
      console.debug(`[SpeedAgilityForm] Saved test: ${storeTestName}`, data);
    }
  };

  const completedCount = Object.values(completion).filter(Boolean).length;
  const totalTests = Object.keys(completion).length;

  // ✅ IMPROVED: Calculate real scores based on completed tests
  const handleSubmit = () => {
    // Calculate actual scores from test data
    const scores = calculateSpeedScores({
      tenMeterSprint: speedAndAgility.Ten_Meter_Sprint,
      fortyMeterDash: speedAndAgility.Fourty_Meter_Dash,
      repeatedSprintAbility: speedAndAgility.Repeated_Sprint_Ability,
      illinoisAgility: speedAndAgility.Illinois_Agility_Test,
      visualReactionSpeed: speedAndAgility.Visual_Reaction_Speed_Drill,
      reactiveAgility: speedAndAgility.Reactive_Agility_T_Test,
      standingLongJump: speedAndAgility.Standing_Long_Jump,
    });

    updateSpeedScores(scores);
    markStepComplete(6); // Step 6 is Speed & Agility
    onComplete();

    if (process.env.NODE_ENV === "development") {
      console.info("[SpeedAgilityForm] Submitted with scores:", scores);
    }
  };

  // ✅ ADDED: Score calculation function
  function calculateSpeedScores(tests: any): {
    sprintSpeed: number;
    acceleration: number;
    agility: number;
    reactionTime: number;
  } {
    let sprintSpeed = 0;
    let acceleration = 0;
    let agility = 0;
    let reactionTime = 0;
    let sprintCount = 0;
    let agilityCount = 0;

    // Sprint Speed: 10m and 40m sprints
    if (tests.tenMeterSprint?.calculated?.avgTime) {
      const time = tests.tenMeterSprint.calculated.avgTime;
      // Lower time = better score (invert and scale to 0-100)
      sprintSpeed += Math.max(0, 100 - (time - 1.5) * 50);
      sprintCount++;
    }

    if (tests.fortyMeterDash?.calculated?.avgTime) {
      const time = tests.fortyMeterDash.calculated.avgTime;
      sprintSpeed += Math.max(0, 100 - (time - 5.0) * 20);
      sprintCount++;
    }

    // Acceleration: 10m sprint primarily
    if (tests.tenMeterSprint?.calculated?.avgTime) {
      const time = tests.tenMeterSprint.calculated.avgTime;
      acceleration = Math.max(0, 100 - (time - 1.5) * 50);
    }

    // Agility: Illinois, Reactive T-Test
    if (tests.illinoisAgility?.calculated?.avgTime) {
      const time = tests.illinoisAgility.calculated.avgTime;
      agility += Math.max(0, 100 - (time - 15) * 5);
      agilityCount++;
    }

    if (tests.reactiveAgility?.calculated?.avgTime) {
      const time = tests.reactiveAgility.calculated.avgTime;
      agility += Math.max(0, 100 - (time - 10) * 8);
      agilityCount++;
    }

    // Reaction Time: Visual Reaction Speed Drill
    if (tests.visualReactionSpeed?.calculated?.avgTime) {
      const time = tests.visualReactionSpeed.calculated.avgTime;
      reactionTime = Math.max(0, 100 - (time - 0.2) * 200);
    }

    // Calculate averages
    const finalSprintSpeed =
      sprintCount > 0 ? Math.round(sprintSpeed / sprintCount) : 0;
    const finalAgility =
      agilityCount > 0 ? Math.round(agility / agilityCount) : 0;
    const finalAcceleration = Math.round(acceleration);
    const finalReactionTime = Math.round(reactionTime);

    return {
      sprintSpeed: Math.min(100, Math.max(0, finalSprintSpeed)),
      acceleration: Math.min(100, Math.max(0, finalAcceleration)),
      agility: Math.min(100, Math.max(0, finalAgility)),
      reactionTime: Math.min(100, Math.max(0, finalReactionTime)),
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Speed & Agility Assessment
        </h2>
        <Badge variant="secondary" className="text-sm">
          {completedCount} / {totalTests} Tests
        </Badge>
      </div>

      <Alert variant="default">
        <Zap className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Complete the following speed and agility tests. Data entered here will
          help assess athlete’s performance.
        </AlertDescription>
      </Alert>

      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="space-y-2"
      >
        <AccordionItem
          value="Ten_Meter_Sprint"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4">
            <div className="flex items-center gap-3">
              {completion.tenMeterSprint ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-semibold text-foreground">
                10 Meter Sprint
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <TenMeterSprintForm
              initialData={speedAndAgility.Ten_Meter_Sprint || undefined}
              onSave={(data) => handleTestSave("tenMeterSprint", data)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* 40 Meter Dash */}
        <AccordionItem
          value="Fourty_Meter_Dash"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.fortyMeterDash ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">40 Meter Dash</p>
                <p className="text-xs text-muted-foreground">
                  Maximum sprint speed test over 40 meters
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <FortyMeterDashForm
              initialData={speedAndAgility.Fourty_Meter_Dash || undefined}
              onSave={(data) => {
                updateSpeedTest("Fourty_Meter_Dash", data);
                setCompletion((prev) => ({ ...prev, fortyMeterDash: true }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "Fourty_Meter_Dash")
                );
              }}
            />
          </AccordionContent>
        </AccordionItem>
        {/* Illinois Agility Test */}
        <AccordionItem
          value="Illinois_Agility_Test"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.illinoisAgility ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Illinois Agility Test
                </p>
                <p className="text-xs text-muted-foreground">
                  Rapid multi-directional agility test
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <IllinoisAgilityForm
              initialData={speedAndAgility.Illinois_Agility_Test || undefined}
              onSave={(data) => {
                updateSpeedTest("Illinois_Agility_Test", data);
                setCompletion((prev) => ({ ...prev, illinoisAgility: true }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "Illinois_Agility_Test")
                );
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Visual Reaction Speed Drill */}
        <AccordionItem
          value="Visual_Reaction_Speed_Drill"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.visualReactionSpeed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Visual Reaction Speed Drill
                </p>
                <p className="text-xs text-muted-foreground">
                  Measures athlete's visual reaction time
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <VisualReactionSpeedForm
              initialData={
                speedAndAgility.Visual_Reaction_Speed_Drill || undefined
              }
              onSave={(data) => {
                updateSpeedTest("Visual_Reaction_Speed_Drill", data);
                setCompletion((prev) => ({
                  ...prev,
                  visualReactionSpeed: true,
                }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "Visual_Reaction_Speed_Drill")
                );
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Reactive Agility T-Test */}
        <AccordionItem
          value="Reactive_Agility_T_Test"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.reactiveAgility ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Reactive Agility T-Test
                </p>
                <p className="text-xs text-muted-foreground">
                  Measures decision-making agility with reaction component
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <ReactiveAgilityTTestForm
              initialData={speedAndAgility.Reactive_Agility_T_Test || undefined}
              onSave={(data) => {
                updateSpeedTest("Reactive_Agility_T_Test", data);
                setCompletion((prev) => ({ ...prev, reactiveAgility: true }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "Reactive_Agility_T_Test")
                );
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Standing Long Jump */}
        <AccordionItem
          value="Standing_Long_Jump"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.standingLongJump ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Standing Long Jump
                </p>
                <p className="text-xs text-muted-foreground">
                  Explosive horizontal power test
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <StandingLongJumpForm
              initialData={speedAndAgility.Standing_Long_Jump || undefined}
              onSave={(data) => {
                updateSpeedTest("Standing_Long_Jump", data);
                setCompletion((prev) => ({ ...prev, standingLongJump: true }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "Standing_Long_Jump")
                );
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Add additional speed/agility tests in similar AccordionItems here */}
        <AccordionItem
          value="Repeated_Sprint_Ability"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.reactiveAgility ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Repeated Sprint Ability
                </p>
                <p className="text-xs text-muted-foreground">
                  Measures decision-making agility with reaction component
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <RepeatedSprintAbilityForm
              initialData={speedAndAgility.Repeated_Sprint_Ability || undefined}
              onSave={(data) => {
                updateSpeedTest("Repeated_Sprint_Ability", data);
                setCompletion((prev) => ({
                  ...prev,
                  repeatedSprintAbility: true,
                }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "Repeated_Sprint_Ability")
                );
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={completedCount === 0} // Require at least one test
          className="gap-2"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
