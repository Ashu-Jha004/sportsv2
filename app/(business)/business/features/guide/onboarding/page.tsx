import React from "react";
import GuideOnboardingWizard from "./components/guide/onboarding/GuideOnboardingWizard";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
const guideOnboarding = async () => {
  const { userId }: any = await auth();
  // 1. Find athlete by Clerk user id
  try {
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    // If no athlete profile yet, push them to athlete onboarding first
    if (!athlete) {
      redirect("/onboarding");
    }

    // 2. Check if a guide record already exists for this athlete
    const guide = await prisma.guide.findUnique({
      where: { userId: athlete.id },
      select: { id: true, status: true },
    });

    // 3. If guide exists, skip onboarding and go to dashboard
    if (guide) {
      if (guide.status === "pending_review") {
        redirect("/business/features/guide/dashboard");
      }

      // approved or any other status → main dashboard
      redirect("/business/features/guide/dashboard");
    }
  } catch (error) {
    alert(error);
    console.log(error);
  }

  return (
    <div>
      <GuideOnboardingWizard />
    </div>
  );
};

export default guideOnboarding;
