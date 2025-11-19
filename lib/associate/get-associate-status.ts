import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export interface AssociateStatusResult {
  isAuthenticated: boolean;
  athleteId: string | null;
  hasApplication: boolean;
  hasProfile: boolean;
  application: {
    id: string;
    status: string;
    submittedAt: Date;
    reviewedAt: Date | null;
    rejectionReason: string | null;
    canReapplyAfter: Date | null;
    workEmail: string;
    primaryExpertise: string;
    secondaryExpertise: string[];
    yearsOfExperience: number;
    workCountry: string;
    workState: string;
    workCity: string;
    coverLetter: string | null;
    resumeUrl: string;
  } | null;
  profile: {
    id: string;
    workEmail: string;
    primaryExpertise: string;
    secondaryExpertise: string[];
    yearsOfExperience: number;
    workCountry: string;
    workState: string;
    workCity: string;
    workLatitude: number;
    workLongitude: number;
    resumeUrl: string;
    isActive: boolean;
    verifiedAt: Date | null;
  } | null;
  canApply: boolean;
  canReapplyAfter: Date | null;
}

export async function getAssociateStatus(): Promise<AssociateStatusResult> {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return {
        isAuthenticated: false,
        athleteId: null,
        hasApplication: false,
        hasProfile: false,
        application: null,
        profile: null,
        canApply: false,
        canReapplyAfter: null,
      };
    }

    // Get athlete record
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        roles: true,
      },
    });

    if (!athlete) {
      console.error("Athlete record not found for userId:", userId);
      return {
        isAuthenticated: true,
        athleteId: null,
        hasApplication: false,
        hasProfile: false,
        application: null,
        profile: null,
        canApply: false,
        canReapplyAfter: null,
      };
    }

    // Check for existing application
    const application = await prisma.associateApplication.findUnique({
      where: { athleteId: athlete.id },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        rejectionReason: true,
        canReapplyAfter: true,
        workEmail: true,
        primaryExpertise: true,
        secondaryExpertise: true,
        yearsOfExperience: true,
        workCountry: true,
        workState: true,
        workCity: true,
        coverLetter: true,
        resumeUrl: true,
      },
    });

    // Check for associate profile
    const profile = await prisma.associateProfile.findUnique({
      where: { athleteId: athlete.id },
      select: {
        id: true,
        workEmail: true,
        primaryExpertise: true,
        secondaryExpertise: true,
        yearsOfExperience: true,
        workCountry: true,
        workState: true,
        workCity: true,
        workLatitude: true,
        workLongitude: true,
        resumeUrl: true,
        isActive: true,
        verifiedAt: true,
      },
    });

    // Determine if athlete can apply
    let canApply = false;
    let canReapplyAfter: Date | null = null;

    if (!application && !profile) {
      // No application, no profile - can apply
      canApply = true;
    } else if (
      application &&
      application.status === "REJECTED" &&
      application.canReapplyAfter
    ) {
      // Rejected - check cooldown period
      const now = new Date();
      if (now >= application.canReapplyAfter) {
        canApply = true;
      } else {
        canReapplyAfter = application.canReapplyAfter;
      }
    }

    return {
      isAuthenticated: true,
      athleteId: athlete.id,
      hasApplication: !!application,
      hasProfile: !!profile,
      application,
      profile,
      canApply,
      canReapplyAfter,
    };
  } catch (error) {
    console.error("Error getting associate status:", error);
    throw new Error("Failed to check associate status");
  }
}
