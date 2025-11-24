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
import { FiveZeroFiveTestForm } from "./speed-tests/FiveZeroFiveTestForm";
import { TTestForm } from "./speed-tests/TTestForm";
import { IllinoisAgilityForm } from "./speed-tests/IllinoisAgilityForm";
import { VisualReactionSpeedForm } from "./speed-tests/VisualReactionSpeedForm";
import { LongJumpForm } from "./speed-tests/LongJumpForm";
import { ReactiveAgilityTTestForm } from "./speed-tests/ReactiveAgilityTTestForm";
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
    fiveZeroFive: boolean;
    tTest: boolean;
    illinoisAgility: boolean;
    visualReactionSpeed: boolean;
    longJump: boolean;
    reactiveAgility: boolean;
    standingLongJump: boolean;
  }>({
    tenMeterSprint: !!speedAndAgility.Ten_Meter_Sprint,
    fortyMeterDash: !!speedAndAgility.Fourty_Meter_Dash,
    fiveZeroFive: !!speedAndAgility.Five_0_Five_Agility_Test,
    tTest: !!speedAndAgility.T_Test,
    illinoisAgility: !!speedAndAgility.Illinois_Agility_Test,
    visualReactionSpeed: !!speedAndAgility.Visual_Reaction_Speed_Drill,
    longJump: !!speedAndAgility.Long_Jump,
    reactiveAgility: !!speedAndAgility.Reactive_Agility_T_Test,
    standingLongJump: !!speedAndAgility.StandingLongJump,
  });

  const handleTestSave = (testName: keyof typeof completion, data: any) => {
    updateSpeedTest(
      testName === "tenMeterSprint" ? "Ten_Meter_Sprint" : "",
      testName === "fortyMeterDash" ? "Fourty_Meter_Dash" : "",
      testName === "tTest" ? "T_Test" : "",
      testName === "fiveZeroFive" ? "Five_0_Five_Agility_Test" : "",
      testName === "illinoisAgility" ? "Illinois_Agility" : "",
      testName === "longJump" ? "Long_Jump" : "",
      testName === "visualReactionSpeed" ? "Visual_Reaction_Speed" : "",

      data
    );
    setCompletion((prev) => ({ ...prev, [testName]: true }));
    setOpenItems((prev) =>
      prev.filter(
        (item) =>
          item !== (testName === "tenMeterSprint" ? "Ten_Meter_Sprint" : "")
      )
    );
  };

  const completedCount = Object.values(completion).filter(Boolean).length;
  const totalTests = Object.keys(completion).length;

  const handleSubmit = () => {
    // Example: Calculate and save scores here (TODO: implement score calculation)
    updateSpeedScores({
      sprintSpeed: 80, // Placeholder
      acceleration: 70, // Placeholder
      agility: 75, // Placeholder
      reactionTime: 85, // Placeholder
    });

    markStepComplete(6); // Step 6 is Speed & Agility
    onComplete();
  };

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

        {/* 5-0-5 Test */}
        <AccordionItem
          value="Five_0_Five_Agility_Test"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.fiveZeroFive ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  5-0-5 Agility Test
                </p>
                <p className="text-xs text-muted-foreground">
                  Change of direction speed test
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <FiveZeroFiveTestForm
              initialData={
                speedAndAgility.Five_0_Five_Agility_Test || undefined
              }
              onSave={(data) => {
                updateSpeedTest("Five_0_Five_Agility_Test", data);
                setCompletion((prev) => ({ ...prev, fiveZeroFive: true }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "Five_0_Five_Agility_Test")
                );
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* T-Test */}
        <AccordionItem value="T_Test" className="rounded-lg border bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.tTest ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">T-Test</p>
                <p className="text-xs text-muted-foreground">
                  Multidirectional agility test
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <TTestForm
              initialData={speedAndAgility.T_Test || undefined}
              onSave={(data) => {
                updateSpeedTest("T_Test", data);
                setCompletion((prev) => ({ ...prev, tTest: true }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "T_Test")
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

        {/* Long Jump */}
        <AccordionItem value="Long_Jump" className="rounded-lg border bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              {completion.longJump ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="font-semibold text-foreground">Long Jump</p>
                <p className="text-xs text-muted-foreground">
                  Horizontal explosive power test
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Optional
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <LongJumpForm
              initialData={speedAndAgility.Long_Jump || undefined}
              onSave={(data) => {
                updateSpeedTest("Long_Jump", data);
                setCompletion((prev) => ({ ...prev, longJump: true }));
                setOpenItems((prev) =>
                  prev.filter((item) => item !== "Long_Jump")
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
