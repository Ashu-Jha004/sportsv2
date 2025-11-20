// app/api/friends/request/[requestId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const startTime = Date.now();
  const requestIdLog = Math.random().toString(36).substring(7);
  const { requestId } = await params;

  try {
    const { userId } = await auth();

    if (!userId) {
      console.error(
        `❌ [${requestIdLog}] Unauthorized access to PATCH friend request`
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (status !== "ACCEPTED" && status !== "REJECTED") {
      console.error(`❌ [${requestIdLog}] Invalid status:`, status);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status value",
          code: "INVALID_STATUS",
        },
        { status: 400 }
      );
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: { sender: true, receiver: true },
    });

    if (!friendRequest) {
      console.error(
        `❌ [${requestIdLog}] Friend request not found:`,
        requestId
      );
      return NextResponse.json(
        {
          success: false,
          error: "Friend request not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Validate authenticated user is the receiver of the request
    const receiverAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!receiverAthlete || receiverAthlete.id !== friendRequest.receiverId) {
      console.error(
        `❌ [${requestIdLog}] User is not receiver of friend request`
      );
      return NextResponse.json(
        { success: false, error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // If already handled
    if (friendRequest.status !== "PENDING") {
      console.warn(`⚠️ [${requestIdLog}] Friend request already responded to`);
      return NextResponse.json(
        {
          success: false,
          error: "Request already handled",
          code: "ALREADY_HANDLED",
        },
        { status: 409 }
      );
    }

    if (status === "ACCEPTED") {
      // Update friend request status
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      // Create friendships (bi-directional)
      const createFriendships = prisma.$transaction([
        prisma.friendship.create({
          data: {
            userAId: friendRequest.senderId,
            userBId: friendRequest.receiverId,
          },
        }),
        prisma.friendship.create({
          data: {
            userAId: friendRequest.receiverId,
            userBId: friendRequest.senderId,
          },
        }),
      ]);

      await createFriendships;

      const duration = Date.now() - startTime;
      console.log(`✅ [${requestIdLog}] Friend request accepted`, {
        requestId,
        duration: `${duration}ms`,
      });

      return NextResponse.json({
        success: true,
        message: "Friend request accepted",
      });
    } else {
      // Reject friend request
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [${requestIdLog}] Friend request rejected`, {
        requestId,
        duration: `${duration}ms`,
      });

      return NextResponse.json({
        success: true,
        message: "Friend request rejected",
      });
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestIdLog}] Error in PATCH friend request:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update friend request",
        code: "UPDATE_FAILED",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
