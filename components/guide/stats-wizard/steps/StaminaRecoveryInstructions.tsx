"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heart, Activity, ArrowRight, ChevronRight } from "lucide-react";

type StaminaRecoveryInstructionsProps = {
  onProceed: () => void;
};

export function StaminaRecoveryInstructions({
  onProceed,
}: StaminaRecoveryInstructionsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Stamina & Recovery Assessment
          </h2>
        </div>
        <p className="text-muted-foreground">
          Assess cardiovascular fitness, endurance, recovery, and flexibility
          using validated protocols and monitoring tools.
        </p>
      </div>

      {/* Equipment Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Equipment Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Heart rate monitor or pulse oximeter</li>
            <li>Stopwatch or timing device</li>
            <li>Treadmill or field for Beep Test</li>
            <li>Markers/cones for test distances</li>
            <li>Measuring tape or goniometer for flexibility tests</li>
          </ul>
        </CardContent>
      </Card>

      {/* Testing Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Protocols</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Beep Test:</strong> Progressive shuttle run to measure
              cardiovascular endurance.
            </li>
            <li>
              <strong>Yo-Yo Intermittent Recovery Test:</strong> Measures
              ability to repeatedly perform high-intensity aerobic work.
            </li>
            <li>
              <strong>Cooper Test:</strong> 12-minute run for aerobic fitness
              estimation.
            </li>
            <li>
              <strong>Heart Rate Metrics:</strong> Resting, peak, variability,
              recovery rates monitoring.
            </li>
            <li>
              <strong>Flexibility Tests:</strong> Sit and reach, active straight
              leg raise, shoulder rotation, knee to wall.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* General Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Testing Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Perform warm-up before endurance tests.</li>
            <li>
              Note environmental factors affecting performance (temperature,
              humidity).
            </li>
            <li>
              Ensure accurate device calibration and athlete familiarization.
            </li>
            <li>Record multiple measurements and average where applicable.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Proceed Button */}
      <div className="flex justify-end">
        <Button onClick={onProceed} size="lg" className="gap-2">
          Proceed to Assessment Form
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
