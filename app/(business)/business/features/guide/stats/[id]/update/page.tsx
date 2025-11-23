// app/business/features/guide/stats/[clerkUserId]/update/page.tsx
"use server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

type StatsWizardPageProps = {
  params: { clerkUserId: string };
};

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
    select: { id: true },
  });

  if (!guideAthlete) {
    if (process.env.NODE_ENV === "development") {
      console.error("[StatsWizardPage] Guide athlete profile not found", {
        traceId,
        clerkUserId: userId,
      });
    }
    redirect("/"); // or a safer error page
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
      // optional: add time window conditions here later
      // evaluationCompletedAt: null, // if you add such a field
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

  // TODO: later we will load Stats + StrengthAndPower + SpeedAndAgility + StaminaAndRecovery here
  // and pass them into the client wizard shell as initial DTO props.

  if (process.env.NODE_ENV === "development") {
    console.info("[StatsWizardPage] Access granted to stats wizard", {
      traceId,
      guideId: guide.id,
      athleteId: athlete.id,
      requestId: activeRequest.id,
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-col gap-2 border-b pb-3">
        <h1 className="text-lg font-semibold">
          Stats update for{" "}
          {athlete.firstName || athlete.lastName
            ? `${athlete.firstName ?? ""} ${athlete.lastName ?? ""}`.trim()
            : athlete.username ?? "Unknown athlete"}
        </h1>
        <p className="text-xs text-muted-foreground">
          Guided evaluation wizard. Only available during an active evaluation
          for this athlete.
        </p>
      </header>

      {/* Placeholder: the multi-step wizard shell will be mounted here in the next sub-process */}
      <div className="rounded-lg border bg-card p-4 text-xs text-muted-foreground">
        Stats wizard shell coming next. Access is correctly guarded for now.
      </div>
    </div>
  );
}
