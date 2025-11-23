"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Ruler,
  Scale,
  Activity,
  AlertCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type BasicMeasurementsInstructionsProps = {
  onProceed: () => void;
};

export function BasicMeasurementsInstructions({
  onProceed,
}: BasicMeasurementsInstructionsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Basic Physical Measurements
          </h2>
        </div>
        <p className="text-muted-foreground">
          Essential body composition metrics using everyday equipment. These
          measurements form the foundation for all subsequent calculations.
        </p>
      </div>

      {/* Equipment Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ruler className="h-5 w-5 text-primary" />
            Equipment Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">Measuring Tape</p>
                <p className="text-sm text-muted-foreground">
                  At least 2 meters, flexible and non-stretchable
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">Digital Scale</p>
                <p className="text-sm text-muted-foreground">
                  Bathroom scale (digital preferred for accuracy)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">
                  Body Fat Measurement Tool
                </p>
                <p className="text-sm text-muted-foreground">
                  Calipers or bioelectrical impedance scale
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-foreground">Height Marker</p>
                <p className="text-sm text-muted-foreground">
                  Flat book or ruler for marking wall
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5 text-primary" />
            How to Measure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Height */}
            <div className="flex gap-4">
              <Badge
                variant="secondary"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                1
              </Badge>
              <div>
                <h4 className="font-semibold text-foreground">Height</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Remove shoes and stand against a flat wall</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Keep heels, buttocks, and head touching the wall
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Look straight ahead with chin parallel to floor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Mark the highest point of the head and measure from floor
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Weight */}
            <div className="flex gap-4">
              <Badge
                variant="secondary"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                2
              </Badge>
              <div>
                <h4 className="font-semibold text-foreground">Weight</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Weigh in minimal clothing (ideally morning)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Place scale on hard, flat surface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Stand still and distribute weight evenly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Record measurement after reading stabilizes</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Body Fat */}
            <div className="flex gap-4">
              <Badge
                variant="secondary"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                3
              </Badge>
              <div>
                <h4 className="font-semibold text-foreground">
                  Body Fat Percentage
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      For calipers: measure at 3-7 sites (chest, abdomen, thigh,
                      tricep)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      For bioelectrical impedance: follow device instructions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Ensure athlete is properly hydrated (not dehydrated)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Take multiple readings and average for accuracy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
                Take all measurements <strong>2-3 times</strong> and use the
                average for accuracy
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Record all measurements in <strong>metric units</strong> (cm,
                kg, %)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Ensure athlete is properly hydrated for body fat measurement
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Measure height without shoes and weight in minimal clothing
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Best time for measurements: morning, before exercise, after
                using bathroom
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
