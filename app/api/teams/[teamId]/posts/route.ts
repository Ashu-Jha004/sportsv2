import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/app/(protected)/team/lib/utils/logger";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const cursor = searchParams.get("cursor");

    const skip = page * limit;

    const posts = await prisma.teamPost.findMany({
      where: { teamId },
      take: limit + 1,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profileImage: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            teamApplicationId: true,
          },
        },
      },
    });

    const hasNextPage = posts.length > limit;
    const nextCursor = hasNextPage ? page + 1 : null;

    return NextResponse.json({
      success: true,
      data: posts.slice(0, limit),
      nextCursor,
      pageInfo: {
        hasNextPage,
        totalCount: await prisma.teamPost.count({ where: { teamId } }),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

const createPostSchema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().min(1).max(1000),
  postType: z.enum(["UPDATE", "PHOTO", "VIDEO", "MATCH", "OTHER"]),
  mediaUrls: z.array(z.string().url().max(500)).max(6).optional().default([]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId }: any = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current athlete
    const athlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Verify team membership and post permissions
    const membership = await prisma.teamMembership.findFirst({
      where: {
        teamId,
        athleteId: athlete.id,
        role: {
          in: ["OWNER", "CAPTAIN", "PLAYER", "MANAGER"],
        },
      },
      select: { role: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not authorized to post in this team" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createPostSchema.parse(body);

    // Create post
    const post = await prisma.teamPost.create({
      data: {
        teamId,
        authorId: athlete.id,
        type: validated.postType,
        title: validated.title,
        content: validated.content,
        mediaUrls: validated.mediaUrls,
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profileImage: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            teamApplicationId: true,
          },
        },
      },
    });

    const pathId = post.team?.teamApplicationId || post.teamId;

    // Notify team members (excluding author)
    const teamMembers = await prisma.teamMembership.findMany({
      where: {
        teamId,
        athleteId: { not: athlete.id },
      },
      select: { athleteId: true },
    });

    await prisma.$transaction(
      teamMembers.map((member) =>
        prisma.notification.create({
          data: {
            athleteId: member.athleteId,
            actorId: athlete.id,
            type: "TEAM_POST",
            title: "New Team Post",
            message: `${post.author.firstName} ${post.author.lastName} posted in ${post.team.name}`,
            data: {
              teamId,
              postId: post.id,
              postType: post.type,
            },
          },
        })
      )
    );

    logger.team.debug("✅ Post created", {
      postId: post.id,
      teamId,
      authorId: athlete.id,
      type: validated.postType,
    });

    revalidatePath(`/team/${pathId}`);

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid post data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
