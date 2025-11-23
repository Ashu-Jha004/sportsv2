"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Zap,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Dumbbell,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type StrengthPowerInstructionsProps = {
  onProceed: () => void;
};

export function StrengthPowerInstructions({
  onProceed,
}: StrengthPowerInstructionsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Strength & Power Assessment
          </h2>
        </div>
        <p className="text-muted-foreground">
          Measure functional strength using bodyweight and basic equipment.
          These tests evaluate explosive power, maximal strength, and muscular
          endurance.
        </p>
      </div>

      {/* Equipment Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Dumbbell className="h-5 w-5 text-primary" />
            Equipment Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">
                  Force Plate or Jump Mat
                </p>
                <p className="text-sm text-muted-foreground">
                  For measuring jump height and ground contact time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">
                  Barbell & Weight Plates
                </p>
                <p className="text-sm text-muted-foreground">
                  For loaded jumps, deadlifts, and hip thrusts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">Pull-up Bar</p>
                <p className="text-sm text-muted-foreground">
                  For pull-up and weighted pull-up tests
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">Stopwatch</p>
                <p className="text-sm text-muted-foreground">
                  For timing plank holds and timed tests
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">Measuring Tape</p>
                <p className="text-sm text-muted-foreground">
                  For measuring standing reach and jump reach
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">
                  Velocity Tracker (Optional)
                </p>
                <p className="text-sm text-muted-foreground">
                  For measuring bar velocity in strength tests
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Jump Tests */}
            <div className="flex gap-4">
              <Badge
                variant="secondary"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                1
              </Badge>
              <div>
                <h4 className="font-semibold text-foreground">Jump Tests</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Countermovement Jump, Loaded Squat Jump, Depth Jump
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong className="text-foreground">Measures:</strong>{" "}
                  Explosive lower body power, reactive strength
                </p>
              </div>
            </div>

            {/* Upper Body Power */}
            <div className="flex gap-4">
              <Badge
                variant="secondary"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                2
              </Badge>
              <div>
                <h4 className="font-semibold text-foreground">
                  Upper Body Power
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ballistic Bench Press, Ballistic Push-ups, Standard Push-ups
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong className="text-foreground">Measures:</strong> Upper
                  body explosive power and endurance
                </p>
              </div>
            </div>

            {/* Lower Body Strength */}
            <div className="flex gap-4">
              <Badge
                variant="secondary"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                3
              </Badge>
              <div>
                <h4 className="font-semibold text-foreground">
                  Lower Body Strength
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deadlift Velocity, Barbell Hip Thrust
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong className="text-foreground">Measures:</strong> Maximal
                  strength and force production
                </p>
              </div>
            </div>

            {/* Upper Body Strength */}
            <div className="flex gap-4">
              <Badge
                variant="secondary"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                4
              </Badge>
              <div>
                <h4 className="font-semibold text-foreground">
                  Upper Body Strength
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Weighted Pull-ups, Barbell Row
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong className="text-foreground">Measures:</strong> Pulling
                  strength and back development
                </p>
              </div>
            </div>

            {/* Core & Endurance */}
            <div className="flex gap-4">
              <Badge
                variant="secondary"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                5
              </Badge>
              <div>
                <h4 className="font-semibold text-foreground">
                  Core & Endurance
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Plank Hold, Pull-ups (bodyweight)
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong className="text-foreground">Measures:</strong> Core
                  stability and relative strength endurance
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Testing Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Perform a thorough warm-up (5-10 minutes dynamic stretching +
                sport-specific movements)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Allow 2-3 attempts per test and record the best performance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Start with bodyweight tests, then progress to loaded variations
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Rest 2-3 minutes between maximal efforts, 1-2 minutes between
                submaximal attempts
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Ensure proper form and technique before measuring performance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Tests not completed should be left blank - they're all optional
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tips & Best Practices</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>Not all tests required:</strong> Focus on tests most
                relevant to the athlete's sport
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>Multiple attempts:</strong> Record all attempts to track
                consistency and fatigue
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>Load progression:</strong> Start with bodyweight (0 kg
                load), then add external load gradually
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>Safety first:</strong> Use spotters for loaded movements
                and ensure proper technique
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>Multi-day testing:</strong> Use "Save Draft" to split
                testing across multiple sessions
              </span>
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Proceed Button */}
      <div className="flex justify-end">
        <Button onClick={onProceed} size="lg" className="gap-2">
          Proceed to Assessment Form
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
