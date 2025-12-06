import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // Import auth from Clerk (adjust if using another auth)
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/athlete/[username]
 * Fetch athlete profile by username with ownership metadata
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { username } = await params;

    // Get current logged in user ID (via Clerk)
    const { userId } = await auth();

    console.log(`📥 [${requestId}] GET /api/athlete/${username}`, {
      timestamp: new Date().toISOString(),
      method: "GET",
      path: `/api/athlete/${username}`,
      requesterId: userId || null,
    });

    // Validate username
    if (!username || typeof username !== "string" || username.length < 3) {
      console.error(`❌ [${requestId}] Invalid username:`, { username });
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username",
          code: "INVALID_USERNAME",
          details: "Username must be at least 3 characters",
        },
        { status: 400 }
      );
    }

    // Fetch athlete with relations
    const athlete = await prisma.athlete.findUnique({
      where: {
        username: username.toLowerCase(),
      },
      select: {
        id: true,
        clerkUserId: true,
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
        teamMembership: true,
        state: true,
        city: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!athlete) {
      console.warn(`⚠️  [${requestId}] Athlete not found:`, { username });
      return NextResponse.json(
        {
          success: false,
          error: "Athlete not found",
          code: "ATHLETE_NOT_FOUND",
          username,
        },
        { status: 404 }
      );
    }

    // Build response
    const responseData = {
      success: true,
      athlete: {
        id: athlete.id,
        username: athlete.username,
        email: athlete.email, // Show email only if own profile
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        fullName: `${athlete.firstName} ${athlete.lastName}`,
        profileImage: athlete.profileImage,
        dateOfBirth: athlete?.dateOfBirth,
        // Show only year to others
        gender: athlete.gender,
        bio: athlete.bio,
        primarySport: athlete.primarySport,
        secondarySport: athlete.secondarySport,
        rank: athlete.rank,
        class: athlete.class,
        roles: athlete.roles,
        country: athlete.country,
        state: athlete.state,
        city: athlete.city,
        latitude: athlete.latitude,
        longitude: athlete.longitude,
        teamMembership: athlete.teamMembership,
        createdAt: athlete.createdAt.toISOString(),
        updatedAt: athlete.updatedAt.toISOString(),
      },
    };

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Athlete fetched successfully`, {
      username,
      duration: `${duration}ms`,
    });

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error(`❌ [${requestId}] Error fetching athlete:`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
      code: error.code,
    });

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
        error: "Failed to fetch athlete profile",
        code: "FETCH_ERROR",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
