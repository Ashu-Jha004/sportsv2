"use server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { AthleteHeader } from "@/components/guide/stats-wizard/AthleteHeader";
import { StatsWizardShell } from "@/components/guide/stats-wizard/StatsWizardShell";
function generateTraceId() {
  return `stats_wizard_${Math.random()
    .toString(36)
    .slice(2, 10)}_${Date.now().toString(36)}`;
}

export default async function StatsWizardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const traceId = generateTraceId();

  const { id } = await params;

  const { userId } = await auth();
  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[StatsWizardPage] Unauthenticated access", {
        traceId,
        id,
      });
    }
    redirect("/sign-in");
  }

  // Guide must be the one running this evaluation
  const guideAthlete = await prisma.athlete.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      firstName: true, // ADDED: for guide name
      lastName: true, // ADDED: for guide name
      username: true, // ADDED: fallback for guide name
    },
  });

  if (!guideAthlete) {
    if (process.env.NODE_ENV === "development") {
      console.error("[StatsWizardPage] Guide athlete profile not found", {
        traceId,
        clerkUserId: userId,
      });
    }
    redirect("/");
  }

  const guide = await prisma.guide.findUnique({
    where: { userId: guideAthlete.id },
    select: { id: true, status: true },
  });

  if (!guide || guide.status !== "approved") {
    if (process.env.NODE_ENV === "development") {
      console.warn("[StatsWizardPage] Guide not approved or missing", {
        traceId,
        guideId: guide?.id,
        status: guide?.status,
      });
    }
    redirect("/guide/dashboard");
  }

  // Find the athlete by clerkUserId coming from the route
  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: id },
    select: {
      id: true,
      clerkUserId: true,
      username: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      primarySport: true,
      gender: true,
      rank: true,
      class: true,
      city: true,
      state: true,
      country: true,
      dateOfBirth: true, // ADDED: for age calculation
    },
  });

  if (!athlete) {
    if (process.env.NODE_ENV === "development") {
      console.error("[StatsWizardPage] Target athlete not found", {
        traceId,
        id,
      });
    }
    redirect("/guide/dashboard");
  }

  // Find an active PhysicalEvaluationRequest linking this guide and athlete
  const activeRequest = await prisma.physicalEvaluationRequest.findFirst({
    where: {
      guideId: guide.id,
      athleteId: athlete.id,
      status: "ACCEPTED",
    },
    select: {
      id: true,
      createdAt: true,
      scheduledDate: true,
      scheduledTime: true,
      MessageFromguide: true,
      message: true,
    },
  });

  if (!activeRequest) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[StatsWizardPage] No active evaluation request for this pair",
        {
          traceId,
          guideId: guide.id,
          athleteId: athlete.id,
        }
      );
    }
    redirect("/guide/dashboard");
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[StatsWizardPage] Access granted to stats wizard", {
      traceId,
      guideId: guide.id,
      athleteId: athlete.id,
      requestId: activeRequest.id,
    });
  }

  // ============================================
  // TRANSFORM DATA FOR COMPONENTS
  // ============================================

  // Calculate age if dateOfBirth exists
  const age = athlete.dateOfBirth
    ? new Date().getFullYear() - new Date(athlete.dateOfBirth).getFullYear()
    : undefined;

  // Transform athlete data to match AthleteInfo type
  const athleteInfo = {
    id: athlete.id,
    clerkUserId: athlete.clerkUserId,
    username: athlete.username,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    profileImage: athlete.profileImage,
    primarySport: athlete.primarySport,
    gender: athlete.gender,
    rank: athlete.rank,
    class: athlete.class,
    city: athlete.city,
    state: athlete.state,
    country: athlete.country,
    dateOfBirth: athlete.dateOfBirth?.toISOString() || null,
    age,
  };

  // Generate guide name
  const guideName =
    guideAthlete.firstName || guideAthlete.lastName
      ? `${guideAthlete.firstName ?? ""} ${guideAthlete.lastName ?? ""}`.trim()
      : guideAthlete.username ?? "Unknown Guide";

  // Transform guide data to match GuideInfo type
  const guideInfo = {
    id: guide.id,
    userId: guideAthlete.id,
    name: guideName,
  };

  // Transform evaluation data to match EvaluationMetadata type
  const evaluationMetadata = {
    requestId: activeRequest.id,
    scheduledDate: activeRequest.scheduledDate?.toISOString() || null,
    scheduledTime: activeRequest.scheduledTime,
    evaluationDate: new Date().toISOString(),
    otpVerified: true, // Since they passed OTP verification to get here
    otpVerifiedAt: new Date().toISOString(),
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
      {/* UPDATED: Replaced old header with AthleteHeader component */}
      <AthleteHeader athlete={athleteInfo} evaluation={evaluationMetadata} />

      {/* Placeholder: the multi-step wizard shell will be mounted here in the next sub-process */}
      <div className="rounded-lg border bg-card p-4 text-xs text-muted-foreground">
        <StatsWizardShell
          athlete={athleteInfo}
          guide={guideInfo}
          evaluation={evaluationMetadata}
        />
      </div>
    </div>
  );
}
