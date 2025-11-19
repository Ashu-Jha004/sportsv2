import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Sport } from "@prisma/client";

// Use Prisma's Sport enum
const SportEnum = z.nativeEnum(Sport);

const updateProfileSchema = z.object({
  workEmail: z.string().email().optional(),
  primaryExpertise: SportEnum.optional(),
  secondaryExpertise: z.array(SportEnum).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  workCountry: z.string().optional(),
  workState: z.string().optional(),
  workCity: z.string().optional(),
  workLatitude: z.number().min(-90).max(90).optional(),
  workLongitude: z.number().min(-180).max(180).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // Get athlete record
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      include: { associateProfile: true },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found", code: "ATHLETE_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!athlete.associateProfile) {
      return NextResponse.json(
        { error: "Associate profile not found", code: "PROFILE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update profile
    const updatedProfile = await prisma.associateProfile.update({
      where: { athleteId: athlete.id },
      data: {
        ...(validatedData.workEmail && { workEmail: validatedData.workEmail }),
        ...(validatedData.primaryExpertise && {
          primaryExpertise: validatedData.primaryExpertise,
        }),
        ...(validatedData.secondaryExpertise && {
          secondaryExpertise: validatedData.secondaryExpertise,
        }),
        ...(validatedData.yearsOfExperience !== undefined && {
          yearsOfExperience: validatedData.yearsOfExperience,
        }),
        ...(validatedData.workCountry && {
          workCountry: validatedData.workCountry,
        }),
        ...(validatedData.workState && { workState: validatedData.workState }),
        ...(validatedData.workCity && { workCity: validatedData.workCity }),
        ...(validatedData.workLatitude !== undefined && {
          workLatitude: validatedData.workLatitude,
        }),
        ...(validatedData.workLongitude !== undefined && {
          workLongitude: validatedData.workLongitude,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update profile",
        code: "UPDATE_FAILED",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
