// app/api/guides/nearest/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type NearestGuidesRequest = {
  athleteLat: number;
  athleteLon: number;
  sportFilter?: "primary" | "secondary" | "all";
  sport?: string | null;
  maxDistanceKm?: number;
  limit?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NearestGuidesRequest;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      athleteLat,
      athleteLon,
      sportFilter = "primary",
      sport = null,
      maxDistanceKm = 50,
      limit = 20,
    } = body;

    const maxDistanceMeters = maxDistanceKm * 1000;

    // Get current user's athlete profile
    const currentAthlete = await prisma.athlete.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, username: true },
    });

    if (!currentAthlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 }
      );
    }

    const guides = await prisma.$queryRaw<
      {
        id: string;
        username: string;
        profileImamge: string;
        firstName: string | null;
        lastName: string | null;
        rank: string | null;
        class: string | null;
        PrimarySports: string | null;
        Sports: string[] | null;
        Experience: number | null;
        reviewNote: string | null;
        city: string | null;
        country: string | null;
        status: string;
        distance_m: number | null;
      }[]
    >`
      SELECT
        g.id,
        a."username",
        a."firstName",
        a."lastName",
        a."rank",
        a."class",
        g."PrimarySports",
        g."Sports",
        g."Experience",
        g."reviewNote",
        g."city",
        g."country",
        g."status",
        earth_distance(
          ll_to_earth(${athleteLat}, ${athleteLon}),
          ll_to_earth(g."lat", g."lon")
        ) AS distance_m
      FROM "Guide" g
      JOIN "Athlete" a ON a.id = g."userId"
      WHERE
        g."status" = 'approved'
        AND g."lat" IS NOT NULL
        AND g."lon" IS NOT NULL
        AND g."userId" <> ${currentAthlete.id}
        AND earth_distance(
          ll_to_earth(${athleteLat}, ${athleteLon}),
          ll_to_earth(g."lat", g."lon")
        ) <= ${maxDistanceMeters}
      ORDER BY distance_m ASC
      LIMIT ${limit};
    `;

    // Apply sport filters
    const filtered = guides.filter((g) => {
      if (!sport) return true;

      if (sportFilter === "primary") {
        return g.PrimarySports === sport;
      }
      if (sportFilter === "secondary") {
        return Array.isArray(g.Sports) && g.Sports.includes(sport);
      }
      // "all": match either primary or secondary
      return (
        g.PrimarySports === sport ||
        (Array.isArray(g.Sports) && g.Sports.includes(sport))
      );
    });

    return NextResponse.json({ guides: filtered });
  } catch (error) {
    console.error("[API /guides/nearest] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
