// app/actions/getMyEvaluationRequests.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getMyEvaluationRequestsAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });
  if (!athlete) throw new Error("ATHLETE_NOT_FOUND");

  const requests = await prisma.physicalEvaluationRequest.findMany({
    where: { athleteId: athlete.id },
    orderBy: { createdAt: "desc" },
    include: {
      guide: {
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return requests;
}
