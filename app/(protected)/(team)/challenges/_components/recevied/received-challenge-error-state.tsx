"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ReceivedChallengeErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ReceivedChallengeErrorState({
  error,
  onRetry,
}: ReceivedChallengeErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>

      <Alert variant="destructive" className="max-w-md mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Challenges</AlertTitle>
        <AlertDescription className="mt-2">
          {error || "An unexpected error occurred while fetching challenges."}
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    </div>
  );
}
