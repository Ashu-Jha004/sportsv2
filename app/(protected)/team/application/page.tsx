// app/team/application/page.tsx
"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeamApplicationStep1 } from "../components/team/application/TeamApplicationStep1";
import { TeamApplicationStep2 } from "../components/team/application/TeamApplicationStep2";
import { TeamApplicationStep3 } from "../components/team/application/TeamApplicationStep3";
import { TeamApplicationStepper } from "../components/team/application/TeamApplicationStepper";
import { useTeamApplicationStore } from "@/stores/team/creation/use-team-application-store";
import { checkExistingTeamOwnership } from "../lib/actions/team-application.actions";

export default function TeamApplicationPage() {
  const router = useRouter();
  const { currentStep, resetForm } = useTeamApplicationStore();

  // Check if athlete already owns a team
  const { data: ownershipCheck, isLoading: checkingOwnership } = useQuery({
    queryKey: ["team-ownership-check"],
    queryFn: async () => {
      const result = await checkExistingTeamOwnership();
      if (!result.success) {
        console.error("[OWNERSHIP_CHECK_ERROR]", result.error);
        toast.error(result.error);
        return null;
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });

  // Redirect if already owns a team
  useEffect(() => {
    if (ownershipCheck?.hasTeam && ownershipCheck.teamId) {
      console.log(
        "[REDIRECT] Athlete already owns team:",
        ownershipCheck.teamId
      );
      toast.info("You already own a team. Redirecting...");
      router.push(`/team/${ownershipCheck.teamId}`);
    }
  }, [ownershipCheck, router]);

  // Render current step
  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <TeamApplicationStep1 />;
      case 2:
        return <TeamApplicationStep2 />;
      case 3:
        return <TeamApplicationStep3 />;
      default:
        return <TeamApplicationStep1 />;
    }
  }, [currentStep]);

  if (checkingOwnership) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-1 border-b border-slate-100 pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            Create Your Team
          </CardTitle>
          <CardDescription className="text-slate-600">
            Submit your application for guide approval. All fields are saved
            automatically.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <TeamApplicationStepper currentStep={currentStep} totalSteps={3} />
          <div className="mt-8">{renderStep}</div>
        </CardContent>
      </Card>
    </div>
  );
}
