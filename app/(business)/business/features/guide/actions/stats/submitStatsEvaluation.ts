"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { InjuryRecord } from "@/types/stats/athlete-stats.types";

function generateTraceId() {
  return `stats_submit_${Math.random()
    .toString(36)
    .slice(2, 10)}_${Date.now().toString(36)}`;
}

export async function submitStatsEvaluation(input: any): Promise<any> {
  const traceId = generateTraceId();

  try {
    const { userId } = await auth();
    if (!userId) {
      if (process.env.NODE_ENV === "development") {
        console.error("[submitStatsEvaluation] Unauthenticated", { traceId });
      }
      return { success: false, error: "Authentication required", traceId };
    }

    const guideAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!guideAthlete) {
      return {
        success: false,
        error: "Guide athlete profile not found",
        traceId,
      };
    }

    const guide = await prisma.guide.findUnique({
      where: { userId: guideAthlete.id, id: input.guideId },
      select: { id: true, status: true, userId: true },
    });

    if (!guide || guide.status !== "approved") {
      return { success: false, error: "Guide not authorized", traceId };
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: input.athleteClerkUserId },
      select: { id: true, clerkUserId: true },
    });

    if (!athlete) {
      return { success: false, error: "Athlete not found", traceId };
    }

    const evaluationRequest = await prisma.physicalEvaluationRequest.findFirst({
      where: {
        id: input.requestId,
        guideId: input.guideId,
        athleteId: athlete.id,
        status: "ACCEPTED",
      },
    });

    if (!evaluationRequest) {
      return {
        success: false,
        error: "Valid evaluation request not found",
        traceId,
      };
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[submitStatsEvaluation] Starting database transaction", {
        traceId,
        athleteId: athlete.id,
        guideId: guide.id,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or update Stats record
      const stats = await tx.stats.upsert({
        where: { athleteId: athlete.id },
        create: {
          athleteId: athlete.id,
          height: input.payload.basicMeasurements.height,
          weight: input.payload.basicMeasurements.weight,
          age: input.payload.basicMeasurements.age,
          bodyFat: input.payload.basicMeasurements.bodyFat,
          bodyMassIndex: input.payload.basicMeasurements.bodyMassIndex,
        },
        update: {
          height: input.payload.basicMeasurements.height,
          weight: input.payload.basicMeasurements.weight,
          age: input.payload.basicMeasurements.age,
          bodyFat: input.payload.basicMeasurements.bodyFat,
          bodyMassIndex: input.payload.basicMeasurements.bodyMassIndex,
        },
      });

      // 2. Create StrengthAndPower record
      if (input.payload.strengthAndPower) {
        await tx.strengthAndPower.create({
          data: {
            statId: stats.id,
            Countermovement_Jump: input.payload.strengthAndPower
              .Countermovement_Jump as any,
            Loaded_Squat_Jump: input.payload.strengthAndPower
              .Loaded_Squat_Jump as any,
            Depth_Jump: input.payload.strengthAndPower.Depth_Jump as any,
            Ballistic_Bench_Press: input.payload.strengthAndPower
              .Ballistic_Bench_Press as any,
            Push_Up: input.payload.strengthAndPower.Push_Up as any,
            Ballistic_Push_Up: input.payload.strengthAndPower
              .Ballistic_Push_Up as any,
            Deadlift_Velocity: input.payload.strengthAndPower
              .Deadlift_Velocity as any,
            Barbell_Hip_Thrust: input.payload.strengthAndPower
              .Barbell_Hip_Thrust as any,
            Weighted_Pull_up: input.payload.strengthAndPower
              .Weighted_Pull_up as any,
            Barbell_Row: input.payload.strengthAndPower.Barbell_Row as any,
            Plank_Hold: input.payload.strengthAndPower.Plank_Hold as any,
            pullUps: input.payload.strengthAndPower.pullUps as any,
            Pushups: input.payload.strengthAndPower.Pushups,
            muscleMass: input.payload.strengthAndPower.scores?.muscleMass,
            enduranceStrength:
              input.payload.strengthAndPower.scores?.enduranceStrength,
            explosivePower:
              input.payload.strengthAndPower.scores?.explosivePower,
          },
        });
      }

      // 3. Create SpeedAndAgility record
      if (input.payload.speedAndAgility) {
        await tx.speedAndAgility.create({
          data: {
            statId: stats.id,
            Ten_Meter_Sprint: input.payload.speedAndAgility
              .Ten_Meter_Sprint as any,
            Fourty_Meter_Dash: input.payload.speedAndAgility
              .Fourty_Meter_Dash as any,
            Repeated_Sprint_Ability: input.payload.speedAndAgility
              .Repeated_Sprint_Ability as any,
            Five_0_Five_Agility_Test: input.payload.speedAndAgility
              .Five_0_Five_Agility_Test as any,
            T_Test: input.payload.speedAndAgility.T_Test as any,
            Illinois_Agility_Test: input.payload.speedAndAgility
              .Illinois_Agility_Test as any,
            Visual_Reaction_Speed_Drill: input.payload.speedAndAgility
              .Visual_Reaction_Speed_Drill as any,
            Long_Jump: input.payload.speedAndAgility.Long_Jump as any,
            Reactive_Agility_T_Test: input.payload.speedAndAgility
              .Reactive_Agility_T_Test as any,
            Standing_Long_Jump: input.payload.speedAndAgility
              .Standing_Long_Jump as any,
            sprintSpeed: input.payload.speedAndAgility.scores?.sprintSpeed,
            acceleration: input.payload.speedAndAgility.scores?.acceleration,
            agility: input.payload.speedAndAgility.scores?.agility,
            reactionTime: input.payload.speedAndAgility.scores?.reactionTime,
          },
        });
      }

      // 4. Create StaminaAndRecovery record
      if (input.payload.staminaAndRecovery) {
        await tx.staminaAndRecovery.create({
          data: {
            statId: stats.id,
            Beep_Test: input.payload.staminaAndRecovery.Beep_Test as any,
            Yo_Yo_Test: input.payload.staminaAndRecovery.Yo_Yo_Test as any,
            Cooper_Test: input.payload.staminaAndRecovery.Cooper_Test as any,
            Resting_Heart_Rate: input.payload.staminaAndRecovery
              .Heart_Rate_Metrics as any,
            Sit_and_Reach_Test: input.payload.staminaAndRecovery
              .Sit_And_Reach as any,
            Peak_Heart_Rate: input.payload.staminaAndRecovery
              .Peak_Heart_Rate as any,
            recoveryTime: input.payload.staminaAndRecovery
              .Resting_Heart_Rate as any,
            Resting_Heart_Rate_Variability: input.payload.staminaAndRecovery
              .Resting_Heart_Rate_Variability as any,
            Lactate_Threshold: input.payload.staminaAndRecovery
              .Lactate_Threshold as any,
            Anaerobic_Capacity: input.payload.staminaAndRecovery
              .Anaerobic_Capacity as any,
            Post_Exercise_Heart_Rate_Recovery: input.payload.staminaAndRecovery
              .Post_Exercise_Heart_Rate_Recovery as any,
            Active_Straight_Leg_Raise: input.payload.staminaAndRecovery
              .Active_Straight_Leg_Raise as any,
            Shoulder_External_Internal_Rotation: input.payload
              .staminaAndRecovery.Shoulder_External_Internal_Rotation as any,
            Knee_to_Wall_Test: input.payload.staminaAndRecovery
              .Knee_to_Wall_Test as any,
            vo2Max: input.payload.staminaAndRecovery.vo2Max as any,
            flexibility: input.payload.staminaAndRecovery.flexibility as any,
            anthropometricData: input.payload.staminaAndRecovery
              .anthropometricData as any,
            cardiovascularFitnessScore:
              input.payload.staminaAndRecovery.scores?.cardiovascularFitness,
            recoveryEfficiencyScore:
              input.payload.staminaAndRecovery.scores?.recoveryEfficiency,
            overallFlexibilityScore:
              input.payload.staminaAndRecovery.scores?.overallFlexibility,
          },
        });
      }

      // 5. Create InjuryStat records
      if (input.payload.injuries && input.payload.injuries.length > 0) {
        await tx.injuryStat.createMany({
          data: input.payload.injuries.map((injury: InjuryRecord) => ({
            statId: stats.id,
            type: injury.type,
            bodyPart: injury.bodyPart,
            severity: injury.severity,
            occurredAt: new Date(injury.occurredAt),
            status: injury.currentStatus,
            expectedRecoveryDate: injury.expectedRecoveryDate
              ? new Date(injury.expectedRecoveryDate)
              : null,
            recoveredAt: injury.recoveredAt
              ? new Date(injury.recoveredAt)
              : null,
            recoveryTime: injury.recoveryTime,
            notes: injury.notes,
            treatmentPlan: injury.treatmentPlan,
          })),
        });
      }

      // 6. Create Notification for athlete
      await tx.notification.create({
        data: {
          actorId: guide.userId,
          athleteId: athlete.id,
          type: "EVALUATION_COMPLETED",
          title: "Physical Evaluation Completed",
          message: `Your physical evaluation has been completed. View your stats in your profile.`,
          isRead: false,
        },
      });

      return { statsId: stats.id };
    });

    if (process.env.NODE_ENV === "development") {
      console.info("[submitStatsEvaluation] Successfully submitted", {
        traceId,
        statsId: result.statsId,
      });
    }

    return { success: true, statsId: result.statsId };
  } catch (error) {
    console.error("[submitStatsEvaluation] Error:", {
      traceId,
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : "Failed to submit evaluation. Please try again.",
      traceId,
    };
  }
}
