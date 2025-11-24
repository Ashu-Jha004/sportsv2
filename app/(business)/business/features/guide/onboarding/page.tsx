import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import GuideOnboardingWizard from "./components/guide/onboarding/GuideOnboardingWizard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Guide Onboarding Page
 * Handles routing logic for guide registration flow
 * - Ensures athlete profile exists before guide onboarding
 * - Redirects existing guides to dashboard
 * - Shows onboarding wizard for new guides
 */
export default async function GuideOnboardingPage() {
  // 1. Authenticate user
  const { userId } = await auth();

  // Edge case: No authenticated user (should not happen with middleware protection)
  if (!userId) {
    redirect("/sign-in");
  }

  let athlete = null;
  let guide = null;

  try {
    // 2. Find athlete profile
    athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    // 3. If athlete exists, check for guide record
    if (athlete) {
      guide = await prisma.guide.findUnique({
        where: { userId: athlete.id },
        select: { id: true, status: true },
      });
    }
  } catch (error) {
    // Log error in production (use proper logging service)
    if (process.env.NODE_ENV === "production") {
      console.error("[GuideOnboarding] Database error:", {
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error("[GuideOnboarding] Database error:", error);
    }

    // Show error UI instead of crashing
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Load Profile</AlertTitle>
          <AlertDescription>
            We encountered an error loading your profile. Please try again or
            contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 4. Handle redirect logic OUTSIDE try-catch
  // Edge case: No athlete profile exists - redirect to athlete onboarding
  if (!athlete) {
    redirect("/onboarding");
  }

  // Edge case: Guide already exists - redirect to dashboard
  if (guide) {
    // All guide statuses go to dashboard (pending_review, approved, rejected, etc.)
    redirect("/business/features/guide/dashboard");
  }

  // 5. New guide - show onboarding wizard
  return (
    <div className="min-h-screen">
      <GuideOnboardingWizard />
    </div>
  );
}

// Metadata for SEO and page info
export const metadata = {
  title: "Guide Registration | Sparta",
  description: "Complete your guide profile registration",
};

// Opt out of static rendering since this uses auth
export const dynamic = "force-dynamic";
