import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestIdLog = Math.random().toString(36).substring(7);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.error(
        `❌ [${requestIdLog}] Unauthorized attempt to send message`
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiverUsername, content, imageUrl } = body;

    if (
      !receiverUsername ||
      typeof receiverUsername !== "string" ||
      receiverUsername.length < 3
    ) {
      console.error(`❌ [${requestIdLog}] Invalid receiverUsername`);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid receiver username",
          code: "INVALID_USERNAME",
        },
        { status: 400 }
      );
    }

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      console.error(`❌ [${requestIdLog}] Message content is empty`);
      return NextResponse.json(
        {
          success: false,
          error: "Message content required",
          code: "EMPTY_CONTENT",
        },
        { status: 400 }
      );
    }

    // Fetch sender athlete
    const sender = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!sender) {
      console.error(
        `❌ [${requestIdLog}] Sender athlete not found for userId:`,
        userId
      );
      return NextResponse.json(
        { success: false, error: "Sender not found", code: "SENDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Fetch receiver athlete
    const receiver = await prisma.athlete.findUnique({
      where: { username: receiverUsername.toLowerCase() },
      select: { id: true },
    });

    if (!receiver) {
      console.error(
        `❌ [${requestIdLog}] Receiver athlete not found:`,
        receiverUsername
      );
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
      console.warn(`⚠️ [${requestIdLog}] Sender and receiver are the same`);
      return NextResponse.json(
        {
          success: false,
          error: "Cannot message self",
          code: "INVALID_OPERATION",
        },
        { status: 400 }
      );
    }

    // Find or create conversation between both participants
    // Simple approach: find conversation having exactly these two participants

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          every: {
            OR: [{ id: sender.id }, { id: receiver.id }],
          },
        },
      },
      include: {
        participants: true,
      },
    });

    // Filter conversations with exactly 2 participants (the two users)
    let conversation = conversations.find(
      (c) =>
        c.participants.length === 2 &&
        c.participants.some((p) => p.id === sender.id) &&
        c.participants.some((p) => p.id === receiver.id)
    );

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: sender.id }, { id: receiver.id }],
          },
        },
        include: {
          participants: true,
        },
      });
    }

    // Create message linked to conversation
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: sender.id,

        content: content || "[Image]",
        imageUrl: imageUrl ?? null,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestIdLog}] Message sent`, {
      messageId: message.id,
      duration: `${duration}ms`,
    });

    return NextResponse.json({
      success: true,
      message,
      conversation: {
        id: conversation.id,
        participants: conversation.participants.map((p) => ({
          id: p.id,
          username: p.username,
          fullName: `${p.firstName} ${p.lastName}`,
          profileImage: p.profileImage,
        })),
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestIdLog}] Error sending message:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message",
        code: "SEND_FAILED",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
