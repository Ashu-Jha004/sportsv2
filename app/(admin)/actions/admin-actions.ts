"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "../admin/lib/admin-auth";
import { ApplicationStatus } from "@prisma/client";

export async function getApplicationStats() {
  await verifyAdminAccess();

  const [total, pending, underReview, approved, rejected] = await Promise.all([
    prisma.associateApplication.count(),
    prisma.associateApplication.count({ where: { status: "PENDING" } }),
    prisma.associateApplication.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.associateApplication.count({ where: { status: "APPROVED" } }),
    prisma.associateApplication.count({ where: { status: "REJECTED" } }),
  ]);

  return { total, pending, underReview, approved, rejected };
}

export async function getAllApplications(filter?: ApplicationStatus) {
  await verifyAdminAccess();

  const applications = await prisma.associateApplication.findMany({
    where: filter ? { status: filter } : undefined,
    include: {
      athlete: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      reviewedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  return applications;
}

export async function getApplicationById(id: string) {
  await verifyAdminAccess();

  const application = await prisma.associateApplication.findUnique({
    where: { id },
    include: {
      athlete: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          dateOfBirth: true,
          gender: true,
          bio: true,
          primarySport: true,
          country: true,
          state: true,
          city: true,
          createdAt: true,
        },
      },
      reviewedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return application;
}

export async function claimApplication(applicationId: string) {
  const admin = await verifyAdminAccess();

  return await prisma.$transaction(async (tx) => {
    // Get athlete record for admin
    const adminAthlete = await tx.athlete.findUnique({
      where: { clerkUserId: admin.userId },
    });

    if (!adminAthlete) {
      throw new Error("Admin athlete record not found");
    }

    const application = await tx.associateApplication.update({
      where: {
        id: applicationId,
        status: "PENDING",
      },
      data: {
        status: "UNDER_REVIEW",
        reviewedById: adminAthlete.id,
      },
    });



    revalidatePath("/admin/applications");
    return application;
  });
}

export async function approveApplication(
  applicationId: string,
  reviewNotes?: string
) {
  const admin = await verifyAdminAccess();

  return await prisma.$transaction(async (tx) => {
    // Get admin athlete record
    const adminAthlete = await tx.athlete.findUnique({
      where: { clerkUserId: admin.userId },
    });

    if (!adminAthlete) {
      throw new Error("Admin athlete record not found");
    }

    // Update application
    const application = await tx.associateApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        reviewedById: adminAthlete.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
      include: { athlete: true },
    });

    // Create Associate Profile
    const profile = await tx.associateProfile.create({
      data: {
        athleteId: application.athleteId,
        workEmail: application.workEmail,
        resumeUrl: application.resumeUrl,
        primaryExpertise: application.primaryExpertise,
        secondaryExpertise: application.secondaryExpertise,
        yearsOfExperience: application.yearsOfExperience,
        workCountry: application.workCountry,
        workState: application.workState,
        workCity: application.workCity,
        workLatitude: application.workLatitude,
        workLongitude: application.workLongitude,
        verifiedAt: new Date(),
      },
    });

    // Update athlete roles
    const currentRoles = application.athlete.roles;
    if (!currentRoles.includes("ASSOCIATE")) {
      await tx.athlete.update({
        where: { id: application.athleteId },
        data: {
          roles: [...currentRoles, "ASSOCIATE"],
        },
      });
    }

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);

    return { application, profile };
  });
}

export async function rejectApplication(
  applicationId: string,
  rejectionReason: string,
  canReapplyAfterDays: number = 30
) {
  const admin = await verifyAdminAccess();

  return await prisma.$transaction(async (tx) => {
    // Get admin athlete record
    const adminAthlete = await tx.athlete.findUnique({
      where: { clerkUserId: admin.userId },
    });

    if (!adminAthlete) {
      throw new Error("Admin athlete record not found");
    }

    const canReapplyAfter = new Date();
    canReapplyAfter.setDate(canReapplyAfter.getDate() + canReapplyAfterDays);

    const application = await tx.associateApplication.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        reviewedById: adminAthlete.id,
        reviewedAt: new Date(),
        rejectionReason,
        canReapplyAfter,
      },
    });

  

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);

    return application;
  });
}
