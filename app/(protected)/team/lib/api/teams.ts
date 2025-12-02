import { Sport } from "@prisma/client";

export const teamQueryKeys = {
  team: (teamId: string) => ["team", teamId] as const,
  teamMembers: (teamId: string) => ["team-members", teamId] as const,
  teamPosts: (teamId: string) => ["team-posts", teamId] as const,
  teamMatches: (teamId: string) => ["team-matches", teamId] as const,
  nearbyAthletes: (params: {
    lat: number;
    lng: number;
    sport?: Sport;
    search?: string;
  }) => ["nearby-athletes", params] as const,
  pendingInvites: (teamId: string) => ["pending-invites", teamId] as const,
  joinRequests: (teamId: string) => ["join-requests", teamId] as const,
  notifications: () => ["notifications"] as const,
  all: () => ["teams"] as const,
} as const;

// Correct keys to match query keys exactly
export const pollingConfig = {
  notifications: 2 * 60 * 1000, // 2 min
  "pending-invites": 3 * 60 * 1000, // 3 min
  "join-requests": 3 * 60 * 1000, // 3 min
  team: 10 * 60 * 1000, // 10 min, for main team data
  "team-members": false, // Disabled polling, manual refresh
  "team-matches": false,
  "team-posts": false,
  "nearby-athletes": false,
} as const;

// Helper to determine if polling intervals are enabled based on context
export const shouldPoll = (
  key: keyof typeof pollingConfig,
  context?: {
    isOwner?: boolean;
    isCaptain?: boolean;
    dialogOpen?: boolean;
  }
) => {
  const interval = pollingConfig[key];
  if (interval === false) return false;

  if (key === "pending-invites" && !context?.dialogOpen) return false;
  if (key === "join-requests" && !context?.isOwner && !context?.isCaptain)
    return false;
  if (key === "notifications" && !context?.isOwner && !context?.isCaptain)
    return false;

  return interval;
};
