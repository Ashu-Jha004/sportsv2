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
import { CheckCircle2, Circle, Heart } from "lucide-react";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";

import { BeepTestForm } from "./stamina-tests/BeepTestForm";
import { YoYoTestForm } from "./stamina-tests/YoYoTestForm";
import { CooperTestForm } from "./stamina-tests/CooperTestForm";
import { SitAndReachTestForm } from "./SitAndReachForm";

export function StaminaAndRecoveryForm({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const staminaAndRecovery = useStatsWizardStore((s) => s.staminaAndRecovery);
  const updateStaminaTest = useStatsWizardStore((s) => s.updateStaminaTest);
  const updateStaminaScores = useStatsWizardStore((s) => s.updateStaminaScores);
  const markStepComplete = useStatsWizardStore((s) => s.markStepComplete);

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [completion, setCompletion] = useState<Record<string, boolean>>({
    beepTest: !!staminaAndRecovery.Beep_Test,
    yoYoTest: !!staminaAndRecovery.Yo_Yo_Test,
    cooperTest: !!staminaAndRecovery.Cooper_Test,
    sitAndReach: !!staminaAndRecovery.Sit_And_Reach,
  });

  const testNameMap: Record<string, keyof typeof staminaAndRecovery> = {
    beepTest: "Beep_Test",
    yoYoTest: "Yo_Yo_Test",
    cooperTest: "Cooper_Test",
    sitAndReach: "Sit_And_Reach",
  };

  const handleTestSave = (testKey: string, data: any) => {
    const storeKey = testNameMap[testKey];
    if (!storeKey) {
      console.warn(`Unknown test key: ${testKey}`);
      return;
    }
    updateStaminaTest(storeKey, data);
    setCompletion((prev) => ({ ...prev, [testKey]: true }));
    setOpenItems((prev) => prev.filter((item) => item !== storeKey));
  };

  const completedCount = Object.values(completion).filter(Boolean).length;
  const totalTests = Object.keys(completion).length;

  const handleSubmit = () => {
    // TODO: Update with your real scoring logic
    updateStaminaScores({
      cardiovascularFitness: 80,
      endurance: 75,
      recoveryEfficiency: 70,
      flexibility: 85,
    });
    markStepComplete(7);
    onComplete();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Stamina & Recovery Assessment
        </h2>
        <Badge variant="secondary" className="text-sm">
          {completedCount} / {totalTests} Tests
        </Badge>
      </div>

      <Alert variant="default">
        <Heart className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Complete the following stamina and recovery tests.
        </AlertDescription>
      </Alert>

      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="space-y-2"
      >
        <AccordionItem value="Beep_Test" className="rounded-lg border bg-card">
          <AccordionTrigger className="px-6 py-4">
            <div className="flex items-center gap-3">
              {completion.beepTest ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-semibold text-foreground">Beep Test</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <BeepTestForm
              initialData={staminaAndRecovery.Beep_Test || undefined}
              onSave={(data) => handleTestSave("beepTest", data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="Yo_Yo_Test" className="rounded-lg border bg-card">
          <AccordionTrigger className="px-6 py-4">
            <div className="flex items-center gap-3">
              {completion.yoYoTest ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-semibold text-foreground">
                Yo-Yo Intermittent Recovery Test
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <YoYoTestForm
              initialData={staminaAndRecovery.Yo_Yo_Test || undefined}
              onSave={(data) => handleTestSave("yoYoTest", data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="Cooper_Test"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4">
            <div className="flex items-center gap-3">
              {completion.cooperTest ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-semibold text-foreground">Cooper Test</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <CooperTestForm
              initialData={staminaAndRecovery.Cooper_Test || undefined}
              onSave={(data) => handleTestSave("cooperTest", data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="Sit_And_Reach"
          className="rounded-lg border bg-card"
        >
          <AccordionTrigger className="px-6 py-4">
            <div className="flex items-center gap-3">
              {completion.sitAndReach ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-semibold text-foreground">
                Sit and Reach Test
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <SitAndReachTestForm
              initialData={staminaAndRecovery.Sit_And_Reach || undefined}
              onSave={(data) => handleTestSave("sitAndReach", data)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={completedCount === 0}
          className="gap-2"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
