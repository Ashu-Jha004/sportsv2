// lib/utils/teamPermissions.ts
import { TeamWithRelations, TeamRole } from "../../lib/types/team";
import { Role } from "@prisma/client";

export function getTeamRole(
  team: TeamWithRelations | null,
  currentUserId: string | null
): TeamRole {
  if (!team || !currentUserId) return "VISITOR";

  // Check if owner
  if (team.ownerId === currentUserId) return "OWNER";

  // Find membership
  const membership = team.members.find((m) => m.id === currentUserId);
  if (!membership) return "VISITOR";

  // Map role
  const roleMap: Record<string, TeamRole> = {
    OWNER: "OWNER",
    CAPTAIN: "CAPTAIN",
    PLAYER: "PLAYER",
    MANAGER: "MANAGER",
  };
  return roleMap[membership.TeamMembership.role] || "PLAYER";
}

export function getTeamPermissions(
  team: TeamWithRelations | null,
  currentUserId: string | null
): any {
  const role = getTeamRole(team, currentUserId);

  return {
    isOwner: role === "OWNER",
    isCaptain: role === "CAPTAIN",
    isMember: ["OWNER", "CAPTAIN", "PLAYER", "MANAGER"].includes(role),
    canInvite: ["OWNER", "CAPTAIN", "PLAYER", "MANAGER"].includes(role),
    canManageRequests: ["OWNER", "CAPTAIN"].includes(role),
    canEdit: role === "OWNER",
    canCreatePost: ["OWNER", "CAPTAIN", "PLAYER", "MANAGER"].includes(role),
    canChallenge: ["OWNER", "CAPTAIN"].includes(role),
  };
}

// Client-side permission hook helper
export function useTeamPermissions(
  team: TeamWithRelations | null,
  userId: string | null
) {
  return getTeamPermissions(team, userId);
}
