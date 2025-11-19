import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
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
    const { latitude, longitude } = locationSchema.parse(body);

    // Update location
    const updatedProfile = await prisma.associateProfile.update({
      where: { athleteId: athlete.id },
      data: {
        workLatitude: latitude,
        workLongitude: longitude,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      coordinates: {
        latitude: updatedProfile.workLatitude,
        longitude: updatedProfile.workLongitude,
      },
    });
  } catch (error: any) {
    console.error("Location update error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid coordinates",
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update location",
        code: "UPDATE_FAILED",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
