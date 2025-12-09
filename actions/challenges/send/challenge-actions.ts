"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Logger, PerformanceTracker } from "@/lib/logger/logger";
import {
  validateWithLogging,
  CreateChallengeSchema,
  ChallengeFiltersSchema,
} from "@/lib/validations/challenges/sent/validation";
import {
  ChallengeTeamCardData,
  ChallengeTeamsResponse,
  ChallengeFilters,
  CreateChallengeRequest,
  ChallengePermissions,
  TeamMemberForSelection,
} from "@/types/challenges/challenge";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const TEAMS_PER_PAGE = 20;
const CHALLENGE_PENDING_TIMEOUT_DAYS = 7;

// ============================================
// GET CHALLENGEABLE TEAMS
// ============================================
export async function getChallengeableTeams(
  filters: ChallengeFilters,
  cursor?: string
): Promise<ChallengeTeamsResponse> {
  const perf = new PerformanceTracker("getChallengeableTeams");
  let userId: string | null = null;

  try {
    // Step 1: Authentication
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      Logger.warn(
        "AUTH",
        "getChallengeableTeams",
        "Unauthenticated access attempt"
      );
      throw new Error("Unauthorized: You must be logged in");
    }

    Logger.info(
      "CHALLENGE_SYSTEM",
      "getChallengeableTeams",
      "Fetching challengeable teams",
      { userId, filters, cursor }
    );

    // Step 2: Validate filters
    const validatedFilters = validateWithLogging(
      ChallengeFiltersSchema,
      filters,
      "getChallengeableTeams",
      userId
    );

    // Step 3: Get current athlete and their team
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
                sport: true,
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
        "getChallengeableTeams",
        "Athlete not found",
        new Error("Athlete not found"),
        userId
      );
      throw new Error("Athlete profile not found");
    }

    if (!currentAthlete.teamMembership) {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "getChallengeableTeams",
        "User not in a team",
        { userId, athleteId: currentAthlete.id }
      );
      throw new Error("You must be a member of a team to challenge others");
    }

    const userTeamId = currentAthlete.teamMembership.teamId;
    const userTeamSport = currentAthlete.teamMembership.team.sport;
    const userTeamStatus = currentAthlete.teamMembership.team.status;

    // Check if user's team is active
    if (userTeamStatus !== "ACTIVE") {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "getChallengeableTeams",
        "Team not active",
        {
          userId,
          teamId: userTeamId,
          status: userTeamStatus,
        }
      );
      throw new Error("Your team must be active to challenge others");
    }

    Logger.debug(
      "CHALLENGE_SYSTEM",
      "getChallengeableTeams",
      "User team verified",
      { teamId: userTeamId, sport: userTeamSport }
    );

    // Step 4: Get pending challenges
    const pendingChallenges = await prisma.teamMatch.findMany({
      where: {
        challengerTeamId: userTeamId,
        status: "PENDING_CHALLENGE",
        createdAt: {
          gte: new Date(
            Date.now() - CHALLENGE_PENDING_TIMEOUT_DAYS * 24 * 60 * 60 * 1000
          ),
        },
      },
      select: {
        challengedTeamId: true,
        id: true,
      },
    });

    const pendingChallengeTeamIds = pendingChallenges.map(
      (c) => c.challengedTeamId
    );

    Logger.debug(
      "CHALLENGE_SYSTEM",
      "getChallengeableTeams",
      "Pending challenges found",
      { count: pendingChallenges.length, teamIds: pendingChallengeTeamIds }
    );

    // Step 5: Build where clause
    const whereClause: Prisma.TeamWhereInput = {
      sport: userTeamSport,
      id: {
        not: userTeamId,
        notIn: pendingChallengeTeamIds,
      },
      status: "ACTIVE",
    };

    if (validatedFilters.schoolName) {
      whereClause.TeamSchool = {
        contains: validatedFilters.schoolName,
        mode: "insensitive",
      };
    }

    if (validatedFilters.teamName) {
      whereClause.name = {
        contains: validatedFilters.teamName,
        mode: "insensitive",
      };
    }

    if (validatedFilters.sport && validatedFilters.sport !== "ALL") {
      whereClause.sport = validatedFilters.sport as any;
    }

    if (cursor) {
      whereClause.id = { lt: cursor };
    }

    // Step 6: Fetch teams
    const teams = await prisma.team.findMany({
      where: whereClause,
      take: TEAMS_PER_PAGE + 1,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        sport: true,
        TeamSchool: true,
        class: true,
        rank: true,
        city: true,
        state: true,
        country: true,
        counters: {
          select: {
            membersCount: true,
            matchesPlayed: true,
          },
        },
        matchesWon: {
          select: { id: true },
        },
        matchesLost: {
          select: { id: true },
        },
      },
    });

    const hasMore = teams.length > TEAMS_PER_PAGE;
    const teamsToReturn = hasMore ? teams.slice(0, TEAMS_PER_PAGE) : teams;

    const teamCards: ChallengeTeamCardData[] = teamsToReturn.map((team) => ({
      id: team.id,
      name: team.name,
      logoUrl: team.logoUrl,
      sport: team.sport,
      TeamSchool: team.TeamSchool,
      class: team.class,
      rank: team.rank,
      city: team.city,
      state: team.state,
      country: team.country,
      membersCount: team.counters?.membersCount || 0,
      matchesPlayed: team.counters?.matchesPlayed || 0,
      wins: team.matchesWon.length,
      losses: team.matchesLost.length,
      hasPendingChallenge: false,
    }));

    Logger.info(
      "CHALLENGE_SYSTEM",
      "getChallengeableTeams",
      "Successfully fetched teams",
      { count: teamCards.length, hasMore, userId, teamId: userTeamId }
    );

    perf.end();

    return {
      teams: teamCards,
      hasMore,
      nextCursor: hasMore
        ? teamsToReturn[teamsToReturn.length - 1].id
        : undefined,
    };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "getChallengeableTeams",
      "Failed to fetch challengeable teams",
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
      "An unexpected error occurred while fetching teams. Please try again."
    );
  }
}

