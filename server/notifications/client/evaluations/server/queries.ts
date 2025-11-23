// src/server/evaluations/server/queries.ts
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { PhysicalEvaluationRequestDetailsDto } from "@/types/notifications/evaluations/types";

export async function fetchEvaluationRequestDetailsServer(
  requestId: string
): Promise<PhysicalEvaluationRequestDetailsDto> {
  const { userId } = await auth();
  if (!userId) {
    const err: any = new Error("UNAUTHENTICATED");
    err.code = "AUTH_UNAUTHENTICATED";
    throw err;
  }

  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!athlete) {
    const err: any = new Error("ATHLETE_NOT_FOUND");
    err.code = "ATHLETE_NOT_FOUND";
    throw err;
  }

  const req = await prisma.physicalEvaluationRequest.findUnique({
    where: { id: requestId },
    include: {
      athlete: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
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

  if (!req) {
    const err: any = new Error("REQUEST_NOT_FOUND");
    err.code = "REQUEST_NOT_FOUND";
    throw err;
  }

  // Permission: athlete who owns request OR guide who owns it
  if (req.athleteId !== athlete.id && req.guide.userId !== athlete.id) {
    const err: any = new Error("FORBIDDEN");
    err.code = "FORBIDDEN";
    throw err;
  }

  const guideUser = req.guide.user;
  const guideFullName =
    (guideUser.firstName || guideUser.lastName
      ? `${guideUser.firstName ?? ""} ${guideUser.lastName ?? ""}`.trim()
      : "") ||
    guideUser.username ||
    "Guide";

  return {
    id: req.id,
    status: req.status,
    messageFromAthlete: req.message ?? null,
    messageFromGuide: req.MessageFromguide ?? null,
    scheduledDate: req.scheduledDate ? req.scheduledDate.toISOString() : null,
    scheduledTime: req.scheduledTime,
    location: req.location ?? null,
    equipment: req.equipment ?? [],
    otp: req.OTP ?? null,
    athlete: {
      id: req.athlete.id,
      username: req.athlete.username,
      firstName: req.athlete.firstName,
      lastName: req.athlete.lastName,
    },
    guide: {
      id: req.guide.id,
      username: guideUser.username,
      fullName: guideFullName,
    },
  };
}
