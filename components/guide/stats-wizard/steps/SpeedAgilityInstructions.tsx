"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Zap,
  AlertCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SpeedAgilityInstructionsProps = {
  onProceed: () => void;
};

export function SpeedAgilityInstructions({
  onProceed,
}: SpeedAgilityInstructionsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Speed & Agility Assessment
          </h2>
        </div>
        <p className="text-muted-foreground">
          Test an athlete’s sprint speed, acceleration, and agility using field
          drills under standardized conditions.
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">
                  Timing Gates or Stopwatch
                </p>
                <p className="text-sm text-muted-foreground">
                  For measuring sprint times and drill completion.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">Cones</p>
                <p className="text-sm text-muted-foreground">
                  For marking drill distances and directional points.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">
                  Flat and Clear Field
                </p>
                <p className="text-sm text-muted-foreground">
                  To perform sprints and agility drills safely and accurately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drills Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Drills Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
            <li>
              <strong>10 Meter Sprint:</strong> Measures acceleration off the
              line.
            </li>
            <li>
              <strong>40 Meter Dash:</strong> Measures maximum sprint speed
              endurance.
            </li>
            <li>
              <strong>Repeated Sprint Ability:</strong> Multiple sprints with
              short recovery, measures speed endurance.
            </li>
            <li>
              <strong>5-0-5 Agility Test:</strong> Measures change of direction
              speed.
            </li>
            <li>
              <strong>T-Test:</strong> Measures multidirectional agility.
            </li>
            <li>
              <strong>Illinois Agility Test:</strong> Tests agility with rapid
              turns and shuffles.
            </li>
            <li>
              <strong>Visual Reaction Speed Drill:</strong> Tests reaction times
              to visual cues.
            </li>
            <li>
              <strong>Long Jump:</strong> Tests explosive horizontal power.
            </li>
            <li>
              <strong>Reactive Agility T Test:</strong> Adds decision-making to
              T-Test.
            </li>
            <li>
              <strong>Standing Long Jump:</strong> Measures explosive leg power.
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
          <ul className="list-disc space-y-2 text-sm text-muted-foreground pl-5">
            <li>Use standardized warm-up before testing.</li>
            <li>
              Perform 2 to 3 trials per drill and record best time/distance.
            </li>
            <li>Record any failed or mis-timed trials separately.</li>
            <li>Use automated timing devices for accuracy where available.</li>
            <li>Ensure athlete safety and proper supervision at all times.</li>
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