// ============================================
// CHECK CHALLENGE PERMISSIONS
// ============================================
export async function checkChallengePermissions(): Promise<ChallengePermissions> {
  const perf = new PerformanceTracker("checkChallengePermissions");
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      Logger.warn(
        "AUTH",
        "checkChallengePermissions",
        "Unauthenticated permission check"
      );
      return { canChallenge: false, reason: "You must be logged in" };
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        teamMembership: {
          select: {
            role: true,
            teamId: true,
          },
        },
      },
    });

    if (!athlete) {
      Logger.error(
        "DATABASE",
        "checkChallengePermissions",
        "Athlete not found",
        new Error("Athlete not found"),
        userId
      );
      return { canChallenge: false, reason: "Athlete profile not found" };
    }

    if (!athlete.teamMembership) {
      return {
        canChallenge: false,
        reason: "You must be a member of a team",
      };
    }

    const role = athlete.teamMembership.role;
    if (role !== "OWNER" && role !== "CAPTAIN") {
      return {
        canChallenge: false,
        reason: "Only team owners and captains can send challenges",
        userRole: role,
      };
    }

    Logger.info(
      "CHALLENGE_SYSTEM",
      "checkChallengePermissions",
      "Permission granted",
      { userId, role }
    );

    perf.end();
    return { canChallenge: true, userRole: role };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "checkChallengePermissions",
      "Permission check failed",
      error,
      userId || undefined
    );
    perf.end();
    return { canChallenge: false, reason: "Failed to check permissions" };
  }
}

// ============================================
// GET TEAM MEMBERS FOR SELECTION
// ============================================
export async function getTeamMembersForChallenge(): Promise<
  TeamMemberForSelection[]
