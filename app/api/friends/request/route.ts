// app/api/friends/request/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestIdLog = Math.random().toString(36).substring(7);

  try {
    const { userId } = await auth();

    if (!userId) {
      console.error(
        `❌ [${requestIdLog}] Unauthorized friend requests access attempt`
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      console.error(
        `❌ [${requestIdLog}] Athlete not found for userId:`,
        userId
      );
      return NextResponse.json(
        {
          success: false,
          error: "Athlete not found",
          code: "ATHLETE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Find pending friend requests where this athlete is receiver
    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: athlete.id, status: "PENDING" },
      select: {
        id: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            primarySport: true,
            rank: true,
            class: true,
            roles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedRequests = requests.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      sender: {
        id: r.sender.id,
        username: r.sender.username,
        fullName: `${r.sender.firstName} ${r.sender.lastName}`,
        profileImage: r.sender.profileImage,
        primarySport: r.sender.primarySport,
        rank: r.sender.rank,
        class: r.sender.class,
        roles: r.sender.roles,
      },
    }));

    const duration = Date.now() - startTime;
    console.log(
      `✅ [${requestIdLog}] Returned pending friend requests, count: ${requests.length}`,
      {
        duration: `${duration}ms`,
      }
    );

    return NextResponse.json({ success: true, requests: formattedRequests });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestIdLog}] Error in GET friend requests:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch friend requests",
        code: "FETCH_FAILED",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.error(`❌ [${requestId}] Unauthorized friend request attempt`);
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { friendId } = body;
    console.log("body", body);
    if (!friendId || typeof friendId !== "string" || friendId.length < 3) {
      console.error(`❌ [${requestId}] Invalid friendId:`, friendId);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid receiver username",
          code: "INVALID_USERNAME",
        },
        { status: 400 }
      );
    }

    console.log(
      `📥 [${requestId}] Friend request from userId:${userId} to ${friendId}`
    );

    // Fetch sender and receiver athletes
    const sender = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!sender) {
      console.error(
        `❌ [${requestId}] Sender athlete not found for userId:`,
        userId
      );
      return NextResponse.json(
        {
          success: false,
          error: "Sender profile not found",
          code: "SENDER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const receiver = await prisma.athlete.findUnique({
      where: { username: friendId.toLowerCase() },
      select: { id: true },
    });

    if (!receiver) {
      console.error(`❌ [${requestId}] Receiver athlete not found:`, friendId);
      return NextResponse.json(
        {
          success: false,
          error: "Receiver not found",
          code: "RECEIVER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (receiver.id === sender.id) {
      console.warn(`⚠️ [${requestId}] User cannot send friend request to self`);
      return NextResponse.json(
        {
          success: false,
          error: "Cannot send request to self",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    // Check existing friendship
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: sender.id, userBId: receiver.id },
          { userAId: receiver.id, userBId: sender.id },
        ],
      },
    });

    if (existingFriendship) {
      console.warn(`⚠️ [${requestId}] Friendship already exists`);
      return NextResponse.json(
        {
          success: false,
          error: "Friendship already exists",
          code: "ALREADY_FRIENDS",
        },
        { status: 409 }
      );
    }

    // Check existing pending request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: sender.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: sender.id },
        ],
        status: "PENDING",
      },
    });

    if (existingRequest) {
      console.warn(`⚠️ [${requestId}] Pending friend request already exists`);
      return NextResponse.json(
        {
          success: false,
          error: "Pending friend request exists",
          code: "PENDING_REQUEST",
        },
        { status: 409 }
      );
    }

    // Create new friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Friend request created`, {
      friendRequestId: friendRequest.id,
      duration: `${duration}ms`,
    });

    return NextResponse.json({
      success: true,
      message: "Friend request sent successfully",
      friendRequestId: friendRequest.id,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error in friend request POST:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send friend request",
        code: "REQUEST_FAILED",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
