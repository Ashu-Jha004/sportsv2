// app/(guide)/dashboard/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type UpdateLocationResult =
  | { success: true; guideId: string }
  | { success: false; code: string; message: string; traceId?: string };

function generateTraceId() {
  return `guide_loc_${Math.random()
    .toString(36)
    .slice(2, 10)}_${Date.now().toString(36)}`;
}

export async function updateGuideLocation(coords: {
  latitude: number;
  longitude: number;
}): Promise<UpdateLocationResult> {
  const traceId = generateTraceId();

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[updateGuideLocation] Unauthenticated request", {
        traceId,
      });
      return {
        success: false,
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
        traceId,
      };
    }

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      console.error("[updateGuideLocation] Athlete not found", {
        traceId,
        clerkUserId: userId,
      });
      return {
        success: false,
        code: "ATHLETE_NOT_FOUND",
        message: "No athlete profile found.",
        traceId,
      };
    }

    const guide = await prisma.guide.findUnique({
      where: { userId: athlete.id },
      select: { id: true, status: true },
    });

    if (!guide) {
      return {
        success: false,
        code: "GUIDE_NOT_FOUND",
        message: "No guide profile found for this account.",
        traceId,
      };
    }

    if (guide.status !== "approved") {
      return {
        success: false,
        code: "INVALID_STATUS",
        message: "Location can only be updated for approved guides.",
        traceId,
      };
    }

    const updated = await prisma.guide.update({
      where: { id: guide.id },
      data: {
        lat: coords.latitude,
        lon: coords.longitude,
        updatedAt: new Date(),
      },
      select: { id: true },
    });

    // Revalidate dashboard so server component sees fresh location
    revalidatePath("/guide/dashboard");

    console.info("[updateGuideLocation] Location updated", {
      traceId,
      guideId: updated.id,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    return {
      success: true,
      guideId: updated.id,
    };
  } catch (error) {
    console.error("[updateGuideLocation] Unexpected error", {
      traceId,
      error,
    });

    return {
      success: false,
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "development"
          ? `Failed to update location. Trace: ${traceId}`
          : "Failed to update location. Please try again later.",
      traceId,
    };
  }
}

const updateGuideProfileSchema = z.object({
  guideEmail: z.string().trim().email("Please provide a valid email."),
  primarySport: z.string().min(1, "Primary sport is required."),
  secondarySports: z.array(z.string()).max(5).optional().default([]),
  experience: z.coerce
    .number({
      error: "Experience must be a number.",
    })
    .int("Experience must be a whole number.")
    .min(0, "Experience cannot be negative.")
    .max(60, "Please enter a realistic experience (0–60 years).")
    .nullable()
    .optional(),
  country: z.string().trim().min(1, "Country is required."),
  state: z.string().trim().min(1, "State/Province is required."),
  city: z.string().trim().min(1, "City is required."),
});

type UpdateGuideProfileInput = z.infer<typeof updateGuideProfileSchema>;

type UpdateGuideProfileResult =
  | { success: true }
  | {
      success: false;
      code: string;
      message: string;
      fieldErrors?: Record<string, string[]>;
      traceId?: string;
    };

export async function updateGuideProfile(
  raw: unknown
): Promise<UpdateGuideProfileResult> {
  const traceId = generateTraceId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
        traceId,
      };
    }

    const parsed = updateGuideProfileSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      console.warn("[updateGuideProfile] Validation failed", {
        traceId,
        fieldErrors,
      });
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Some fields are invalid.",
        fieldErrors,
        traceId,
      };
    }

    const data: UpdateGuideProfileInput = parsed.data;

    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      return {
        success: false,
        code: "ATHLETE_NOT_FOUND",
        message: "No athlete profile found.",
        traceId,
      };
    }

    const guide = await prisma.guide.findUnique({
      where: { userId: athlete.id },
      select: { id: true },
    });

    if (!guide) {
      return {
        success: false,
        code: "GUIDE_NOT_FOUND",
        message: "No guide profile found.",
        traceId,
      };
    }

    await prisma.guide.update({
      where: { id: guide.id },
      data: {
        guideEmail: data.guideEmail,
        PrimarySports: data.primarySport,
        Sports: data.secondarySports ?? [],
        Experience: data.experience ?? undefined,
        country: data.country,
        state: data.state,
        city: data.city,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/guide/dashboard");

    console.info("[updateGuideProfile] Guide profile updated", {
      traceId,
      guideId: guide.id,
    });

    return { success: true };
  } catch (error) {
    console.error("[updateGuideProfile] Unexpected error", {
      traceId,
      error,
    });

    return {
      success: false,
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "development"
          ? `Failed to update profile. Trace: ${traceId}`
          : "Failed to update profile. Please try again.",
      traceId,
    };
  }
}

// --- Stats update via OTP ---

const verifyStatsUpdateOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, "OTP is required.")
    .max(6, "OTP must be at most 6 digits.")
    .regex(/^\d+$/, "OTP must be numeric."),
});

