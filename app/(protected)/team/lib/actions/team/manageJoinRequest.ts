// actions/team/manageJoinRequest.ts
"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { revalidatePath } from "next/cache";

const manageJoinRequestSchema = z.object({
  requestId: z.string(),
  action: z.enum(["ACCEPT", "REJECT"]),
  note: z.string().optional(),
});

export async function manageTeamJoinRequest({ requestId, action, note }: any) {
  const validatedData = manageJoinRequestSchema.parse({
    requestId,
    action,
    note,
  });
  const startTime = Date.now();

  try {
    const cookieStore = await cookies();
    const reviewerId = cookieStore.get("__clerk_db_user_id")?.value;

    if (!reviewerId) {
      throw new Error("User not authenticated");
    }

    // 1. Fetch join request
    const joinRequest = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: {
          select: { id: true, ownerId: true },
        },
        athlete: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
      },
    });

    if (!joinRequest) {
      throw new Error("Join request not found");
    }

    // 2. Verify reviewer permissions (owner/captain)
    const reviewerMembership = await prisma.teamMembership.findFirst({
      where: {
        teamId: joinRequest.teamId,
        athleteId: reviewerId,
        OR: [{ role: "OWNER" }, { role: "CAPTAIN" }],
      },
    });

    if (!reviewerMembership) {
      throw new Error("Only team owner/captain can manage join requests");
    }

    // 3. Update request status
    const updatedRequest = await prisma.teamJoinRequest.update({
      where: { id: requestId },
      data: {
        status: action,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        team: true,
        athlete: true,
      },
    });

    if (action === "ACCEPT") {
      // 4. Add athlete to team as PLAYER
      await prisma.teamMembership.create({
        data: {
          teamId: joinRequest.teamId,
          athleteId: joinRequest.athleteId,
          role: "PLAYER",
          isCaptain: false,
        },
      });

      // 5. Notify athlete of acceptance
      await prisma.notification.create({
        data: {
          athleteId: joinRequest.athleteId,
          actorId: reviewerId,
          type: "MEMBER_JOINED",
          title: "Join Request Accepted",
          message: `Welcome to ${updatedRequest.team.name}!`,
          data: {
            teamId: joinRequest.teamId,
          },
        },
      });
    } else {
      // 6. Notify athlete of rejection
      await prisma.notification.create({
        data: {
          athleteId: joinRequest.athleteId,
          actorId: reviewerId,
          type: "TEAM_EXPIRING",
          title: "Join Request Rejected",
          message: note || "Your join request was declined",
          data: {
            teamId: joinRequest.teamId,
          },
        },
      });
    }

    const queryTime = Date.now() - startTime;
    logger.team.debug("✅ Join request managed", {
      requestId,
      action,
      teamId: joinRequest.teamId,
      athleteId: joinRequest.athleteId,
      queryTime: `${queryTime}ms`,
    });

    revalidatePath(`/team/${joinRequest.teamId}`);
    revalidatePath("/notifications");

    return {
      success: true,
      data: updatedRequest,
    };
  } catch (error) {
    logger.team.error(error as Error, {
      action: "manageTeamJoinRequest",
      requestId,
    });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to manage request",
    };
  }
}
