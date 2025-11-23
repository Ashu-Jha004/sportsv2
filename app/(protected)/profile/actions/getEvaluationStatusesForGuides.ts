// app/actions/getEvaluationStatusesForGuides.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getEvaluationStatusesForGuides(guideIds: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });
  if (!athlete) throw new Error("ATHLETE_NOT_FOUND");

  const requests = await prisma.physicalEvaluationRequest.findMany({
    where: {
      athleteId: athlete.id,
      guideId: { in: guideIds },
    },
    select: {
      guideId: true,
      status: true,
    },
  });

  // collapse to a map guideId -> latest status
  const byGuide: Record<string, string> = {};
  for (const r of requests) {
    byGuide[r.guideId] = r.status;
  }

  return byGuide;
}