type VerifyStatsUpdateOtpInput = z.infer<typeof verifyStatsUpdateOtpSchema>;

type VerifyStatsUpdateOtpResult =
  | {
      success: true;
      athlete: {
        id: string;
        clerkUserId: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        profileImage: string | null;
        primarySport: string | null;
        gender: string | null;
        rank: string;
        class: string;
        city: string | null;
        state: string | null;
        country: string | null;
      };
    }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "ATHLETE_NOT_FOUND"
        | "GUIDE_NOT_FOUND"
        | "GUIDE_NOT_APPROVED"
        | "VALIDATION_ERROR"
        | "OTP_INVALID"
        | "REQUEST_NOT_FOUND"
        | "REQUEST_STATUS_INVALID"
        | "INTERNAL_ERROR";
      message: string;
      fieldErrors?: Record<string, string[]>;
      traceId?: string;
    };

export async function verifyStatsUpdateOtpAction(
  raw: unknown
): Promise<VerifyStatsUpdateOtpResult> {
  const traceId = generateTraceId();

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[verifyStatsUpdateOtpAction] Unauthenticated", { traceId });
      return {
        success: false,
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
        traceId,
      };
    }

    const parsed = verifyStatsUpdateOtpSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      console.warn("[verifyStatsUpdateOtpAction] Validation failed", {
        traceId,
        fieldErrors,
      });
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "OTP input is invalid.",
        fieldErrors,
        traceId,
      };
    }

    const { otp } = parsed.data;

    // Resolve athlete by Clerk user id
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      console.error("[verifyStatsUpdateOtpAction] Athlete not found", {
        traceId,
        clerkUserId: userId,
      });
      return {
        success: false,
        code: "ATHLETE_NOT_FOUND",
        message: "No athlete profile found.",
        traceId,
      };
    }

    // Resolve guide by athlete id
    const guide = await prisma.guide.findUnique({
      where: { userId: athlete.id },
      select: { id: true, status: true },
    });

    if (!guide) {
      console.warn("[verifyStatsUpdateOtpAction] Guide not found", {
        traceId,
        athleteId: athlete.id,
      });
      return {
        success: false,
        code: "GUIDE_NOT_FOUND",
        message: "No guide profile found.",
        traceId,
      };
    }

    if (guide.status !== "approved") {
      console.warn("[verifyStatsUpdateOtpAction] Guide not approved", {
        traceId,
        guideId: guide.id,
        status: guide.status,
      });
      return {
        success: false,
        code: "GUIDE_NOT_APPROVED",
        message: "Only approved guides can perform stats updates.",
        traceId,
      };
    }

    // Look up PhysicalEvaluationRequest by OTP + guide
    const request = await prisma.physicalEvaluationRequest.findFirst({
      where: {
        guideId: guide.id,
        OTP: Number(otp),
        status: "ACCEPTED",
      },
      select: {
        id: true,
        status: true,
        athlete: {
          select: {
            id: true,
            clerkUserId: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            primarySport: true,
            gender: true,
            rank: true,
            class: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
    });

    if (!request) {
      console.warn("[verifyStatsUpdateOtpAction] No matching request for OTP", {
        traceId,
        guideId: guide.id,
      });
      // Keep message generic for security
      return {
        success: false,
        code: "OTP_INVALID",
        message: "Invalid or expired OTP.",
        traceId,
      };
    }

    if (request.status !== "ACCEPTED") {
      console.warn(
        "[verifyStatsUpdateOtpAction] Request not in ACCEPTED status",
        {
          traceId,
          requestId: request.id,
          status: request.status,
        }
      );
      return {
        success: false,
        code: "REQUEST_STATUS_INVALID",
        message:
          "This evaluation request is not in a valid state for stats update.",
        traceId,
      };
    }

    const a = request.athlete;

    console.info("[verifyStatsUpdateOtpAction] OTP verified", {
      traceId,
      guideId: guide.id,
      athleteId: a.id,
      requestId: request.id,
    });

    return {
      success: true,
      athlete: {
        id: a.id,
        clerkUserId: a.clerkUserId,
        username: a.username,
        firstName: a.firstName,
        lastName: a.lastName,
        profileImage: a.profileImage,
        primarySport: a.primarySport ?? null,
        gender: a.gender ?? null,
        rank: a.rank,
        class: a.class,
        city: a.city ?? null,
        state: a.state ?? null,
        country: a.country ?? null,
      },
    };
  } catch (error) {
    console.error("[verifyStatsUpdateOtpAction] Unexpected error", {
      traceId,
      error,
    });

    return {
      success: false,
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "development"
          ? `Failed to verify OTP. Trace: ${traceId}`
          : "Failed to verify OTP. Please try again.",
      traceId,
    };
  }
}
