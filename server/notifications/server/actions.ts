// src/features/notifications/actions.ts
// src/features/notifications/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { getCurrentAthleteOrThrow } from "@/lib/auth/getCurrentAthlete";
// if split, adjust path

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; errorCode: string; errorMessage: string };

export async function markNotificationReadAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  const { id } = input;

  try {
    const athlete = await getCurrentAthleteOrThrow();

    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, athleteId: true, isRead: true },
    });

    if (!existing || existing.athleteId !== athlete.id) {
      return {
        ok: false,
        errorCode: "NOTIFICATION_NOT_FOUND",
        errorMessage:
          process.env.NODE_ENV === "development"
            ? "Notification not found for current athlete"
            : "Notification not found.",
      };
    }

    if (existing.isRead) {
      // Already read; treat as success for idempotency
      return { ok: true, data: { id } };
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return { ok: true, data: { id } };
  } catch (error: any) {
    console.error("[notifications:markNotificationReadAction] Failed", {
      error,
      input,
    });

    return {
      ok: false,
      errorCode: "NOTIFICATION_MARK_READ_FAILED",
      errorMessage:
        process.env.NODE_ENV === "development"
          ? error?.message ?? "Failed to mark notification as read"
          : "Unable to update notification.",
    };
  }
}

export async function markNotificationUnreadAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  const { id } = input;

  try {
    const athlete = await getCurrentAthleteOrThrow();

    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, athleteId: true, isRead: true },
    });

    if (!existing || existing.athleteId !== athlete.id) {
      return {
        ok: false,
        errorCode: "NOTIFICATION_NOT_FOUND",
        errorMessage:
          process.env.NODE_ENV === "development"
            ? "Notification not found for current athlete"
            : "Notification not found.",
      };
    }

    if (!existing.isRead) {
      // Already unread; idempotent success
      return { ok: true, data: { id } };
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: false },
    });

    return { ok: true, data: { id } };
  } catch (error: any) {
    console.error("[notifications:markNotificationUnreadAction] Failed", {
      error,
      input,
    });

    return {
      ok: false,
      errorCode: "NOTIFICATION_MARK_UNREAD_FAILED",
      errorMessage:
        process.env.NODE_ENV === "development"
          ? error?.message ?? "Failed to mark notification as unread"
          : "Unable to update notification.",
    };
  }
}

export async function markAllNotificationsReadAction(): Promise<
  ActionResult<{ updatedCount: number }>
> {
  try {
    const athlete = await getCurrentAthleteOrThrow();

    const result = await prisma.notification.updateMany({
      where: {
        athleteId: athlete.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // result.count is number of rows updated
    return {
      ok: true,
      data: { updatedCount: result.count },
    };
  } catch (error: any) {
    console.error("[notifications:markAllNotificationsReadAction] Failed", {
      error,
    });

    return {
      ok: false,
      errorCode: "NOTIFICATIONS_MARK_ALL_READ_FAILED",
      errorMessage:
        process.env.NODE_ENV === "development"
          ? error?.message ?? "Failed to mark all notifications as read"
          : "Unable to update notifications.",
    };
  }
}

export async function deleteNotificationAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  const { id } = input;

  try {
    const athlete = await getCurrentAthleteOrThrow();

    const existing = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, athleteId: true },
    });

    if (!existing || existing.athleteId !== athlete.id) {
      return {
        ok: false,
        errorCode: "NOTIFICATION_NOT_FOUND",
        errorMessage:
          process.env.NODE_ENV === "development"
            ? "Notification not found for current athlete"
            : "Notification not found.",
      };
    }

    await prisma.notification.delete({
      where: { id },
    });

    return { ok: true, data: { id } };
  } catch (error: any) {
    console.error("[notifications:deleteNotificationAction] Failed", {
      error,
      input,
    });

    return {
      ok: false,
      errorCode: "NOTIFICATION_DELETE_FAILED",
      errorMessage:
        process.env.NODE_ENV === "development"
          ? error?.message ?? "Failed to delete notification"
          : "Unable to delete notification.",
    };
  }
}

export async function clearAllNotificationsAction(): Promise<
  ActionResult<{ deletedCount: number }>
> {
  try {
    const athlete = await getCurrentAthleteOrThrow();

    const result = await prisma.notification.deleteMany({
      where: {
        athleteId: athlete.id,
      },
    });

    return {
      ok: true,
      data: { deletedCount: result.count },
    };
  } catch (error: any) {
    console.error("[notifications:clearAllNotificationsAction] Failed", {
      error,
    });

    return {
      ok: false,
      errorCode: "NOTIFICATIONS_CLEAR_ALL_FAILED",
      errorMessage:
        process.env.NODE_ENV === "development"
          ? error?.message ?? "Failed to clear all notifications"
          : "Unable to clear notifications.",
    };
  }
}
