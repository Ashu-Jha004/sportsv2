import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/app/(protected)/team/lib/utils/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get athlete ID
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      return NextResponse.json(
        { success: false, error: "Athlete not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeRead = searchParams.get("includeRead") === "true";

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: {
        athleteId: athlete.id,
        ...(includeRead ? {} : { isRead: false }),
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    // Count unread
    const unreadCount = await prisma.notification.count({
      where: {
        athleteId: athlete.id,
        isRead: false,
      },
    });

    logger.notification.debug("✅ Notifications fetched", {
      athleteId: athlete.id,
      unreadCount,
      total: notifications.length,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    logger.notification.error(error as Error, {
      endpoint: "/api/user/notifications",
      method: "GET",
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      return NextResponse.json(
        { success: false, error: "Athlete not found" },
        { status: 404 }
      );
    }

    const { ids, all } = await request.json();

    if (all) {
      // Mark all as read
      await prisma.notification.updateMany({
        where: {
          athleteId: athlete.id,
          isRead: false,
        },
        data: { isRead: true, updatedAt: new Date() },
      });
    } else if (ids && Array.isArray(ids)) {
      // Mark specific as read
      await prisma.notification.updateMany({
        where: {
          id: { in: ids as string[] },
          athleteId: athlete.id,
          isRead: false,
        },
        data: { isRead: true, updatedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.notification.error(error as Error, {
      endpoint: "/api/user/notifications",
      method: "POST",
    });
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
