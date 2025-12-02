// lib/types/team.ts
import {
  Athlete,
  Team,
  TeamMembership,
  TeamMemberRole,
  TeamStatus,
} from "@prisma/client";

// Enhanced Team type with all relations
export interface TeamWithRelations extends Team {
  owner: Athlete & { rank: string; class: string };
  overseerGuide?: {
    id: string;
    guideEmail: string | null;
    PrimarySports: string | null;
    city: string | null;
    country: string | null;
  };
  members: (Athlete & {
    TeamMembership: {
      role: TeamMemberRole;
      isCaptain: boolean;
    };
  })[];
  counters?: {
    membersCount: number;
    postsCount: number;
    matchesPlayed: number;
  };
  recentPosts?: Array<{
    id: string;
    type: string;
    title: string | null;
    content: string | null;
    mediaUrls: string[];
    createdAt: Date;
    author: Pick<
      Athlete,
      "id" | "username" | "firstName" | "lastName" | "profileImage"
    >;
  }>;
  upcomingMatches?: Array<{
    id: string;
    status: string;
    scheduledStart: Date | null;
    challengerTeam: Pick<Team, "id" | "name" | "logoUrl">;
    challengedTeam: Pick<Team, "id" | "name" | "logoUrl">;
  }>;
}

// Athlete preview for invite dialog
export interface AthletePreview {
  id: string;
  clerkUserId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  profileImage?: string | null;
  primarySport?: string | null;
  secondarySport?: string | null;
  rank: string;
  class: string;
  country?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  teamMembership?: { teamId: string } | null; // null if free agent
  distanceKm?: number; // Calculated via Haversine
}

// Pending invite for dialog
export interface PendingInvite {
  id: string;
  invitedAthleteId: string;
  invitedAthlete: Pick<
    AthletePreview,
    "id" | "username" | "firstName" | "lastName" | "profileImage"
  >;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  createdAt: Date;
  expiresAt?: Date;
}

// Team permissions
export type TeamRole = "OWNER" | "CAPTAIN" | "PLAYER" | "MANAGER" | "VISITOR";
export interface TeamPermissions {
  isOwner: boolean;
  isCaptain: boolean;
  isMember: boolean;
  canInvite: boolean;
  canManageRequests: boolean;
  canEdit: boolean;
  canCreatePost: boolean;
  canChallenge: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  debug?: {
    queryTime: number;
    rowCount: number;
    prismaQuery: string;
  };
}
