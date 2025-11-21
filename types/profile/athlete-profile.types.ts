// types/athlete-profile.types.ts

/**
 * =============================================================================
 * ATHLETE PROFILE TYPES
 * =============================================================================
 * TypeScript definitions for athlete profile data structures
 */

// =============================================================================
// ENUMS
// =============================================================================

export enum Sport {
  FOOTBALL = "FOOTBALL",
  BASKETBALL = "BASKETBALL",
  TENNIS = "TENNIS",
  CRICKET = "CRICKET",
  SOCCER = "SOCCER",
  VOLLEYBALL = "VOLLEYBALL",
  OTHER = "OTHER",
  // ... add all your sports
}
export type Rank = "PAWN" | "KNIGHT" | "BISHOP" | "ROOK" | "QUEEN" | "KING";
export type Class = "E" | "D" | "C" | "B" | "A" | "S";
export type Gender = "MALE" | "FEMALE" | "OTHER";

// =============================================================================
// ATHLETE PROFILE
// =============================================================================

export interface AthleteProfile {
  // Identity
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | undefined | "";

  // Athletic Info
  primarySport: Sport;
  secondarySports?: Sport[];
  rank: Rank;
  class: Class;
  roles: string[];

  // Location
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;

  // Personal (own profile only)
  email?: string;
  dateOfBirth?: string;
  gender: Gender;

  // Social Stats
  followersCount: number;
  followingCount: number;
  postsCount: number;

  // Metadata
  createdAt: string;
  updatedAt?: string;
  onboardingComplete: boolean;
  isAdmin: boolean;
  isOwnProfile: boolean;
}

// =============================================================================
// ATHLETE STATS
// =============================================================================

export interface AthleteStats {
  // Physical Attributes
  weight: number; // kg
  height: number; // cm

  // Performance Metrics (0-100 scale)
  strength: number;
  speed: number;
  agility: number;
  endurance: number;
  power: number;
  flexibility: number;

  // Additional Metrics
  reactionTime?: number; // milliseconds
  verticalJump?: number; // cm
  benchPress?: number; // kg

  // Updated timestamp
  lastUpdated: string;
}

// =============================================================================
// MATCH HISTORY
// =============================================================================

export interface MatchHistory {
  id: string;
  date: string;
  sport: Sport;
  matchType: "FRIENDLY" | "TOURNAMENT" | "LEAGUE" | "PRACTICE";
  opponent: string;
  opponentLogo?: string;
  result: "WIN" | "LOSS" | "DRAW";
  score: {
    own: number;
    opponent: number;
  };
  location: string;
  duration?: number; // minutes
  personalStats?: {
    goals?: number;
    assists?: number;
    points?: number;
    [key: string]: number | undefined;
  };
}

// =============================================================================
// MEDIA
// =============================================================================

export interface MediaItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnail?: string;
  caption?: string;
  sport?: Sport;
  uploadedAt: string;
}

// =============================================================================
// EDIT PROFILE FORM
// =============================================================================

export interface EditProfileFormData {
  username: string;
  firstName: string;
  lastName: string;
  bio: string | undefined | "";
  primarySport: Sport;
  secondarySports: Sport[];
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// =============================================================================
// API RESPONSES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProfileApiResponse extends ApiResponse<AthleteProfile> {}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface AthleteHeaderProps {
  athlete: AthleteProfile;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
  onMessageUser?: () => void;
  onAddFriend?: () => void;
}

export interface AthleteBodyProps {
  athlete: AthleteProfile;
  isOwnProfile: boolean;
}

export interface AboutTabProps {
  athlete: AthleteProfile;
}

export interface StatsTabProps {
  stats: AthleteStats;
  isOwnProfile: boolean;
}

export interface MediaTabProps {
  media: MediaItem[];
  isOwnProfile: boolean;
}

export interface MatchTabProps {
  matches: MatchHistory[];
  isOwnProfile: boolean;
}

// =============================================================================
// STORE STATE
// =============================================================================

export interface ProfileStoreState {
  // Current profile data
  profile: AthleteProfile | null;
  stats: AthleteStats | null;
  matches: MatchHistory[];
  media: MediaItem[];

  // UI State
  isEditDialogOpen: boolean;
  isLoadingLocation: boolean;

  // Actions
  setProfile: (profile: AthleteProfile | null) => void;
  setStats: (stats: AthleteStats | null) => void;
  setMatches: (matches: MatchHistory[]) => void;
  setMedia: (media: MediaItem[]) => void;

  // UI Actions
  openEditDialog: () => void;
  closeEditDialog: () => void;
  setLoadingLocation: (loading: boolean) => void;

  // Reset
  resetStore: () => void;
}
