import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { Gender, Sport, Rank, Class } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Validation schema
const updateAthleteSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50).optional(),
  lastName: z.string().min(1, "Last name required").max(50).optional(),
  bio: z.string().max(500, "Bio too long").optional().nullable(),
  gender: z.nativeEnum(Gender).optional(),
  primarySport: z.nativeEnum(Sport).optional(),
  secondarySport: z.nativeEnum(Sport).optional().nullable(),
  rank: z.nativeEnum(Rank).optional(),
  class: z.nativeEnum(Class).optional(),
  country: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;

/**
 * PATCH /api/athlete/update
 * Update authenticated athlete's profile
 *
 * @body Partial athlete data to update
 * @returns Updated athlete profile
 */
export async function PATCH(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { userId } = await auth();

    if (!userId) {
      console.error(`❌ [${requestId}] Unauthorized update attempt`);
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    console.log(`📝 [${requestId}] PATCH /api/athlete/update`, {
      userId,
      timestamp: new Date().toISOString(),
    });

    // Parse request body
    const body = await request.json();

    // Validate input
    let validatedData: UpdateAthleteInput;
    try {
      validatedData = updateAthleteSchema.parse(body);
    } catch (error: any) {
      console.error(`❌ [${requestId}] Validation failed:`, {
        errors: error.errors,
        body,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Check if no data to update
    if (Object.keys(validatedData).length === 0) {
      console.warn(`⚠️  [${requestId}] No data provided for update`);
      return NextResponse.json(
        {
          success: false,
          error: "No data provided",
          code: "NO_DATA",
        },
        { status: 400 }
      );
    }

    // Find athlete
    const existingAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!existingAthlete) {
      console.error(`❌ [${requestId}] Athlete not found for userId:`, {
        userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Athlete profile not found",
          code: "ATHLETE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    console.log(
      `🔄 [${requestId}] Updating athlete: ${existingAthlete.username}`,
      {
        athleteId: existingAthlete.id,
        fieldsToUpdate: Object.keys(validatedData),
      }
    );

    // Perform update
    const updatedAthlete = await prisma.athlete.update({
      where: { clerkUserId: userId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
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
        secondarySport: true,
        rank: true,
        class: true,
        roles: true,
        country: true,
        state: true,
        city: true,
        latitude: true,
        longitude: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Athlete updated successfully`, {
      username: updatedAthlete.username,
      duration: `${duration}ms`,
      updatedFields: Object.keys(validatedData),
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      athlete: {
        id: updatedAthlete.id,
        username: updatedAthlete.username,
        email: updatedAthlete.email,
        firstName: updatedAthlete.firstName,
        lastName: updatedAthlete.lastName,
        fullName: `${updatedAthlete.firstName} ${updatedAthlete.lastName}`,
        profileImage: updatedAthlete.profileImage,
        dateOfBirth: updatedAthlete.dateOfBirth.toISOString(),
        gender: updatedAthlete.gender,
        bio: updatedAthlete.bio,
        primarySport: updatedAthlete.primarySport,
        secondarySport: updatedAthlete.secondarySport,
        rank: updatedAthlete.rank,
        class: updatedAthlete.class,
        roles: updatedAthlete.roles,
        location: {
          country: updatedAthlete.country,
          state: updatedAthlete.state,
          city: updatedAthlete.city,
          coordinates: {
            latitude: updatedAthlete.latitude,
            longitude: updatedAthlete.longitude,
          },
        },
        updatedAt: updatedAthlete.updatedAt.toISOString(),
        createdAt: updatedAthlete.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error(`❌ [${requestId}] Error updating athlete:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            error: "Duplicate value",
            code: "DUPLICATE_ERROR",
            details: "The provided value already exists",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          code: "DATABASE_ERROR",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
          prismaCode: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
        code: "UPDATE_ERROR",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
