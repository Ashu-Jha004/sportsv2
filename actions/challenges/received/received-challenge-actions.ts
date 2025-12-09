"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Logger, PerformanceTracker } from "@/lib/logger/logger";
import {
  ReceivedChallengeFiltersSchema,
  ChallengeActionSchema,
} from "@/lib/validations/challenges/received/validation";
import { validateWithLogging } from "@/lib/validations/challenges/sent/validation";
import {
  ReceivedChallengeFilters,
  ReceivedChallengeCardData,
  ReceivedChallengesResponse,
  ChallengeActionRequest,
  ChallengeActionResponse,
} from "@/types/challenges/challenge";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const CHALLENGES_PER_PAGE = 20;
const CHALLENGE_PENDING_TIMEOUT_DAYS = 7;

// ============================================
// GET RECEIVED CHALLENGES
// ============================================
export async function getReceivedChallenges(
  filters: ReceivedChallengeFilters,
  cursor?: string
): Promise<ReceivedChallengesResponse> {
  const perf = new PerformanceTracker("getReceivedChallenges");
  let userId: string | null = null;

  try {
    // Authentication
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      Logger.warn(
        "AUTH",
        "getReceivedChallenges",
        "Unauthenticated access attempt"
      );
      throw new Error("Unauthorized: You must be logged in");
    }

    Logger.info(
      "CHALLENGE_SYSTEM",
      "getReceivedChallenges",
      "Fetching received challenges",
      { userId, filters, cursor }
    );

    // Validate filters
    const validatedFilters = validateWithLogging(
      ReceivedChallengeFiltersSchema,
      filters,
      "getReceivedChallenges",
      userId
    );

    // Get current athlete and their team
    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        teamMembership: {
          select: {
            teamId: true,
            team: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!currentAthlete) {
      Logger.error(
        "DATABASE",
        "getReceivedChallenges",
        "Athlete not found",
        new Error("Athlete not found"),
        userId
      );
      throw new Error("Athlete profile not found");
    }

    if (!currentAthlete.teamMembership) {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "getReceivedChallenges",
        "User not in a team",
        { userId, athleteId: currentAthlete.id }
      );
      throw new Error("You must be a member of a team to view challenges");
    }

    const userTeamId = currentAthlete.teamMembership.teamId;

    // Build where clause
    const whereClause: any = {
      challengedTeamId: userTeamId,
      status: {
        in: ["PENDING_CHALLENGE", "SCHEDULING"],
      },
      createdAt: {
        gte: new Date(
          Date.now() - CHALLENGE_PENDING_TIMEOUT_DAYS * 24 * 60 * 60 * 1000
        ),
      },
    };

    // Apply filters
    if (validatedFilters.status && validatedFilters.status !== "ALL") {
      if (validatedFilters.status === "PENDING") {
        whereClause.status = "PENDING_CHALLENGE";
      } else if (validatedFilters.status === "NEGOTIATING") {
        whereClause.status = "SCHEDULING";
      }
    }

    if (validatedFilters.sport && validatedFilters.sport !== "ALL") {
      whereClause.challengerTeam = {
        sport: validatedFilters.sport as any,
      };
    }

    if (validatedFilters.teamName) {
      whereClause.challengerTeam = {
        ...whereClause.challengerTeam,
        name: {
          contains: validatedFilters.teamName,
          mode: "insensitive",
        },
      };
    }

    if (cursor) {
      whereClause.id = { lt: cursor };
    }

    // Fetch challenges
    const challenges = await prisma.teamMatch.findMany({
      where: whereClause,
      take: CHALLENGES_PER_PAGE + 1,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        challengerTeamId: true,
        status: true,
        challengerAccepted: true,
        challengedAccepted: true,
        proposedStart: true,
        proposedLocation: true,
        proposedLatitude: true,
        proposedLongitude: true,
        matchLengthMinutes: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
          },
        },
        challengerTeam: {
          select: {
            name: true,
            logoUrl: true,
            sport: true,
            TeamSchool: true,
          },
        },
      },
    });

    const hasMore = challenges.length > CHALLENGES_PER_PAGE;
    const challengesToReturn = hasMore
      ? challenges.slice(0, CHALLENGES_PER_PAGE)
      : challenges;

    const now = new Date();
    const expirationDate = new Date(
      now.getTime() - CHALLENGE_PENDING_TIMEOUT_DAYS * 24 * 60 * 60 * 1000
    );

    const challengeCards: any = challengesToReturn.map((challenge) => {
      const createdAt = new Date(challenge.createdAt);
      const daysRemaining = Math.ceil(
        (createdAt.getTime() -
          expirationDate.getTime() +
          CHALLENGE_PENDING_TIMEOUT_DAYS * 24 * 60 * 60 * 1000 -
          now.getTime()) /
          (24 * 60 * 60 * 1000)
      );

      let proposedTime = null;
      if (challenge.proposedStart) {
        const date = new Date(challenge.proposedStart);
        proposedTime = `${date.getHours().toString().padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }

      return {
        matchId: challenge.id,
        challengerTeamId: challenge.challengerTeamId,
        challengerTeamName: challenge.challengerTeam.name,
        challengerTeamLogo: challenge.challengerTeam.logoUrl,
        challengerTeamSport: challenge.challengerTeam.sport,
        challengerTeamSchool: challenge.challengerTeam.TeamSchool,
        proposedDate: challenge.proposedStart,
        proposedTime,
        proposedLocation: challenge.proposedLocation || "",
        proposedLatitude: challenge.proposedLatitude,
        proposedLongitude: challenge.proposedLongitude,
        matchDurationMinutes: challenge.matchLengthMinutes,
        messageFromChallenger: null,
        status: challenge.status,
        challengerAccepted: challenge.challengerAccepted,
        challengedAccepted: challenge.challengedAccepted,
        negotiationCount: challenge.status === "SCHEDULING" ? 1 : 0,
        lastModifiedBy: null,
        createdAt,
        daysRemaining: Math.max(0, daysRemaining),
        isExpiringSoon: daysRemaining <= 2 && daysRemaining > 0,
      };
    });

    Logger.info(
      "CHALLENGE_SYSTEM",
      "getReceivedChallenges",
      "Successfully fetched challenges",
      { count: challengeCards.length, hasMore, userId, teamId: userTeamId }
    );

    perf.end();

    return {
      challenges: challengeCards,
      hasMore,
      nextCursor: hasMore
        ? challengesToReturn[challengesToReturn.length - 1].id
        : undefined,
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "getReceivedChallenges",
      "Failed to fetch received challenges",
      error,
      userId || undefined,
      undefined,
      { filters, cursor }
    );

    perf.end();

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while fetching challenges. Please try again."
    );
  }
}

// ============================================
// HANDLE CHALLENGE ACTION
// ============================================
export async function handleChallengeAction(
  request: ChallengeActionRequest
): Promise<ChallengeActionResponse> {
  const perf = new PerformanceTracker("handleChallengeAction");
  let userId: string | null = null;

  try {
    // Authentication
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      Logger.warn(
        "AUTH",
        "handleChallengeAction",
        "Unauthenticated action attempt"
      );
      return {
        success: false,
        action: request.action,
        message: "",
        error: "You must be logged in",
      };
    }

    Logger.info(
      "CHALLENGE_SYSTEM",
      "handleChallengeAction",
      "Processing action",
      {
        userId,
        matchId: request.matchId,
        action: request.action,
      }
    );

    // Validate request
    const validatedRequest = validateWithLogging(
      ChallengeActionSchema,
      request,
      "handleChallengeAction",
      userId
    );

    // Get athlete with permissions
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        teamMembership: {
          select: {
            role: true,
            teamId: true,
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!athlete?.teamMembership) {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "handleChallengeAction",
        "User not in team",
        {
          userId,
        }
      );
      return {
        success: false,
        action: request.action,
        message: "",
        error: "You are not a member of any team",
      };
    }

    // Permission check
    const role = athlete.teamMembership.role;
    if (role !== "OWNER" && role !== "CAPTAIN") {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "handleChallengeAction",
        "Insufficient permissions",
        { userId, role }
      );
      return {
        success: false,
        action: request.action,
        message: "",
        error: "Only team owners and captains can manage challenges",
      };
    }

    const teamId = athlete.teamMembership.teamId;
    const athleteId = athlete.id;

    // Route to appropriate handler
    switch (validatedRequest.action) {
      case "ACCEPT":
        return await acceptChallenge(
          validatedRequest.matchId,
          athleteId,
          teamId
        );
      case "REJECT":
        return await rejectChallenge(
          validatedRequest.matchId,
          athleteId,
          teamId,
          validatedRequest.rejectionReason
        );
      case "COUNTER":
        return await counterPropose(validatedRequest, athleteId, teamId);
      case "DELETE":
        return await deleteChallenge(validatedRequest.matchId, teamId);
      default:
        return {
          success: false,
          action: request.action,
          message: "",
          error: "Invalid action",
        };
    }
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "handleChallengeAction",
      "Action failed",
      error,
      userId || undefined,
      request.matchId,
      { request }
    );

    perf.end();

    return {
      success: false,
      action: request.action,
      message: "",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// ============================================
// ACCEPT CHALLENGE
// ============================================
async function acceptChallenge(
  matchId: string,
  athleteId: string,
  teamId: string
): Promise<ChallengeActionResponse> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the match first to access proposedStart and proposedLocation
      const match = await tx.teamMatch.findUnique({
        where: { id: matchId, challengedTeamId: teamId },
        select: {
          id: true,
          proposedStart: true,
          proposedLocation: true,
          challengerTeamId: true,
          challengedTeam: { select: { name: true } },
        },
      });

      if (!match) {
        throw new Error("Challenge not found or you don't have permission");
      }

      // Update match status to SCHEDULED
      await tx.teamMatch.update({
        where: { id: matchId },
        data: {
          status: "SCHEDULED",
          challengedAccepted: true,
          // Lock in the proposed details as final
          scheduledStart: match.proposedStart,
          locationName: match.proposedLocation,
        },
      });

      // Notify challenger team
      const challengerMembers = await tx.teamMembership.findMany({
        where: { teamId: match.challengerTeamId },
        select: { athleteId: true },
      });

      await tx.notification.createMany({
        data: challengerMembers.map((member) => ({
          athleteId: member.athleteId,
          actorId: athleteId,
          type: "TEAM_MATCH_ACCEPTED",
          title: "Challenge Accepted!",
          message: `${match.challengedTeam.name} has accepted your match challenge`,
          data: { matchId },
        })),
      });

      return match;
    });

    Logger.info("CHALLENGE_SYSTEM", "acceptChallenge", "Challenge accepted", {
      matchId,
      athleteId,
      teamId,
    });

    revalidatePath("/challenges/received");
    revalidatePath("/challenges");

    return {
      success: true,
      action: "ACCEPT",
      message: "Challenge accepted successfully!",
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "acceptChallenge",
      "Failed to accept challenge",
      error,
      undefined,
      matchId
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to accept challenge");
  }
}

// ============================================
// REJECT CHALLENGE
// ============================================
async function rejectChallenge(
  matchId: string,
  athleteId: string,
  teamId: string,
  reason?: string
): Promise<ChallengeActionResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      // Get the match first
      const match = await tx.teamMatch.findUnique({
        where: { id: matchId, challengedTeamId: teamId },
        select: {
          challengerTeamId: true,
          challengedTeam: { select: { name: true } },
        },
      });

      if (!match) {
        throw new Error("Challenge not found or you don't have permission");
      }

      // Update match status to REJECTED
      await tx.teamMatch.update({
        where: { id: matchId },
        data: {
          status: "REJECTED",
        },
      });

      // Notify challenger team
      const challengerMembers = await tx.teamMembership.findMany({
        where: { teamId: match.challengerTeamId },
        select: { athleteId: true },
      });

      await tx.notification.createMany({
        data: challengerMembers.map((member) => ({
          athleteId: member.athleteId,
          actorId: athleteId,
          type: "TEAM_MATCH_CHALLENGE",
          title: "Challenge Rejected",
          message:
            reason ||
            `${match.challengedTeam.name} has rejected your match challenge`,
          data: { matchId, reason },
        })),
      });
    });

    Logger.info("CHALLENGE_SYSTEM", "rejectChallenge", "Challenge rejected", {
      matchId,
      athleteId,
      teamId,
      reason,
    });

    revalidatePath("/challenges/received");

    return {
      success: true,
      action: "REJECT",
      message: "Challenge rejected",
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "rejectChallenge",
      "Failed to reject challenge",
      error,
      undefined,
      matchId
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to reject challenge");
  }
}

// ============================================
// COUNTER PROPOSE
// ============================================
async function counterPropose(
  request: ChallengeActionRequest,
  athleteId: string,
  teamId: string
): Promise<ChallengeActionResponse> {
  try {
    // Build proposed start datetime
    let proposedStart: Date | null = null;
    if (request.proposedDate) {
      proposedStart = new Date(request.proposedDate);
      if (request.proposedTime) {
        const [hours, minutes] = request.proposedTime.split(":");
        proposedStart.setHours(parseInt(hours), parseInt(minutes));
      }
    }

    let proposedEnd: Date | null = null;
    if (proposedStart && request.matchDurationMinutes) {
      proposedEnd = new Date(
        proposedStart.getTime() + request.matchDurationMinutes * 60 * 1000
      );
    }

    await prisma.$transaction(async (tx) => {
      // Get the match first
      const match = await tx.teamMatch.findUnique({
        where: { id: request.matchId, challengedTeamId: teamId },
        select: {
          challengerTeamId: true,
          challengedTeam: { select: { name: true } },
        },
      });

      if (!match) {
        throw new Error("Challenge not found or you don't have permission");
      }

      // Update match with new proposal
      await tx.teamMatch.update({
        where: { id: request.matchId },
        data: {
          status: "SCHEDULING",
          proposedStart,
          proposedEnd,
          proposedLocation: request.proposedLocation,
          proposedLatitude: request.proposedLatitude,
          proposedLongitude: request.proposedLongitude,
          matchLengthMinutes: request.matchDurationMinutes,
          // Reset acceptances for negotiation
          challengerAccepted: false,
          challengedAccepted: true,
        },
      });

      // Notify challenger team
      const challengerMembers = await tx.teamMembership.findMany({
        where: { teamId: match.challengerTeamId },
        select: { athleteId: true },
      });

      await tx.notification.createMany({
        data: challengerMembers.map((member) => ({
          athleteId: member.athleteId,
          actorId: athleteId,
          type: "TEAM_MATCH_CHALLENGE",
          title: "Counter-Proposal Received",
          message: `${match.challengedTeam.name} has proposed different match details`,
          data: { matchId: request.matchId, message: request.counterMessage },
        })),
      });
    });

    Logger.info("CHALLENGE_SYSTEM", "counterPropose", "Counter-proposal sent", {
      matchId: request.matchId,
      athleteId,
      teamId,
    });

    revalidatePath("/challenges/received");
    revalidatePath("/challenges");

    return {
      success: true,
      action: "COUNTER",
      message: "Counter-proposal sent successfully!",
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "counterPropose",
      "Failed to send counter-proposal",
      error,
      undefined,
      request.matchId
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to send counter-proposal");
  }
}

// ============================================
// DELETE CHALLENGE
// ============================================
async function deleteChallenge(
  matchId: string,
  teamId: string
): Promise<ChallengeActionResponse> {
  try {
    await prisma.teamMatch.delete({
      where: {
        id: matchId,
        challengedTeamId: teamId,
      },
    });

    Logger.info("CHALLENGE_SYSTEM", "deleteChallenge", "Challenge deleted", {
      matchId,
      teamId,
    });

    revalidatePath("/challenges/received");

    return {
      success: true,
      action: "DELETE",
      message: "Challenge removed",
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "deleteChallenge",
      "Failed to delete challenge",
      error,
      undefined,
      matchId
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to delete challenge");
  }
}
