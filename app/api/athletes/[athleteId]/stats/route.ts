// app/api/athletes/[athleteId]/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(
  req: Request,
  { params }: { params: { athleteId: string } }
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
  console.log("Athlete", stats);

  if (!stats) {
    return NextResponse.json(
      { hasStats: false },
      {
        status: 200,
      }
    );
  }

  // Example: derive 0–100 scores from your model
  const strengthSlice = stats.strength?.[0] ?? null;
  const speedSlice = stats.speed?.[0] ?? null;
  const staminaSlice = stats.stamina?.[0] ?? null;

  const response: AthleteStatsResponse = {
    hasStats: true,
    strength: strengthSlice?.enduranceStrength ?? 0,
    speed: speedSlice?.sprintSpeed ?? 0,
    agility: 0, // can derive from speed/agility JSON if needed
    endurance: staminaSlice?.cardiovascularFitnessScore ?? 0,
    power: strengthSlice?.explosivePower ?? 0,
    flexibility: staminaSlice?.overallFlexibilityScore ?? 0,
    injuries: stats.injuries.map((i) => ({
      id: i.id,
      type: i.type,
      bodyPart: i.bodyPart,
      severity: i.severity,
      occurredAt: i.occurredAt.toISOString(),
      status: i.status,
    })),
    strengthSlice: strengthSlice
      ? {
          muscleMass: strengthSlice.muscleMass,
          enduranceStrength: strengthSlice.enduranceStrength,
          explosivePower: strengthSlice.explosivePower,
        }
      : null,
    speedSlice: speedSlice
      ? {
          sprintSpeed: speedSlice.sprintSpeed,
          agility: 0, // placeholder
        }
      : null,
    staminaSlice: staminaSlice
      ? {
          cardiovascularFitness: staminaSlice.cardiovascularFitnessScore ?? 0,
          recoveryEfficiency: staminaSlice.recoveryEfficiencyScore ?? 0,
          overallFlexibility: staminaSlice.overallFlexibilityScore ?? 0,
        }
      : null,
  };

  return NextResponse.json(response);
}
