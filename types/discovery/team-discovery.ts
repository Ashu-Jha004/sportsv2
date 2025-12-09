import { Class, Rank, Sport } from "@prisma/client";

export interface TeamDiscoveryFilters {
  schoolName?: string;
  teamName?: string;
  sport?: Sport | "ALL";
}

export interface TeamCardData {
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
  // User-specific status
  isCurrentUserMember: boolean;
  hasPendingJoinRequest: boolean;
  teamApplicationId: string | null; // for navigation
}

export interface TeamDiscoveryResponse {
  teams: TeamCardData[];
  hasMore: boolean;
  nextCursor?: string;
}
