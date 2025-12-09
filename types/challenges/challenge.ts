import { Class, Rank, Sport, TeamMatchStatus } from "@prisma/client";

export interface ChallengeFilters {
  schoolName?: string;
  teamName?: string;
  sport?: Sport | "ALL";
}

export interface ChallengeTeamCardData {
  id: string;
  name: string;
  logoUrl: string | null;
  sport: Sport;
  TeamSchool: string | null;
  class: Class | null;
  rank: Rank | null;
  city: string | null;
  state: string | null;
  country: string | null;
  membersCount: number;
  matchesPlayed: number;
  // Win/loss records
  wins: number;
  losses: number;
  // Challenge status
  hasPendingChallenge: boolean;
  pendingChallengeId?: string;
}

export interface ChallengeTeamsResponse {
  teams: ChallengeTeamCardData[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface TeamMemberForSelection {
  id: string;
  athleteId: string;
  athleteName: string;
  profileImage: string | null;
  role: string;
  isSelected: boolean;
  isStarter: boolean;
}

export interface ChallengeWizardData {
  // Step 1 - Team Selection
  targetTeamId: string;
  targetTeamName: string;
  targetTeamLogo: string | null;
  targetTeamSport: Sport;

  // Step 2 - Match Details
  proposedDate: Date | null;
  proposedTime: string;
  proposedLocation: string;
  proposedLatitude: number | null;
  proposedLongitude: number | null;
  matchDurationMinutes: number | null;
  messageToOpponent: string;

  // Step 3 - Participants
  selectedParticipants: TeamMemberForSelection[];

  // Wizard state
  currentStep: 1 | 2 | 3 | 4;
  isSubmitting: boolean;
}

export interface CreateChallengeRequest {
  challengerTeamId: string;
  challengedTeamId: string;
  proposedStart: Date | null;
  proposedEnd: Date | null;
  proposedLocation: string;
  proposedLatitude: number | null;
  proposedLongitude: number | null;
  matchLengthMinutes: number | null;
  messageToOpponent: string;
  participants: {
    athleteId: string;
    isStarter: boolean;
  }[];
}

export interface ChallengePermissions {
  canChallenge: boolean;
  reason?: string; // Why they can't challenge
  userRole?: string;
}
