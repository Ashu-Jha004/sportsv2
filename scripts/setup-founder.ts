// =============================================================================
// FOUNDER SETUP SCRIPT - RUN ONCE TO CREATE INITIAL ADMIN
// =============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupFounder() {
  try {
    console.log("🚀 Setting up founder admin access...");

    // Your actual values (already correct!)
    const FOUNDER_CLERK_ID: any = "user_35jot94FIsXLkQ9NWc5QBWre8oS";
    const FOUNDER_EMAIL: any = "ashujha009322@gmail.com";

    // CORRECTED validation - check against placeholder values

    // Check if user already exists
    const existingUser = await prisma.athlete.findUnique({
      where: { clerkUserId: FOUNDER_CLERK_ID },
    });

    if (existingUser && existingUser.isAdmin) {
      console.log("✅ User is already an admin!");
      console.log("👤 Admin:", existingUser.firstName, existingUser.lastName);
      console.log("📧 Email:", existingUser.email);
      console.log("🔐 Role:", existingUser.adminRole);
      return;
    }

    // Create or update founder user
    const founder = await prisma.athlete.upsert({
      where: { clerkUserId: FOUNDER_CLERK_ID },
      update: {
        roles: { set: ["ADMIN"] }, // Add ADMIN to existing roles
        isAdmin: true,
        adminRole: "FOUNDER",
        adminGrantedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        clerkUserId: FOUNDER_CLERK_ID,
        email: FOUNDER_EMAIL,
        roles: ["ADMIN"],
        isAdmin: true,
        adminRole: "FOUNDER",
        adminGrantedAt: new Date(),
      },
    });

    // Log the admin action
    await prisma.adminAction.create({
      data: {
        adminUserId: founder.id,
        action: "FOUNDER_SETUP",
        details: {
          note: "Initial founder setup via script",
          timestamp: new Date().toISOString(),
          email: FOUNDER_EMAIL,
        },
      },
    });

    console.log("✅ Founder setup complete!");
    console.log("👤 Founder ID:", founder.id);
    console.log("📧 Email:", founder.email);
    console.log("🔐 Admin Role:", founder.adminRole);
    console.log("📅 Granted At:", founder.adminGrantedAt);
    console.log("");
    console.log("🎉 You can now access admin features!");
    console.log("🔗 Admin Panel: http://localhost:3000/admin/moderators");
  } catch (error) {
    console.error("❌ Founder setup failed:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        console.log("💡 Tip: The email might already be used by another user");
      }
      if (error.message.includes("Foreign key constraint")) {
        console.log("💡 Tip: Make sure the Clerk User ID is correct");
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupFounder();
