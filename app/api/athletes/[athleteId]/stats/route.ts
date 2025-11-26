// app/api/athletes/[athleteId]/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;

  const Athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: athleteId },
  });

  const stats = await prisma.stats.findUnique({
    where: { athleteId: Athlete?.id },
    include: {
      injuries: true,
      strength: true,
      speed: true,
      stamina: true,
    },
  });

  if (!stats) {
    return NextResponse.json(
      { hasStats: false },
      {
        status: 200,
      }
    );
  }

  return NextResponse.json({ success: true, data: stats }, { status: 200 });
}
