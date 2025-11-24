"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Activity,
  Zap,
  Heart,
  ClipboardCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";
import { format } from "date-fns";
import { submitStatsEvaluation } from "@/app/(business)/business/features/guide/actions/stats/submitStatsEvaluation";

export function ReviewAndSubmit() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pull data from Zustand store
  const athlete = useStatsWizardStore((s) => s.athlete);
  const guide = useStatsWizardStore((s) => s.guide);
  const evaluation = useStatsWizardStore((s) => s.evaluation);
  const basicMeasurements = useStatsWizardStore((s) => s.basicMeasurements);
  const strengthAndPower = useStatsWizardStore((s) => s.strengthAndPower);
  const speedAndAgility = useStatsWizardStore((s) => s.speedAndAgility);
  const staminaAndRecovery = useStatsWizardStore((s) => s.staminaAndRecovery);
  const injuries = useStatsWizardStore((s) => s.injuries);
  const getCompletePayload = useStatsWizardStore((s) => s.getCompletePayload);
  const clearDraft = useStatsWizardStore((s) => s.clearDraft);

  if (!athlete || !guide || !evaluation) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Data Missing</AlertTitle>
        <AlertDescription>
          Required athlete, guide, or evaluation information is missing.
        </AlertDescription>
      </Alert>
    );
  }

  const canSubmit = !!basicMeasurements;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = getCompletePayload();

      const result = await submitStatsEvaluation({
        athleteClerkUserId: athlete.clerkUserId,
        guideId: guide.id,
        requestId: evaluation.requestId,
        payload: payload as any,
      });

      if (!result.success) {
        setError(result.error ?? "Submission failed");
        setIsSubmitting(false);
        return;
      }

      clearDraft();

      router.push("/business/features/guide/dashboard?submitted=true");
    } catch (e) {
      setError("Unexpected error during submission. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Review & Submit Evaluation</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Athlete Info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Name:</strong> {athlete.firstName} {athlete.lastName}
          </div>
          <div>
            <strong>Username:</strong> @{athlete.username}
          </div>
          <div>
            <strong>Sport:</strong> {athlete.primarySport ?? "N/A"}
          </div>
          <div>
            <strong>Rank/Class:</strong> {athlete.rank} / {athlete.class}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Evaluation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            Guide: <strong>{guide.name}</strong>
          </p>
          <p>
            Evaluation Date:{" "}
            <strong>
              {format(new Date(evaluation.evaluationDate), "PPP")}
            </strong>
          </p>
          {evaluation.scheduledDate && (
            <p>
              Scheduled Date:{" "}
              <strong>
                {format(new Date(evaluation.scheduledDate), "PPP")}
              </strong>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" /> Assessment
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span>Basic Physical Measurements</span>
            {basicMeasurements ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
          </div>

          <div className="flex justify-between items-center">
            <span>Strength & Power Tests Completed</span>
            <Badge variant="secondary" className="text-sm">
              {Object.values(strengthAndPower).filter(Boolean).length -
                3 /* exclude scores etc */ || 0}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>Speed & Agility Tests Completed</span>
            <Badge variant="secondary" className="text-sm">
              {Object.values(speedAndAgility).filter(Boolean).length - 1 || 0}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>Stamina & Recovery Tests Completed</span>
            <Badge variant="secondary" className="text-sm">
              {Object.values(staminaAndRecovery).filter(Boolean).length - 1 ||
                0}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>Injury Records</span>
            <Badge
              variant={injuries.length > 0 ? "default" : "outline"}
              className="text-sm"
            >
              {injuries.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!canSubmit && (
        <Alert variant="destructive">
          <AlertTitle>Cannot Submit</AlertTitle>
          <AlertDescription>
            Basic physical measurements are required to submit the evaluation.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Submission Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          size="lg"
          className="gap-2"
        >
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
          Submit Evaluation
        </Button>
      </div>
    </div>
  );
}
