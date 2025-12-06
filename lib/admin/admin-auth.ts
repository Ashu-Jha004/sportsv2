// =============================================================================
// ADMIN AUTHENTICATION & AUTHORIZATION SYSTEM
// =============================================================================

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type AdminRole = "FOUNDER" | "CO_FOUNDER" | "ADMIN" | "MODERATOR_ADMIN";

export interface AdminUser {
  id: string;
  clerkUserId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  roles: string[];
  isAdmin: boolean;
  adminRole: AdminRole | null;
  adminGrantedBy: string | null;
  adminGrantedAt: Date | null;
}

export interface AdminPermissions {
  canManageAdmins: boolean;
  canApproveModerators: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canAccessSystemSettings: boolean;
  canGrantAdminRoles: boolean;
  canRevokeAdminRoles: boolean;
  canViewAuditLogs: boolean;
}

// =============================================================================
// AUTHENTICATION
// =============================================================================

/**
 * Validate admin authentication and return admin user data (for route handlers)
 */
export async function validateAdminAuth(): Promise<AdminUser> {
  const authResult = await auth();

  if (!authResult?.userId) {
    throw new Error("Authentication required");
  }

  const user = await prisma.athlete.findUnique({
    where: { clerkUserId: authResult.userId },
    select: {
      id: true,
      clerkUserId: true,
      firstName: true,
      lastName: true,
      email: true,
      roles: true,
      isAdmin: true,
      adminRole: true,
      adminGrantedBy: true,
      adminGrantedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  if (!user.isAdmin || !user.roles.includes("ADMIN")) {
    throw new Error(
      "Admin access required. Contact a founder if you need admin privileges."
    );
  }

  return user as AdminUser;
}

/**
 * Validate admin authentication using middleware auth object
 * Use this in middleware context where auth is passed as parameter
 */
export async function validateAdminAuthMiddleware(
  clerkUserId: string
): Promise<AdminUser | null> {
  try {
    if (!clerkUserId) {
      console.log(`❌ No clerkUserId provided to validateAdminAuthMiddleware`);
      return null;
    }

    console.log(`🔍 Checking admin status for clerkId: ${clerkUserId}`);

    const user = await prisma.athlete.findUnique({
      where: { clerkUserId: clerkUserId },
      select: {
        id: true,
        clerkUserId: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
        isAdmin: true,
        adminRole: true,
        adminGrantedBy: true,
        adminGrantedAt: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found in database for clerkId: ${clerkUserId}`);
      return null;
    }

    console.log(
      `🔍 User found: ${user.email}, isAdmin: ${user.isAdmin}, roles: ${user.roles}, adminRole: ${user.adminRole}`
    );

    if (!user.isAdmin || !user.roles.includes("ADMIN")) {
      console.log(
        `❌ User ${user.email} is not an admin (isAdmin: ${user.isAdmin}, roles: ${user.roles})`
      );
      return null;
    }

    console.log(
      `✅ Admin validation successful for ${user.email} (${user.adminRole})`
    );
    return user as AdminUser;
  } catch (error) {
    console.error("Error validating admin in middleware:", error);
    return null;
  }
}

/**
 * Get current admin user (returns null if not admin)
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    return await validateAdminAuth();
  } catch {
    return null;
  }
}

/**
 * Check if current user is admin without throwing
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    await validateAdminAuth();
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// PERMISSIONS SYSTEM
// =============================================================================

/**
 * Get permissions for a specific admin role
 */
export function getAdminPermissions(
  adminRole: AdminRole | null
): AdminPermissions {
  const permissions: AdminPermissions = {
    canManageAdmins: false,
    canApproveModerators: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canAccessSystemSettings: false,
    canGrantAdminRoles: false,
    canRevokeAdminRoles: false,
    canViewAuditLogs: false,
  };

  switch (adminRole) {
    case "FOUNDER":
      // Founder has ALL permissions
      return {
        canManageAdmins: true,
        canApproveModerators: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canAccessSystemSettings: true,
        canGrantAdminRoles: true,
        canRevokeAdminRoles: true,
        canViewAuditLogs: true,
      };

    case "CO_FOUNDER":
      // Co-founder has most permissions (can't revoke founder)
      return {
        canManageAdmins: true,
        canApproveModerators: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canAccessSystemSettings: true,
        canGrantAdminRoles: true,
        canRevokeAdminRoles: true,
        canViewAuditLogs: true,
      };

    case "ADMIN":
      // Regular admin - can manage moderators and users
      return {
        canManageAdmins: false,
        canApproveModerators: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canAccessSystemSettings: false,
        canGrantAdminRoles: false,
        canRevokeAdminRoles: false,
        canViewAuditLogs: false,
      };

    case "MODERATOR_ADMIN":
      // Specialized admin for moderator management only
      return {
        canManageAdmins: false,
        canApproveModerators: true,
        canManageUsers: false,
        canViewAnalytics: false,
        canAccessSystemSettings: false,
        canGrantAdminRoles: false,
        canRevokeAdminRoles: false,
        canViewAuditLogs: false,
      };

    default:
      return permissions;
  }
}

/**
 * Check if an admin has a specific permission
 */
export function hasPermission(
  adminRole: AdminRole | null,
  permission: keyof AdminPermissions
): boolean {
  const permissions = getAdminPermissions(adminRole);
  return permissions[permission];
}

/**
 * Require a specific permission (throws if not authorized)
 */
export async function requirePermission(
  permission: keyof AdminPermissions
): Promise<AdminUser> {
  const adminUser = await validateAdminAuth();

  if (!hasPermission(adminUser.adminRole, permission)) {
    throw new Error(`Insufficient permissions. Required: ${permission}`);
  }

  return adminUser;
}

// =============================================================================
// ADMIN ACTIONS LOGGING
// =============================================================================

/**
 * Log an admin action for audit trail
 */
export async function logAdminAction(
  adminUserId: string,
  action: string,
  details: {
    targetUserId?: string;
    targetResource?: string;
    targetResourceId?: string;
    note?: string;
    [key: string]: any;
  } = {},
  request?: Request
) {
  try {
    // Extract IP and User Agent from request
    const ipAddress =
      request?.headers.get("x-forwarded-for") ||
      request?.headers.get("x-real-ip") ||
      request?.headers.get("remote-addr") ||
      "unknown";

    const userAgent = request?.headers.get("user-agent") || "unknown";

    await prisma.adminAction.create({
      data: {
        adminUserId,
        action,
        targetUserId: details.targetUserId,
        targetResource: details.targetResource,
        targetResourceId: details.targetResourceId,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      },
    });

    // Console logging for development
    console.log(`ADMIN_ACTION [${action}]:`, {
      adminUserId,
      action,
      targetUserId: details.targetUserId,
      targetResource: details.targetResource,
      timestamp: new Date().toISOString(),
      ipAddress:
        ipAddress !== "unknown"
          ? ipAddress.substring(0, 10) + "..."
          : "unknown",
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}

// =============================================================================
// ADMIN MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Grant admin role to a user
 */
export async function grantAdminRole(
  granterAdminId: string,
  targetClerkId: string,
  adminRole: AdminRole,
  note?: string,
  request?: Request
): Promise<AdminUser> {
  // Verify granter has permission
  const granter = await prisma.athlete.findUnique({
    where: { clerkUserId: granterAdminId },
    select: { adminRole: true, isAdmin: true },
  });

  if (
    !granter?.isAdmin ||
    !hasPermission(granter.adminRole, "canGrantAdminRoles")
  ) {
    throw new Error("Insufficient permissions to grant admin roles");
  }

  // Prevent granting FOUNDER role (only one founder allowed)
  if (adminRole === "FOUNDER") {
    throw new Error(
      "Cannot grant FOUNDER role. There can only be one founder."
    );
  }

  // Find target user
  const targetUser = await prisma.athlete.findUnique({
    where: { clerkUserId: targetClerkId },
  });

  if (!targetUser) {
    throw new Error("Target user not found");
  }

  if (targetUser.isAdmin) {
    throw new Error("User is already an admin");
  }

  // Grant admin role
  const updatedUser = await prisma.athlete.update({
    where: { clerkUserId: targetClerkId },
    data: {
      roles: { push: "ADMIN" }, // Add ADMIN to existing roles
      isAdmin: true,
      adminRole,
      adminGrantedBy: granterAdminId,
      adminGrantedAt: new Date(),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      clerkUserId: true,
      firstName: true,
      lastName: true,
      email: true,
      roles: true,
      isAdmin: true,
      adminRole: true,
      adminGrantedBy: true,
      adminGrantedAt: true,
    },
  });

  // Log the action
  await logAdminAction(
    granterAdminId,
    "GRANT_ADMIN_ROLE",
    {
      targetUserId: updatedUser.id,
      adminRole,
      note,
      targetEmail: updatedUser.email,
    },
    request
  );

  return updatedUser as AdminUser;
}

/**
 * Revoke admin role from a user
 */
export async function revokeAdminRole(
  revokerAdminId: string,
  targetUserId: string,
  note?: string,
  request?: Request
): Promise<void> {
  // Verify revoker has permission
  const revoker = await prisma.athlete.findUnique({
    where: { id: revokerAdminId },
    select: { adminRole: true, isAdmin: true },
  });

  if (
    !revoker?.isAdmin ||
    !hasPermission(revoker.adminRole, "canRevokeAdminRoles")
  ) {
    throw new Error("Insufficient permissions to revoke admin roles");
  }

  // Find target user
  const target = await prisma.athlete.findUnique({
    where: { clerkUserId: targetUserId },
    select: { adminRole: true, email: true, firstName: true, lastName: true },
  });

  if (!target) {
    throw new Error("Target user not found");
  }

  // Prevent revoking FOUNDER role
  if (target.adminRole === "FOUNDER") {
    throw new Error("Cannot revoke FOUNDER admin role");
  }

  // Prevent self-revocation (safety measure)
  if (targetUserId === revokerAdminId) {
    throw new Error("Cannot revoke your own admin role");
  }

  // Revoke admin role
  await prisma.athlete.update({
    where: { id: targetUserId },
    data: {
      roles: { set: ["ATHLETE"] }, // Reset to basic user
      isAdmin: false,
      adminRole: null,
      adminGrantedBy: null,
      adminGrantedAt: null,
      updatedAt: new Date(),
    },
  });

  // Log the action
  await logAdminAction(
    revokerAdminId,
    "REVOKE_ADMIN_ROLE",
    {
      targetUserId,
      note,
      targetEmail: target.email,
      revokedRole: target.adminRole,
    },
    request
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get admin display name
 */
export function getAdminDisplayName(admin: AdminUser): string {
  if (admin.firstName && admin.lastName) {
    return `${admin.firstName} ${admin.lastName}`;
  }
  if (admin.firstName) {
    return admin.firstName;
  }
  return admin.email;
}

/**
 * Get admin role display name
 */
export function getAdminRoleDisplayName(role: AdminRole | null): string {
  switch (role) {
    case "FOUNDER":
      return "Founder";
    case "CO_FOUNDER":
      return "Co-Founder";
    case "ADMIN":
      return "Admin";
    case "MODERATOR_ADMIN":
      return "Moderator Admin";
    default:
      return "User";
  }
}

/**
 * Generate trace ID for request tracking
 */
export function generateTraceId(): string {
  return `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
