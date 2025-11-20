// app/api/messages/conversations/[conversationId]/messages/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor"); // optional cursor based pagination
  const limit = Number(url.searchParams.get("limit") ?? "20");

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
    });
    if (!athlete) {
      return NextResponse.json(
        { success: false, error: "Athlete not found" },
        { status: 404 }
      );
    }

    // Validate user participates in the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });
    if (
      !conversation ||
      !conversation.participants.some((p: any) => p.id === athlete.id)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to view messages" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit,
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

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
