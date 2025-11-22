// =============================================================================
// SECURE ADMIN MODERATOR MANAGEMENT API
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  validateAdminAuth,
  hasPermission,
  logAdminAction,
  generateTraceId,
  type AdminUser,
} from "@/lib/admin/admin-auth";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const updateStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "pending_review"]),
  reviewNote: z.string().optional(),
});

const bulkUpdateSchema = z.object({
  applicationIds: z
    .array(z.string())
    .min(1, "At least one application ID required"),
  status: z.enum(["approved", "rejected", "pending_review"]),
  reviewNote: z.string().optional(),
});

// =============================================================================
// RESPONSE UTILITIES
// =============================================================================

function createSuccessResponse<T>(
  data: T,
  message: string,
  traceId: string
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    metadata: {
      traceId,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  });
}

function createErrorResponse(
  error: string,
  statusCode: number,
  traceId: string,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: error,
        code: getErrorCode(statusCode),
        details,
      },
      metadata: {
        traceId,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
    },
    {
      status: statusCode,
      headers: {
        "X-Trace-ID": traceId,
      },
    }
  );
}

function getErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 429:
      return "RATE_LIMITED";
    case 500:
      return "INTERNAL_ERROR";
    default:
      return "UNKNOWN_ERROR";
  }
}

