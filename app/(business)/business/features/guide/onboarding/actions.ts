// app/(guide)/onboarding/actions.ts
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  guideOnboardingSchema,
  type GuideOnboardingInput,
} from "@/lib/validations/guideOnboarding/guide-onboarding-schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type ActionErrorCode =
  | "UNAUTHENTICATED"
  | "ATHLETE_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export type GuideApplicationResult =
  | {
      success: true;
      guideId: string;
      status: "pending_review";
    }
  | {
      success: false;
      code: ActionErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
      traceId?: string;
    };

function generateTraceId() {
  return `guide_app_${Math.random()
    .toString(36)
    .slice(2, 10)}_${Date.now().toString(36)}`;
}

export async function createGuideApplication(
  rawInput: unknown
): Promise<GuideApplicationResult> {
  const traceId = generateTraceId();

  try {
    const { userId } = await auth();

    if (!userId) {
      console.error("[createGuideApplication] Unauthenticated request", {
        traceId,
      });

      return {
        success: false,
        code: "UNAUTHENTICATED",
        message: "Authentication required. Please sign in to continue.",
        traceId,
      };
    }

    // Validate incoming payload with Zod
    const parsed = guideOnboardingSchema.safeParse(rawInput);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      console.warn("[createGuideApplication] Validation failed", {
        traceId,
        fieldErrors,
      });

      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Some fields are invalid. Please review the form.",
        fieldErrors,
        traceId,
      };
    }

    const input: GuideOnboardingInput = parsed.data;

    // Find the Athlete by clerkUserId
    const athlete = await prisma.athlete.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!athlete) {
      console.error("[createGuideApplication] Athlete not found for user", {
        traceId,
        clerkUserId: userId,
      });

      return {
        success: false,
        code: "ATHLETE_NOT_FOUND",
        message:
          "No athlete profile is associated with this account. Please complete athlete onboarding first.",
        traceId,
      };
    }

    // Ensure a user does not create multiple guide applications
    const existingGuide = await prisma.guide.findUnique({
      where: {
        userId: athlete.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (existingGuide) {
      console.warn("[createGuideApplication] Guide already exists", {
        traceId,
        guideId: existingGuide.id,
        status: existingGuide.status,
      });

      return {
        success: false,
        code: "CONFLICT",
        message:
          "A guide application already exists for this account. Please refresh your dashboard.",
        traceId,
      };
    }

    // Map Cloudinary documents to stored string[] (e.g., URLs)
    const documentUrls = input.documents.map((doc) => doc.url);

    const guide = await prisma.guide.create({
      data: {
        userId: athlete.id,
        guideEmail: input.guideEmail,
        documents: documentUrls,
        PrimarySports: input.primarySport,
        Sports: input.secondarySports ?? [],
        Experience: input.experienceYears ?? undefined,
        state: input.state,
        city: input.city,
        country: input.country,
        lat: input.latitude,
        lon: input.longitude,
        status: "pending_review",
      },
      select: {
        id: true,
        status: true,
      },
    });

    // Optionally revalidate any dashboard paths
    // revalidatePath("/guide/dashboard")

    console.info("[createGuideApplication] Guide application created", {
      traceId,
      guideId: guide.id,
    });

    return {
      success: true,
      guideId: guide.id,
      status: "pending_review",
    };
  } catch (error) {
    console.error("[createGuideApplication] Unexpected error", {
      traceId,
      error,
    });

    return {
      success: false,
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "development"
          ? `Unexpected error while creating guide application. Trace ID: ${traceId}`
          : "Something went wrong while submitting your application. Please try again later.",
      traceId,
    };
  }
}
