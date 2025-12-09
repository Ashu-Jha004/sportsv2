"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Logger, PerformanceTracker } from "@/lib/logger/logger";
import { SentChallengeFiltersSchema } from "@/lib/validations/challenges/sent/sent-validation";
import { SentChallengeActionSchema } from "@/lib/validations/challenges/sent/sent-validation";
import { validateWithLogging } from "@/lib/validations/challenges/sent/validation";
import {
  SentChallengeFilters,
  SentChallengeCardData,
  SentChallengesResponse,
  SentChallengeActionRequest,
  SentChallengeActionResponse,
} from "@/types/challenges/challenge";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const CHALLENGES_PER_PAGE = 20;
const CHALLENGE_PENDING_TIMEOUT_DAYS = 7;

// ============================================
// GET SENT CHALLENGES
// ============================================
export async function getSentChallenges(
  filters: SentChallengeFilters,
  cursor?: string
): Promise<SentChallengesResponse> {
  const perf = new PerformanceTracker("getSentChallenges");
  let userId: string | null = null;

  try {
    // Authentication
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      Logger.warn(
        "AUTH",
        "getSentChallenges",
        "Unauthenticated access attempt"
      );
      throw new Error("Unauthorized: You must be logged in");
    }

    Logger.info(
      "CHALLENGE_SYSTEM",
      "getSentChallenges",
      "Fetching sent challenges",
      { userId, filters, cursor }
    );

    // Validate filters
    const validatedFilters = validateWithLogging(
      SentChallengeFiltersSchema,
      filters,
      "getSentChallenges",
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
        "getSentChallenges",
        "Athlete not found",
        new Error("Athlete not found"),
        userId
      );
      throw new Error("Athlete profile not found");
    }

    if (!currentAthlete.teamMembership) {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "getSentChallenges",
        "User not in a team",
        { userId, athleteId: currentAthlete.id }
      );
      throw new Error("You must be a member of a team to view challenges");
    }

    const userTeamId = currentAthlete.teamMembership.teamId;

    // Build where clause
    const whereClause: any = {
      challengerTeamId: userTeamId,
      status: {
        in: ["PENDING_CHALLENGE", "SCHEDULING", "SCHEDULED", "REJECTED"],
      },
    };

    // Apply filters
    if (validatedFilters.status && validatedFilters.status !== "ALL") {
      if (validatedFilters.status === "PENDING") {
        whereClause.status = "PENDING_CHALLENGE";
      } else if (validatedFilters.status === "NEGOTIATING") {
        whereClause.status = "SCHEDULING";
      } else if (validatedFilters.status === "ACCEPTED") {
        whereClause.status = "SCHEDULED";
      } else if (validatedFilters.status === "REJECTED") {
        whereClause.status = "REJECTED";
      }
    }

    if (validatedFilters.sport && validatedFilters.sport !== "ALL") {
      whereClause.challengedTeam = {
        sport: validatedFilters.sport as any,
      };
    }

    if (validatedFilters.teamName) {
      whereClause.challengedTeam = {
        ...whereClause.challengedTeam,
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
        challengedTeamId: true,
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
        challengedTeam: {
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

      // Determine if there's a counter-proposal
      const hasCounterProposal =
        challenge.status === "SCHEDULING" && !challenge.challengerAccepted;

      // They countered, awaiting your response
      const isAwaitingYourResponse = hasCounterProposal;

      return {
        matchId: challenge.id,
        challengedTeamId: challenge.challengedTeamId,
        challengedTeamName: challenge.challengedTeam.name,
        challengedTeamLogo: challenge.challengedTeam.logoUrl,
        challengedTeamSport: challenge.challengedTeam.sport,
        challengedTeamSchool: challenge.challengedTeam.TeamSchool,
        proposedDate: challenge.proposedStart,
        proposedTime,
        proposedLocation: challenge.proposedLocation || "",
        proposedLatitude: challenge.proposedLatitude,
        proposedLongitude: challenge.proposedLongitude,
        matchDurationMinutes: challenge.matchLengthMinutes,
        // For now, we'll store original in the same fields
        // In production, you'd want a separate table for negotiation history
        originalProposedDate: challenge.proposedStart,
        originalProposedTime: proposedTime,
        originalProposedLocation: challenge.proposedLocation || "",
        originalMatchDurationMinutes: challenge.matchLengthMinutes,
        status: challenge.status,
        challengerAccepted: challenge.challengerAccepted,
        challengedAccepted: challenge.challengedAccepted,
        hasCounterProposal,
        isAwaitingYourResponse,
        lastModifiedBy: null,
        rejectionReason: null, // Would need to store this
        createdAt,
        daysRemaining: Math.max(0, daysRemaining),
        isExpiringSoon: daysRemaining <= 2 && daysRemaining > 0,
      };
    });

    Logger.info(
      "CHALLENGE_SYSTEM",
      "getSentChallenges",
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
      "getSentChallenges",
      "Failed to fetch sent challenges",
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
// HANDLE SENT CHALLENGE ACTION
// ============================================
export async function handleSentChallengeAction(
  request: SentChallengeActionRequest
): Promise<SentChallengeActionResponse> {
  const perf = new PerformanceTracker("handleSentChallengeAction");
  let userId: string | null = null;

  try {
    // Authentication
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      Logger.warn(
        "AUTH",
        "handleSentChallengeAction",
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
      "handleSentChallengeAction",
      "Processing action",
      {
        userId,
        matchId: request.matchId,
        action: request.action,
      }
    );

    // Validate request
    const validatedRequest = validateWithLogging(
      SentChallengeActionSchema,
      request,
      "handleSentChallengeAction",
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
        "handleSentChallengeAction",
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
        "handleSentChallengeAction",
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
      case "ACCEPT_COUNTER":
        return await acceptCounterProposal(
          validatedRequest.matchId,
          athleteId,
          teamId
        );
      case "COUNTER_AGAIN":
        return await counterProposeAgain(validatedRequest, athleteId, teamId);
      case "CANCEL":
        return await cancelChallenge(
          validatedRequest.matchId,
          athleteId,
          teamId
        );
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
      "handleSentChallengeAction",
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
// ACCEPT COUNTER PROPOSAL
// ============================================
async function acceptCounterProposal(
  matchId: string,
  athleteId: string,
  teamId: string
): Promise<SentChallengeActionResponse> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the match first
      const match = await tx.teamMatch.findUnique({
        where: { id: matchId, challengerTeamId: teamId },
        select: {
          id: true,
          proposedStart: true,
          proposedLocation: true,
          challengedTeamId: true,
          challengerTeam: { select: { name: true } },
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
          challengerAccepted: true,
          // Lock in the counter-proposed details as final
          scheduledStart: match.proposedStart,
          locationName: match.proposedLocation,
        },
      });

      // Notify challenged team
      const challengedMembers = await tx.teamMembership.findMany({
        where: { teamId: match.challengedTeamId },
        select: { athleteId: true },
      });

      await tx.notification.createMany({
        data: challengedMembers.map((member) => ({
          athleteId: member.athleteId,
          actorId: athleteId,
          type: "TEAM_MATCH_ACCEPTED",
          title: "Counter-Proposal Accepted!",
          message: `${match.challengerTeam.name} has accepted your counter-proposal`,
          data: { matchId },
        })),
      });

      return match;
    });

    Logger.info(
      "CHALLENGE_SYSTEM",
      "acceptCounterProposal",
      "Counter-proposal accepted",
      {
        matchId,
        athleteId,
        teamId,
      }
    );

    revalidatePath("/challenges/sent");
    revalidatePath("/challenges/received");

    return {
      success: true,
      action: "ACCEPT_COUNTER",
      message: "Counter-proposal accepted! Match is now scheduled.",
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "acceptCounterProposal",
      "Failed to accept counter-proposal",
      error,
      undefined,
      matchId
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to accept counter-proposal");
  }
}

// ============================================
// COUNTER PROPOSE AGAIN
// ============================================
async function counterProposeAgain(
  request: SentChallengeActionRequest,
  athleteId: string,
  teamId: string
): Promise<SentChallengeActionResponse> {
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
        where: { id: request.matchId, challengerTeamId: teamId },
        select: {
          challengedTeamId: true,
          challengerTeam: { select: { name: true } },
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
          challengerAccepted: true,
          challengedAccepted: false,
        },
      });

      // Notify challenged team
      const challengedMembers = await tx.teamMembership.findMany({
        where: { teamId: match.challengedTeamId },
        select: { athleteId: true },
      });

      await tx.notification.createMany({
        data: challengedMembers.map((member) => ({
          athleteId: member.athleteId,
          actorId: athleteId,
          type: "TEAM_MATCH_CHALLENGE",
          title: "New Counter-Proposal",
          message: `${match.challengerTeam.name} has proposed different match details`,
          data: { matchId: request.matchId, message: request.counterMessage },
        })),
      });
    });

    Logger.info(
      "CHALLENGE_SYSTEM",
      "counterProposeAgain",
      "Counter-proposal sent",
      {
        matchId: request.matchId,
        athleteId,
        teamId,
      }
    );

    revalidatePath("/challenges/sent");
    revalidatePath("/challenges/received");

    return {
      success: true,
      action: "COUNTER_AGAIN",
      message: "Counter-proposal sent successfully!",
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "counterProposeAgain",
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
// CANCEL CHALLENGE
// ============================================
async function cancelChallenge(
  matchId: string,
  athleteId: string,
  teamId: string
): Promise<SentChallengeActionResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      // Get the match first
      const match = await tx.teamMatch.findUnique({
        where: { id: matchId, challengerTeamId: teamId },
        select: {
          challengedTeamId: true,
          challengerTeam: { select: { name: true } },
          status: true,
        },
      });

      if (!match) {
        throw new Error("Challenge not found or you don't have permission");
      }

      // Can only cancel if not yet accepted
      if (match.status === "SCHEDULED") {
        throw new Error(
          "Cannot cancel an accepted challenge. Contact the opponent to reschedule."
        );
      }

      // Delete the challenge
      await tx.teamMatch.delete({
        where: { id: matchId },
      });

      // Optionally notify challenged team (if they haven't rejected it)
      if (match.status !== "REJECTED") {
        const challengedMembers = await tx.teamMembership.findMany({
          where: { teamId: match.challengedTeamId },
          select: { athleteId: true },
        });

        await tx.notification.createMany({
          data: challengedMembers.map((member) => ({
            athleteId: member.athleteId,
            actorId: athleteId,
            type: "TEAM_MATCH_CHALLENGE",
            title: "Challenge Cancelled",
            message: `${match.challengerTeam.name} has cancelled their match challenge`,
            data: { matchId },
          })),
        });
      }
    });

    Logger.info("CHALLENGE_SYSTEM", "cancelChallenge", "Challenge cancelled", {
      matchId,
      athleteId,
      teamId,
    });

    revalidatePath("/challenges/sent");
    revalidatePath("/challenges/received");

    return {
      success: true,
      action: "CANCEL",
      message: "Challenge cancelled successfully",
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "cancelChallenge",
      "Failed to cancel challenge",
      error,
      undefined,
      matchId
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to cancel challenge");
  }
}