// =============================================================================
// GET - FETCH MODERATOR APPLICATIONS
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const traceId = generateTraceId();

  try {
    // Validate admin authentication
    const adminUser = await validateAdminAuth();

    // Check if admin can view moderator applications
    if (!hasPermission(adminUser.adminRole, "canApproveModerators")) {
      return createErrorResponse(
        "Insufficient permissions to view moderator applications",
        403,
        traceId
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereClause.OR = [
        { guideEmail: { contains: searchTerm, mode: "insensitive" } },
        { PrimarySports: { contains: searchTerm, mode: "insensitive" } },
        { Sports: { hasSome: [searchTerm] } },
        { city: { contains: searchTerm, mode: "insensitive" } },
        { state: { contains: searchTerm, mode: "insensitive" } },
        { country: { contains: searchTerm, mode: "insensitive" } },
        { user: { firstName: { contains: searchTerm, mode: "insensitive" } } },
        { user: { lastName: { contains: searchTerm, mode: "insensitive" } } },
        { user: { email: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    // Fetch applications with user data (READ-ONLY)
    const [applications, totalCount] = await Promise.all([
      prisma.guide.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { status: "asc" }, // pending_review first
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.guide.count({ where: whereClause }),
    ]);

    // Get status counts for dashboard stats (READ-ONLY)
    const statusCounts = await prisma.guide.groupBy({
      by: ["status"],
      _count: true,
    });

    const stats = {
      total: totalCount,
      pending_review:
        statusCounts.find((s) => s.status === "pending_review")?._count || 0,
      approved: statusCounts.find((s) => s.status === "approved")?._count || 0,
      rejected: statusCounts.find((s) => s.status === "rejected")?._count || 0,
    };

    // Prepare response data
    const result = {
      applications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      stats,
      adminInfo: {
        name:
          `${adminUser.firstName} ${adminUser.lastName}`.trim() ||
          adminUser.email,
        role: adminUser.adminRole,
        permissions: {
          canApproveModerators: hasPermission(
            adminUser.adminRole,
            "canApproveModerators"
          ),
          canManageUsers: hasPermission(adminUser.adminRole, "canManageUsers"),
          canManageAdmins: hasPermission(
            adminUser.adminRole,
            "canManageAdmins"
          ),
          canViewAuditLogs: hasPermission(
            adminUser.adminRole,
            "canViewAuditLogs"
          ),
        },
      },
      filters: {
        status: status || "all",
        search: search || "",
        page,
        limit,
      },
    };

    // ✅ REMOVED: No more write operations in GET request!
    // Only log significant actions, not routine data fetching

    // ✅ OPTIONAL: Only log for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Admin ${adminUser.email} viewed applications - Page ${page}, Status: ${
          status || "all"
        }`
      );
    }

    return createSuccessResponse(
      result,
      "Applications retrieved successfully",
      traceId
    );
  } catch (error) {
    console.error(`Admin API Error [${traceId}]:`, error);

    const message =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode = message.includes("Authentication required")
      ? 401
      : message.includes("Insufficient permissions")
      ? 403
      : 500;

    return createErrorResponse(message, statusCode, traceId);
  }
}

// =============================================================================
// PATCH - UPDATE MODERATOR APPLICATION STATUS
// =============================================================================

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const traceId = generateTraceId();

  try {
    // Validate admin authentication
    const adminUser = await validateAdminAuth();

    // Check if admin can approve moderators
    if (!hasPermission(adminUser.adminRole, "canApproveModerators")) {
      return createErrorResponse(
        "Insufficient permissions to update moderator applications",
        403,
        traceId
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = bulkUpdateSchema.parse(body);

    // Update applications + create notifications in a single transaction
    const updatedApplications = await prisma.$transaction(async (tx) => {
      const updates = [];

      for (const applicationId of validatedData.applicationIds) {
        // Verify application exists and fetch related athlete id
        const existingApp = await tx.guide.findUnique({
          where: { id: applicationId },
          select: {
            id: true,
            status: true,
            guideEmail: true,
            user: {
              select: {
                id: true, // Athlete.id
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        if (!existingApp) {
          throw new Error(`Application ${applicationId} not found`);
        }

        // Update application status
        const updated = await tx.guide.update({
          where: { id: applicationId },
          data: {
            status: validatedData.status,
            reviewNote: validatedData.reviewNote,
            reviewedBy: adminUser.id,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        updates.push(updated);

        // Create notification for the applicant (if we have an athlete id)
        if (existingApp.user?.id) {
          const isApproved = validatedData.status === "approved";
          const isRejected = validatedData.status === "rejected";

          // Only notify on meaningful decisions
          if (isApproved || isRejected) {
            const title = isApproved
              ? "Guide application approved"
              : "Guide application rejected";

            const message = isApproved
              ? "Your guide application has been approved. You now have access to the full guide dashboard."
              : "Your guide application has been rejected. Please review the admin notes and consider updating your information.";

            await tx.notification.create({
              data: {
                athleteId: existingApp.user.id, // Athlete.id
                actorId: adminUser.id, // Admin athlete id
                type: isApproved
                  ? "APPLICATION_APPROVED"
                  : "APPLICATION_REJECTED",
                title,
                message,
                data: {
                  guideId: existingApp.id,
                  newStatus: validatedData.status,
                  oldStatus: existingApp.status,
                  reviewNote: validatedData.reviewNote ?? null,
                  adminId: adminUser.id,
                  adminEmail: adminUser.email,
                },
                isRead: false,
              },
            });
          }
        }

        // Log individual application update
        await logAdminAction(
          adminUser.id,
          "UPDATE_MODERATOR_APPLICATION",
          {
            targetResourceId: applicationId,
            targetResource: "MODERATOR_APPLICATION",
            oldStatus: existingApp.status,
            newStatus: validatedData.status,
            reviewNote: validatedData.reviewNote,
            applicantEmail: existingApp.user?.email || existingApp.guideEmail,
          },
          request
        );
      }

      return updates;
    });

    // Log bulk action summary
    await logAdminAction(
      adminUser.id,
      "BULK_UPDATE_MODERATOR_APPLICATIONS",
      {
        applicationIds: validatedData.applicationIds,
        newStatus: validatedData.status,
        reviewNote: validatedData.reviewNote,
        count: updatedApplications.length,
      },
      request
    );

    // Prepare success response
    const responseMessage =
      updatedApplications.length === 1
        ? `Application ${validatedData.status} successfully`
        : `${updatedApplications.length} applications ${validatedData.status} successfully`;

    return createSuccessResponse(
      {
        updatedApplications,
        count: updatedApplications.length,
        status: validatedData.status,
      },
      responseMessage,
      traceId
    );
  } catch (error) {
    console.error(`Admin PATCH Error [${traceId}]:`, error);

    let message = "Internal server error";
    let statusCode = 500;

    if (error instanceof Error) {
      message = error.message;

      if (message.includes("Authentication required")) {
        statusCode = 401;
      } else if (message.includes("Insufficient permissions")) {
        statusCode = 403;
      } else if (message.includes("not found")) {
        statusCode = 404;
      } else if (message.includes("validation") || message.includes("parse")) {
        statusCode = 400;
      }
    }

    return createErrorResponse(message, statusCode, traceId);
  }
}

// =============================================================================
// OPTIONS - CORS SUPPORT
// =============================================================================

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, PATCH, OPTIONS",
      "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// =============================================================================
// HEALTH CHECK (Optional - for monitoring)
// =============================================================================

export async function HEAD(request: NextRequest): Promise<NextResponse> {
  const traceId = generateTraceId();

  try {
    // Quick admin auth check
    await validateAdminAuth();

    // Quick database health check
    const applicationCount = await prisma.guide.count();

    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-Trace-ID": traceId,
        "X-Service-Status": "healthy",
        "X-Application-Count": applicationCount.toString(),
        "X-Timestamp": new Date().toISOString(),
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "X-Trace-ID": traceId,
        "X-Service-Status": "unhealthy",
        "X-Error": error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
