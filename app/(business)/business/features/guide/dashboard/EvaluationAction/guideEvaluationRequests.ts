// app/(guide)/dashboard/actions/guideEvaluationRequests.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { RequestStatus, NotificationType } from "@prisma/client";
import crypto from "crypto";

type GuideEvaluationRequestDTO = {
  id: string;
  status: RequestStatus;
  message: string | null;
  createdAt: Date;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  location: string | null;
  equipment: string[];
  otp: number | null;
  athlete: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    class: string;
    rank: string;
    profileImage: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  };
};

type UpdateStatusInput = {
  requestId: string;
  action: "ACCEPT" | "REJECT";
  // For ACCEPT
  messageFromGuide?: string | null;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  equipmentRaw?: string | null; // comma-separated, will be parsed to string[]
  location?: string | null;
};

export async function getGuideEvaluationRequestsAction(): Promise<
  | { success: true; data: GuideEvaluationRequestDTO[] }
  | { success: false; message: string; traceId?: string }
> {
  const traceId = `GUIDE_REQ_LIST_${Date.now()}`;

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getGuideEvaluationRequestsAction] UNAUTHENTICATED", {
        traceId,
      });
      return { success: false, message: "UNAUTHENTICATED", traceId };
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      console.warn(
        "[getGuideEvaluationRequestsAction] ATHLETE_NOT_FOUND for clerkUserId",
        { traceId, userId }
      );
      return { success: false, message: "ATHLETE_NOT_FOUND", traceId };
    }

    const guide = await prisma.guide.findUnique({
      where: { userId: athlete.id },
      select: { id: true },
    });

    if (!guide) {
      console.warn(
        "[getGuideEvaluationRequestsAction] GUIDE_NOT_FOUND for athlete",
        { traceId, athleteId: athlete.id }
      );
      return { success: false, message: "GUIDE_NOT_FOUND", traceId };
    }

    const requests = await prisma.physicalEvaluationRequest.findMany({
      where: { guideId: guide.id },
      orderBy: { createdAt: "desc" },
      include: {
        athlete: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            class: true,
            rank: true,
            profileImage: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
    });

    const data: GuideEvaluationRequestDTO[] = requests.map((r) => ({
      id: r.id,
      status: r.status,
      message: r.message ?? null,
      createdAt: r.createdAt,
      scheduledDate: r.scheduledDate ?? null,
      scheduledTime: r.scheduledTime ?? null,
      location: r.location ?? null,
      equipment: r.equipment ?? [],
      otp: r.OTP ?? null,
      athlete: {
        id: r.athlete.id,
        username: r.athlete.username,
        firstName: r.athlete.firstName,
        lastName: r.athlete.lastName,
        class: r.athlete.class,
        rank: r.athlete.rank,
        profileImage: r.athlete.profileImage,
        city: r.athlete.city,
        state: r.athlete.state,
        country: r.athlete.country,
      },
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[getGuideEvaluationRequestsAction] Unexpected error", {
      traceId,
      error,
    });
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? `Unexpected error: ${String(error)}`
          : "Failed to load requests.",
      traceId,
    };
  }
}

export async function updateGuideEvaluationRequestStatusAction(
  input: UpdateStatusInput
): Promise<
  { success: true } | { success: false; message: string; traceId?: string }
