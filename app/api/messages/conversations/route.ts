// app/api/messages/conversations/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const requestIdLog = Math.random().toString(36).substring(7);

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

    // Find conversations for this athlete
    // Include participants and last message
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { id: athlete.id } } },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: { select: { id: true, username: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
