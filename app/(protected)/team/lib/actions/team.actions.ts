// lib/actions/team.actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type {
  Team,
  TeamMembership,
  Athlete,
  TeamCounters,
} from "@prisma/client";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export type TeamWithDetails = Team & {
  owner: Pick<
    Athlete,
    "id" | "username" | "firstName" | "lastName" | "profileImage"
  >;
  overseerGuide: {
    id: string;
    user: Pick<Athlete, "username" | "firstName" | "lastName">;
  } | null;
  members: Array<
    TeamMembership & {
      athlete: Pick<
        Athlete,
        | "id"
        | "username"
        | "firstName"
        | "lastName"
        | "profileImage"
        | "primarySport"
        | "rank"
        | "class"
      >;
    }
  >;
  counters: TeamCounters | null;
  _count: {
    invitations: number;
    joinRequests: number;
  };
};

/**
 * Get team by ID with all relations
 */
export async function getTeamById(teamId: string): Promise<
  ActionResult<{
    team: TeamWithDetails;
    isOwner: boolean;
    isMember: boolean;
  }>
> {
  try {
    const { userId } = await auth();

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        overseerGuide: {
          select: {
            id: true,
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        members: {
          include: {
            athlete: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                primarySport: true,
                rank: true,
                class: true,
              },
            },
          },
          orderBy: [
            { role: "asc" }, // OWNER first
            { createdAt: "asc" },
          ],
        },
        counters: true,
        _count: {
          select: {
            invitations: true,
            joinRequests: true,
          },
        },
      },
    });

    if (!team) {
      return { success: false, error: "Team not found", code: "NOT_FOUND" };
    }

    let isOwner = false;
    let isMember = false;

    if (userId) {
      const athlete = await prisma.athlete.findUnique({
        where: { clerkUserId: userId },
        select: { id: true },
      });

      if (athlete) {
        isOwner = team.ownerId === athlete.id;
        isMember = team.members.some((m) => m.athleteId === athlete.id);
      }
    }

    console.log(
      "[GET_TEAM]",
      teamId,
      "isOwner:",
      isOwner,
      "isMember:",
      isMember
    );

    return {
      success: true,
      data: {
        team: team as TeamWithDetails,
        isOwner,
        isMember,
      },
    };
  } catch (error) {
    console.error("[GET_TEAM_ERROR]", error);
    return { success: false, error: "Failed to fetch team" };
  }
}

/**
 * Get current user's team (if they own one)
 */
export async function getMyTeam(): Promise<
  ActionResult<{ teamId: string } | null>
> {
  try {
    const { userId } = await auth();
    if (!userId)
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      include: {
        teamsOwned: {
          select: { id: true, status: true },
          where: {
            status: {
              notIn: ["REVOKED", "EXPIRED"],
            },
          },
        },
      },
    });

    if (!athlete) {
      return { success: false, error: "Athlete not found", code: "NOT_FOUND" };
    }

    const activeTeam = athlete.teamsOwned[0];

    return {
      success: true,
      data: activeTeam ? { teamId: activeTeam.id } : null,
    };
  } catch (error) {
    console.error("[GET_MY_TEAM_ERROR]", error);
    return { success: false, error: "Failed to fetch your team" };
  }
}