> {
  const traceId = `GUIDE_REQ_UPDATE_${Date.now()}`;

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn(
        "[updateGuideEvaluationRequestStatusAction] UNAUTHENTICATED",
        { traceId }
      );
      return { success: false, message: "UNAUTHENTICATED", traceId };
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      console.warn(
        "[updateGuideEvaluationRequestStatusAction] ATHLETE_NOT_FOUND",
        { traceId, userId }
      );
      return { success: false, message: "ATHLETE_NOT_FOUND", traceId };
    }

    const guide = await prisma.guide.findUnique({
      where: { userId: athlete.id },
      select: { id: true },
    });

    if (!guide) {
      console.warn(
        "[updateGuideEvaluationRequestStatusAction] GUIDE_NOT_FOUND",
        { traceId, athleteId: athlete.id }
      );
      return { success: false, message: "GUIDE_NOT_FOUND", traceId };
    }

    const request = await prisma.physicalEvaluationRequest.findUnique({
      where: { id: input.requestId },
      include: { athlete: true },
    });

    if (!request) {
      console.warn(
        "[updateGuideEvaluationRequestStatusAction] REQUEST_NOT_FOUND",
        { traceId, requestId: input.requestId }
      );
      return { success: false, message: "REQUEST_NOT_FOUND", traceId };
    }

    if (request.guideId !== guide.id) {
      console.warn(
        "[updateGuideEvaluationRequestStatusAction] FORBIDDEN: guide mismatch",
        { traceId, guideId: guide.id, requestGuideId: request.guideId }
      );
      return { success: false, message: "FORBIDDEN", traceId };
    }

    if (input.action === "REJECT") {
      // Reject: set status, notify, then delete record
      await prisma.$transaction(async (tx) => {
        await tx.physicalEvaluationRequest.update({
          where: { id: request.id },
          data: { status: RequestStatus.REJECTED },
        });

        await tx.notification.create({
          data: {
            athleteId: request.athleteId,
            actorId: athlete.id, // guide's athlete id
            type: NotificationType.STAT_UPDATE_DENIED, // reuse or add dedicated type later
            title: "Physical evaluation request rejected",
            message:
              "Your physical evaluation request was rejected by the guide.",
            data: {
              requestId: request.id,
              guideId: guide.id,
            },
          },
        });

        await tx.physicalEvaluationRequest.delete({
          where: { id: request.id },
        });
      });

      return { success: true };
    }

    if (input.action === "ACCEPT") {
      // Validate required fields
      if (!input.scheduledDate || !input.scheduledTime || !input.location) {
        console.warn(
          "[updateGuideEvaluationRequestStatusAction] MISSING_FIELDS on ACCEPT",
          { traceId, input }
        );
        return {
          success: false,
          message: "Missing required scheduling fields.",
          traceId,
        };
      }

      // Normalize date to full ISO-8601 (00:00 UTC)
      const scheduledDateIso = `${input.scheduledDate}T00:00:00.000Z`;

      const otp = crypto.randomInt(100000, 1000000); // secure 6-digit OTP

      const equipmentList =
        input.equipmentRaw
          ?.split(",")
          .map((e) => e.trim())
          .filter(Boolean) ?? [];

      await prisma.$transaction(async (tx) => {
        const updated = await tx.physicalEvaluationRequest.update({
          where: { id: request.id },
          data: {
            status: RequestStatus.ACCEPTED,
            MessageFromguide: input.messageFromGuide ?? null,
            scheduledDate: scheduledDateIso,
            scheduledTime: input.scheduledTime,
            location: input.location,
            equipment: equipmentList,
            OTP: otp,
          },
        });

        // Notification to athlete
        await tx.notification.create({
          data: {
            athleteId: updated.athleteId,
            actorId: athlete.id, // guide's athlete id
            type: NotificationType.STAT_UPDATE_APPROVED, // or dedicated type
            title: "Physical evaluation request accepted",
            message:
              "Your physical evaluation request was accepted. Check details for schedule and location.",
            data: {
              requestId: updated.id,
              guideId: guide.id,
              otp,
              scheduledDate: updated.scheduledDate,
              scheduledTime: updated.scheduledTime,
              location: updated.location,
              equipment: updated.equipment,
            },
          },
        });

        // Optional: notification back to guide as confirmation
        await tx.notification.create({
          data: {
            athleteId: athlete.id, // recipient is the guide as athlete
            actorId: athlete.id,
            type: NotificationType.STAT_UPDATE_APPROVED,
            title: "Evaluation scheduled",
            message:
              "You accepted a physical evaluation request. The athlete has been notified.",
            data: {
              requestId: updated.id,
              athleteId: updated.athleteId,
              otp,
            },
          },
        });
      });

      return { success: true };
    }

    console.warn("[updateGuideEvaluationRequestStatusAction] INVALID_ACTION", {
      traceId,
      action: input.action,
    });
    return { success: false, message: "INVALID_ACTION", traceId };
  } catch (error) {
    console.error(
      "[updateGuideEvaluationRequestStatusAction] Unexpected error",
      { traceId, error }
    );
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? `Unexpected error: ${String(error)}`
          : "Failed to update request.",
      traceId,
    };
  }
}
