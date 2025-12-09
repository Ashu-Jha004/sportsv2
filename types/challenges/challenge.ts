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

// ============================================
// RECEIVED CHALLENGES
// ============================================

export interface ReceivedChallengeFilters {
  status?: "PENDING" | "NEGOTIATING" | "ALL";
  sport?: Sport | "ALL";
  teamName?: string;
}

export interface ReceivedChallengeCardData {
  matchId: string;
  challengerTeamId: string;
  challengerTeamName: string;
  challengerTeamLogo: string | null;
  challengerTeamSport: Sport;
  challengerTeamSchool: string | null;
  // Match Details
  proposedDate: Date | null;
  proposedTime: string | null;
  proposedLocation: string;
  proposedLatitude: number | null;
  proposedLongitude: number | null;
  matchDurationMinutes: number | null;
  messageFromChallenger: string | null;
  // Status
  status: "PENDING_CHALLENGE" | "SCHEDULING";
  challengerAccepted: boolean;
  challengedAccepted: boolean;
  // Negotiation tracking
  negotiationCount: number;
  lastModifiedBy: string | null;
  // Metadata
  createdAt: Date;
  daysRemaining: number;
  isExpiringSoon: boolean; // < 2 days
}

export interface ReceivedChallengesResponse {
  challenges: ReceivedChallengeCardData[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ChallengeActionRequest {
  matchId: string;
  action: "ACCEPT" | "REJECT" | "COUNTER" | "DELETE";
  // For REJECT
  rejectionReason?: string;
  // For COUNTER
  proposedDate?: Date | null;
  proposedTime?: string;
  proposedLocation?: string;
  proposedLatitude?: number | null;
  proposedLongitude?: number | null;
  matchDurationMinutes?: number | null;
  counterMessage?: string;
}

export interface ChallengeActionResponse {
  success: boolean;
  action: string;
  message: string;
  error?: string;
}

export interface NegotiationHistory {
  id: string;
  matchId: string;
  modifiedBy: string;
  modifiedByTeamName: string;
  action: string;
  proposedDate: Date | null;
  proposedTime: string | null;
  proposedLocation: string;
  matchDurationMinutes: number | null;
  message: string | null;
  createdAt: Date;
}
