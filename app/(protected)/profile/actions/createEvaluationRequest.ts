"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { RequestStatus } from "@prisma/client";

export async function createEvaluationRequestAction(input: any) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }

  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: userId },
  });

  if (!athlete) {
    throw new Error("ATHLETE_NOT_FOUND");
  }

  const guide = await prisma.guide.findUnique({
    where: { id: input.guideId },
    include: { user: true },
  });

  if (!guide) {
    throw new Error("GUIDE_NOT_FOUND");
  }

  // Throttle: only one active request per athlete-guide pair
  const existing = await prisma.physicalEvaluationRequest.findFirst({
    where: {
      athleteId: athlete.id,
      guideId: guide.id,
      status: {
        in: [
          RequestStatus.PENDING,
          RequestStatus.ACCEPTED,
          RequestStatus.REJECTED,
        ],
      },
    },
  });

  if (existing) {
    throw new Error("REQUEST_ALREADY_EXISTS");
  }

  const request = await prisma.physicalEvaluationRequest.create({
    data: {
      athleteId: athlete.id,
      guideId: guide.id,
      status: RequestStatus.PENDING,
      message: input.message ?? null,
      scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
      scheduledTime: input.scheduledTime ?? null,
      location: null,
    },
  });

  await prisma.notification.create({
    data: {
      athleteId: guide.userId,
      actorId: athlete.id,
      type: "STAT_UPDATE_REQUEST",
      title: "New physical evaluation request",
      message: `${athlete.firstName ?? ""} ${
        athlete.lastName ?? ""
      } requested a physical evaluation.`,
      data: {
        requestId: request.id,
        athlete: {
          id: athlete.id,
          username: athlete.username,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          gender: athlete.gender,
          profileImage: athlete.profileImage,
          primarySport: athlete.primarySport,
          secondarySport: athlete.secondarySport,
          rank: athlete.rank,
          class: athlete.class,
        },
      },
    },
  });

  return {
    requestId: request.id,
    status: request.status as any,
  };
}
