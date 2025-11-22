// =============================================================================
// ADMIN MODERATORS PAGE WITH SERVER-SIDE ADMIN CHECK
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { validateAdminAuth, hasPermission } from "@/lib/admin/admin-auth";
import AdminModeratorsPanel from "./components/AdminPannel"; // We'll create this component

export default async function AdminModeratorsPage() {
  try {
    console.log("🔍 Admin page: Validating admin access");

    // This will work fine in a route handler (not middleware)
    const adminUser = await validateAdminAuth();

    // Check if admin has permission to view moderator applications
    if (!hasPermission(adminUser.adminRole, "canApproveModerators")) {
      console.log(`❌ Admin ${adminUser.email} lacks moderator permissions`);
      redirect(
        "/unauthorized?reason=insufficient_permissions&attempted_path=/admin/moderators"
      );
    }

    console.log(
      `✅ Admin access granted to ${adminUser.email} (${adminUser.adminRole})`
    );

    // Pass admin info to client component
    return (
      <AdminModeratorsPanel
        adminUser={{
          id: adminUser.id,
          name:
            `${adminUser.firstName} ${adminUser.lastName}`.trim() ||
            adminUser.email,
          email: adminUser.email,
          role: adminUser.adminRole,
          permissions: {
            canApproveModerators: hasPermission(
              adminUser.adminRole,
              "canApproveModerators"
            ),
            canManageAdmins: hasPermission(
              adminUser.adminRole,
              "canManageAdmins"
            ),
            canViewAuditLogs: hasPermission(
              adminUser.adminRole,
              "canViewAuditLogs"
            ),
          },
        }}
      />
    );
  } catch (error) {
    console.error("Admin page error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Authentication required")) {
        redirect("/sign-in?redirect_url=/admin/moderators");
      }
      if (error.message.includes("Admin access required")) {
        redirect(
          "/unauthorized?reason=admin_required&attempted_path=/admin/moderators"
        );
      }
    }

    // Generic error redirect
    redirect("/error?type=admin_page_error&message=Failed to load admin page");
  }
}
