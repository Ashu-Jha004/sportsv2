// app/api/teams/[teamId]/invitations/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const getInvitationsSchema = z.object({
  teamId: z.string(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const validated = getInvitationsSchema.parse({ teamId });

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        teamId: validated.teamId,
        status: { in: ["PENDING", "EXPIRED"] },
      },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        team: { select: { name: true } },
        invitedAthlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profileImage: true,
            primarySport: true,
            rank: true,
            class: true,
          },
        },
        invitedBy: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: invitations,
      count: invitations.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
