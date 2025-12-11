import { TeamMemberRole } from "@prisma/client";

// ============================================
// TRAINING PERMISSIONS INTERFACE
// ============================================

export interface TrainingPermissions {
  // Plan permissions
  canCreatePlan: boolean;
  canEditPlan: boolean;
  canDeletePlan: boolean;
  canActivatePlan: boolean;

  // Session/Exercise permissions
  canCreateSession: boolean;
  canEditSession: boolean;
  canDeleteSession: boolean;
  canCreateExercise: boolean;
  canEditExercise: boolean;
  canDeleteExercise: boolean;

  // Footage permissions
  canUploadFootage: boolean;
  canDeleteFootage: boolean;

  // View permissions
  canViewTraining: boolean;
  canMarkComplete: boolean;

  // Role info
  userRole: TeamMemberRole | "OWNER" | "NON_MEMBER" | null;
  isGuide: boolean;
}

// ============================================
// PERMISSION CHECKER (CLIENT-SIDE)
// ============================================

export function getTrainingPermissions(
  team: any,
  currentUserId: string | null // Clerk ID
): TrainingPermissions {
  try {
    const defaultPermissions: TrainingPermissions = {
      canCreatePlan: false,
      canEditPlan: false,
      canDeletePlan: false,
      canActivatePlan: false,
      canCreateSession: false,
      canEditSession: false,
      canDeleteSession: false,
      canCreateExercise: false,
      canEditExercise: false,
      canDeleteExercise: false,
      canUploadFootage: false,
      canDeleteFootage: false,
      canViewTraining: false,
      canMarkComplete: false,
      userRole: null,
      isGuide: false,
    };

    if (!currentUserId || !team) {
      return defaultPermissions;
    }

    // ✅ STEP 1: Find athlete by clerkUserId (handles owner/guide/members)
    const currentAthlete =
      team.owner?.clerkUserId === currentUserId
        ? team.owner
        : team.overseerGuide?.clerkUserId === currentUserId
        ? team.overseerGuide
        : team.members?.find(
            (member: any) => member.athlete?.clerkUserId === currentUserId
          )?.athlete;

    const athleteId = currentAthlete?.id; // Internal Athlete ID

    // ✅ STEP 2: Now compare internal Athlete IDs
    const isOwner = team.ownerId === athleteId;
    const isGuide = team.overseerGuideId === athleteId;

    // ✅ STEP 3: Find membership using athleteId
    const membership = team.members?.find(
      (member: any) => member.athleteId === athleteId
    );

    const isMember = !!membership;
    const memberRole = membership?.role;
    const isCaptain =
      membership?.isCaptain === true || memberRole === "CAPTAIN";
    const isManager = memberRole === "MANAGER";

    console.log("[TrainingPermissions Client]", {
      clerkUserId: currentUserId,
      athleteId,
      teamOwnerId: team.ownerId,
      teamGuideId: team.overseerGuideId,
      teamId: team.id,
      isOwner,
      isCaptain,
      isManager,
      isGuide,
      memberRole,
      membership: membership
        ? { role: membership.role, isCaptain: membership.isCaptain }
        : null,
    });

    // Owner has full permissions
    if (isOwner) {
      return {
        canCreatePlan: true,
        canEditPlan: true,
        canDeletePlan: true,
        canActivatePlan: true,
        canCreateSession: true,
        canEditSession: true,
        canDeleteSession: true,
        canCreateExercise: true,
        canEditExercise: true,
        canDeleteExercise: true,
        canUploadFootage: true,
        canDeleteFootage: true,
        canViewTraining: true,
        canMarkComplete: true,
        userRole: "OWNER",
        isGuide: false,
      };
    }

    // Captain has full permissions
    if (isCaptain) {
      return {
        canCreatePlan: true,
        canEditPlan: true,
        canDeletePlan: true,
        canActivatePlan: true,
        canCreateSession: true,
        canEditSession: true,
        canDeleteSession: true,
        canCreateExercise: true,
        canEditExercise: true,
        canDeleteExercise: true,
        canUploadFootage: true,
        canDeleteFootage: true,
        canViewTraining: true,
        canMarkComplete: true,
        userRole: memberRole || "CAPTAIN",
        isGuide: false,
      };
    }

    // Guide has management permissions
    if (isGuide) {
      return {
        canCreatePlan: true,
        canEditPlan: true,
        canDeletePlan: false,
        canActivatePlan: true,
        canCreateSession: true,
        canEditSession: true,
        canDeleteSession: true,
        canCreateExercise: true,
        canEditExercise: true,
        canDeleteExercise: true,
        canUploadFootage: true,
        canDeleteFootage: false,
        canViewTraining: true,
        canMarkComplete: false,
        userRole: "NON_MEMBER",
        isGuide: true,
      };
    }

    // Manager
    if (isManager) {
      return {
        canCreatePlan: false,
        canEditPlan: false,
        canDeletePlan: false,
        canActivatePlan: false,
        canCreateSession: false,
        canEditSession: false,
        canDeleteSession: false,
        canCreateExercise: false,
        canEditExercise: false,
        canDeleteExercise: false,
        canUploadFootage: true,
        canDeleteFootage: false,
        canViewTraining: true,
        canMarkComplete: true,
        userRole: TeamMemberRole.MANAGER,
        isGuide: false,
      };
    }

    // Regular player
    if (isMember) {
      return {
        canCreatePlan: false,
        canEditPlan: false,
        canDeletePlan: false,
        canActivatePlan: false,
        canCreateSession: false,
        canEditSession: false,
        canDeleteSession: false,
        canCreateExercise: false,
        canEditExercise: false,
        canDeleteExercise: false,
        canUploadFootage: false,
        canDeleteFootage: false,
        canViewTraining: true,
        canMarkComplete: true,
        userRole: memberRole || TeamMemberRole.PLAYER,
        isGuide: false,
      };
    }

    return defaultPermissions;
  } catch (error) {
    console.error("[TrainingPermissions] Error:", error);
    return {
      canCreatePlan: false,
      canEditPlan: false,
      canDeletePlan: false,
      canActivatePlan: false,
      canCreateSession: false,
      canEditSession: false,
      canDeleteSession: false,
      canCreateExercise: false,
      canEditExercise: false,
      canDeleteExercise: false,
      canUploadFootage: false,
      canDeleteFootage: false,
      canViewTraining: false,
      canMarkComplete: false,
      userRole: null,
      isGuide: false,
    };
  }
}
