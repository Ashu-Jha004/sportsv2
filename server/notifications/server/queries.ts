// src/features/notifications/server/queries.ts
"use server";

import prisma from "@/lib/prisma";
import { getCurrentAthleteOrThrow } from "@/lib/auth/getCurrentAthlete";
import { mapNotificationToDto } from "./mapper";
import type {
  GetNotificationsParams,
  NotificationsPageDto,
  NotificationsFilter,
} from "../../../types/notifications/types";

const DEFAULT_PAGE_SIZE = 20;

export async function fetchNotificationsPage(
  params: GetNotificationsParams
): Promise<NotificationsPageDto> {
  const athlete = await getCurrentAthleteOrThrow();

  const limit =
    params.limit && params.limit > 0 ? params.limit : DEFAULT_PAGE_SIZE;
  const filter: NotificationsFilter = params.filter ?? "all";

  const whereBase = {
    athleteId: athlete.id,
  } as const;

  const where =
    filter === "unread" ? { ...whereBase, isRead: false } : whereBase;

  try {
    const cursor = params.cursor != null ? { id: params.cursor } : undefined;

    // Fetch one extra record to detect "hasMore"
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }, // tie-breaker for stable ordering
      ],
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor } : {}),
      include: {
        actor: true,
      },
    });

    const hasMore = notifications.length > limit;
    const pageItems = hasMore ? notifications.slice(0, limit) : notifications;

    const dtoItems = pageItems.map(mapNotificationToDto);

    const unreadCount = await prisma.notification.count({
      where: {
        athleteId: athlete.id,
        isRead: false,
      },
    });

    return {
      notifications: dtoItems,
      unreadCount,
      hasMore,
    };
  } catch (error) {
    console.error("[notifications:fetchNotificationsPage] Failed", {
      error,
      athleteId: athlete.id,
      params,
    });
    // Bubble up; route handler will format error for HTTP
    throw error;
  }
}

export async function fetchUnreadCount(): Promise<number> {
  const athlete = await getCurrentAthleteOrThrow();

  try {
    const unreadCount = await prisma.notification.count({
      where: {
        athleteId: athlete.id,
        isRead: false,
      },
    });

    return unreadCount;
  } catch (error) {
    console.error("[notifications:fetchUnreadCount] Failed", {
      error,
      athleteId: athlete.id,
    });
    throw error;
  }
}