> {
  const perf = new PerformanceTracker("getTeamMembersForChallenge");
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      Logger.warn(
        "AUTH",
        "getTeamMembersForChallenge",
        "Unauthenticated access"
      );
      throw new Error("Unauthorized");
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: {
        teamMembership: {
          select: {
            teamId: true,
            team: {
              select: {
                members: {
                  select: {
                    id: true,
                    athleteId: true,
                    role: true,
                    athlete: {
                      select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                        profileImage: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!athlete?.teamMembership) {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "getTeamMembersForChallenge",
        "User not in team",
        { userId }
      );
      throw new Error("You are not a member of any team");
    }

    const members: TeamMemberForSelection[] =
      athlete.teamMembership.team.members.map((member) => ({
        id: member.id,
        athleteId: member.athleteId,
        athleteName:
          member.athlete.firstName && member.athlete.lastName
            ? `${member.athlete.firstName} ${member.athlete.lastName}`
            : member.athlete.username || "Unknown",
        profileImage: member.athlete.profileImage,
        role: member.role,
        isSelected: true,
        isStarter: member.role === "OWNER" || member.role === "CAPTAIN",
      }));

    Logger.info(
      "CHALLENGE_SYSTEM",
      "getTeamMembersForChallenge",
      "Fetched team members",
      { userId, count: members.length }
    );

    perf.end();
    return members;
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "getTeamMembersForChallenge",
      "Failed to fetch team members",
      error,
      userId || undefined
    );
    perf.end();
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch team members"
    );
  }
}

// ============================================
// CREATE CHALLENGE
// ============================================
export async function createChallenge(
  request: CreateChallengeRequest
): Promise<{ success: boolean; matchId?: string; error?: string }> {
  const perf = new PerformanceTracker("createChallenge");
  let userId: string | null = null;
  let athleteId: string | null = null;

  try {
    // Authentication
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      Logger.warn(
        "AUTH",
        "createChallenge",
        "Unauthenticated challenge attempt"
      );
      return { success: false, error: "You must be logged in" };
    }

    Logger.info("CHALLENGE_SYSTEM", "createChallenge", "Creating challenge", {
      userId,
      challengedTeamId: request.challengedTeamId,
    });

    // Get athlete with team membership FIRST
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        teamMembership: {
          select: {
            role: true,
            teamId: true,
            team: {
              select: {
                name: true,
                sport: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!athlete) {
      Logger.error(
        "DATABASE",
        "createChallenge",
        "Athlete not found",
        new Error("Athlete not found"),
        userId
      );
      return { success: false, error: "Athlete profile not found" };
    }

    athleteId = athlete.id;

    if (!athlete.teamMembership) {
      Logger.warn("CHALLENGE_SYSTEM", "createChallenge", "User not in team", {
        userId,
        athleteId,
      });
      return { success: false, error: "You are not a member of any team" };
    }

    // ✅ KEY FIX: Get the ACTUAL team ID from user's membership
    const actualChallengerTeamId = athlete.teamMembership.teamId;

    // Override the request with actual team ID
    const validatedRequest = {
      ...request,
      challengerTeamId: actualChallengerTeamId,
    };

    Logger.debug(
      "CHALLENGE_SYSTEM",
      "createChallenge",
      "Using actual team ID",
      {
        userId,
        athleteId,
        actualChallengerTeamId,
        requestedTeamId: request.challengerTeamId,
      }
    );

    // Validate the corrected request
    const finalValidatedRequest = validateWithLogging(
      CreateChallengeSchema,
      validatedRequest,
      "createChallenge",
      userId
    );

    // Permission check
    const role = athlete.teamMembership.role;
    if (role !== "OWNER" && role !== "CAPTAIN") {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "createChallenge",
        "Insufficient permissions",
        { userId, athleteId, role }
      );
      return {
        success: false,
        error: "Only team owners and captains can send challenges",
      };
    }

    // Check team status
    if (athlete.teamMembership.team.status !== "ACTIVE") {
      Logger.warn("CHALLENGE_SYSTEM", "createChallenge", "Team not active", {
        userId,
        teamId: actualChallengerTeamId,
        status: athlete.teamMembership.team.status,
      });
      return {
        success: false,
        error: "Your team must be active to challenge others",
      };
    }

    // Verify not challenging own team
    if (actualChallengerTeamId === finalValidatedRequest.challengedTeamId) {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "createChallenge",
        "Self-challenge attempt",
        {
          userId,
          teamId: actualChallengerTeamId,
        }
      );
      return { success: false, error: "Cannot challenge your own team" };
    }

    // Verify challenged team
    const challengedTeam = await prisma.team.findUnique({
      where: { id: finalValidatedRequest.challengedTeamId },
      select: { id: true, sport: true, status: true, name: true },
    });

    if (!challengedTeam) {
      Logger.error(
        "DATABASE",
        "createChallenge",
        "Challenged team not found",
        new Error("Team not found"),
        userId,
        finalValidatedRequest.challengedTeamId
      );
      return { success: false, error: "Challenged team not found" };
    }

    if (challengedTeam.status !== "ACTIVE") {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "createChallenge",
        "Challenged team not active",
        {
          userId,
          challengedTeamId: challengedTeam.id,
          status: challengedTeam.status,
        }
      );
      return { success: false, error: "Challenged team is not active" };
    }

    // Verify same sport
    if (challengedTeam.sport !== athlete.teamMembership.team.sport) {
      Logger.warn("CHALLENGE_SYSTEM", "createChallenge", "Sport mismatch", {
        userId,
        challengerSport: athlete.teamMembership.team.sport,
        challengedSport: challengedTeam.sport,
      });
      return {
        success: false,
        error: "Can only challenge teams of the same sport",
      };
    }

    // Check for existing pending challenge
    const existingChallenge = await prisma.teamMatch.findFirst({
      where: {
        challengerTeamId: actualChallengerTeamId,
        challengedTeamId: finalValidatedRequest.challengedTeamId,
        status: "PENDING_CHALLENGE",
        createdAt: {
          gte: new Date(
            Date.now() - CHALLENGE_PENDING_TIMEOUT_DAYS * 24 * 60 * 60 * 1000
          ),
        },
      },
    });

    if (existingChallenge) {
      Logger.warn(
        "CHALLENGE_SYSTEM",
        "createChallenge",
        "Duplicate challenge attempt",
        { userId, existingChallengeId: existingChallenge.id }
      );
      return {
        success: false,
        error: "You already have a pending challenge with this team",
      };
    }

    // Calculate proposed end time
    let proposedEnd = finalValidatedRequest.proposedEnd;
    if (
      finalValidatedRequest.proposedStart &&
      finalValidatedRequest.matchLengthMinutes
    ) {
      proposedEnd = new Date(
        finalValidatedRequest.proposedStart.getTime() +
          finalValidatedRequest.matchLengthMinutes * 60 * 1000
      );
    }

    // Create match in transaction
    const result = await prisma.$transaction(async (tx) => {
      const match = await tx.teamMatch.create({
        data: {
          challengerTeamId: actualChallengerTeamId,
          challengedTeamId: finalValidatedRequest.challengedTeamId,
          createdById: athleteId!,
          status: "PENDING_CHALLENGE",
          challengerAccepted: true,
          challengedAccepted: false,
          proposedStart: finalValidatedRequest.proposedStart,
          proposedEnd: proposedEnd,
          proposedLocation: finalValidatedRequest.proposedLocation,
          proposedLatitude: finalValidatedRequest.proposedLatitude,
          proposedLongitude: finalValidatedRequest.proposedLongitude,
          matchLengthMinutes: finalValidatedRequest.matchLengthMinutes,
        },
      });

      // Create participants
      if (finalValidatedRequest.participants.length > 0) {
        await tx.teamMatchParticipant.createMany({
          data: finalValidatedRequest.participants.map((p) => ({
            matchId: match.id,
            athleteId: p.athleteId,
            teamId: actualChallengerTeamId,
            isStarter: p.isStarter,
          })),
        });
      }

      // Get challenged team members
      const challengedTeamMembers = await tx.teamMembership.findMany({
        where: { teamId: finalValidatedRequest.challengedTeamId },
        select: { athleteId: true },
      });

      // Create notifications
      await tx.notification.createMany({
        data: challengedTeamMembers.map((member) => ({
          athleteId: member.athleteId,
          actorId: athleteId!,
          type: "TEAM_MATCH_CHALLENGE",
          title: "New Match Challenge!",
          message:
            finalValidatedRequest.messageToOpponent ||
            `${
              athlete.teamMembership!.team.name
            } has challenged your team to a match`,
          data: {
            matchId: match.id,
            challengerTeamId: actualChallengerTeamId,
            challengerTeamName: athlete.teamMembership!.team.name,
            challengedTeamName: challengedTeam.name,
            message: finalValidatedRequest.messageToOpponent,
          },
        })),
      });

      return match;
    });

    Logger.info(
      "CHALLENGE_SYSTEM",
      "createChallenge",
      "Challenge created successfully",
      {
        userId,
        athleteId,
        matchId: result.id,
        challengerTeamId: actualChallengerTeamId,
        challengedTeamId: finalValidatedRequest.challengedTeamId,
        notificationsSent: true,
      }
    );

    revalidatePath("/challenges");
    perf.end();

    return { success: true, matchId: result.id };
  } catch (error) {
    Logger.error(
      "CHALLENGE_SYSTEM",
      "createChallenge",
      "Failed to create challenge",
      error,
      userId || undefined,
      athleteId || undefined,
      { request }
    );

    perf.end();

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
