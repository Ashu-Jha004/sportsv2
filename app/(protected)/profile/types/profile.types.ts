// types/profile.types.ts

export type RankType = "Pawn" | "Knight" | "Bishop" | "Rook" | "Queen" | "King";
export type ClassType = "A" | "B" | "C" | "D";
export type GenderType = "Male" | "Female" | "Other" | "Prefer not to say";

export interface ProfileStats {
  followers: number;
  following: number;
  wins: number;
  losses: number;
  totalMatches: number;
}

export interface ProfileData {
  id: string;
  username: string;
  fullName: string;
  profilePhoto: string;
  bannerImage: string;
  sports: string[];
  bio: string;
  rank: RankType;
  class: ClassType;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  stats: ProfileStats;
  personalInfo: PersonalInfo;
  sportsInfo: SportsInfo;
}

export interface Location {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}
export interface PersonalInfo {
  fullName: string;
  username: string;
  email: string;
  gender: GenderType;
  dateOfBirth: string; // ISO format
  joinedDate: string; // ISO format
  lastUpdated: string; // ISO format
}

export interface SportsInfo {
  primarySport: string; // Main sport competing in
  secondarySports: string[]; // Other sports interested in
}
