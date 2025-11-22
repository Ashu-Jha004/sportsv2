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
