import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { associateApplicationSchema } from "@/lib/validations/associate/associate";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found", code: "ATHLETE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Check if application already exists
    const existingApplication = await prisma.associateApplication.findUnique({
      where: { athleteId: athlete.id },
    });

    if (existingApplication) {
      // Check if can reapply
      if (existingApplication.status === "REJECTED") {
        if (
          existingApplication.canReapplyAfter &&
          new Date() < existingApplication.canReapplyAfter
        ) {
          return NextResponse.json(
            {
              error: "Cannot reapply yet",
              code: "COOLDOWN_ACTIVE",
              canReapplyAfter: existingApplication.canReapplyAfter,
            },
            { status: 400 }
          );
        }
        // Delete old rejected application before creating new one
        await prisma.associateApplication.delete({
          where: { id: existingApplication.id },
        });
      } else {
        return NextResponse.json(
          {
            error: "Application already exists",
            code: "APPLICATION_EXISTS",
            status: existingApplication.status,
          },
          { status: 400 }
        );
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = associateApplicationSchema.parse(body);

    // Create application
    const application = await prisma.$transaction(async (tx) => {
      const newApp = await tx.associateApplication.create({
        data: {
          athleteId: athlete.id,
          workEmail: validatedData.workEmail,
          coverLetter: body.coverLetter, // Not in validation but accepted
          primaryExpertise: validatedData.primaryExpertise,
          secondaryExpertise: validatedData.secondaryExpertise,
          yearsOfExperience: validatedData.yearsOfExperience,
          workCountry: validatedData.workCountry,
          workState: validatedData.workState,
          workCity: validatedData.workCity,
          workLatitude: validatedData.workLatitude,
          workLongitude: validatedData.workLongitude,
          resumeUrl: validatedData.resumeUrl,
          status: "PENDING",
        },
      });

      return newApp;
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: application.id,
    });
  } catch (error: any) {
    console.error("Application submission error:", error);

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
        error: "Failed to submit application",
        code: "SUBMISSION_FAILED",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
