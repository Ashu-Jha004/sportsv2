// app/api/guides/nearest/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = (await req.json()) as NearestGuidesRequest;

  const {
    athleteLat,
    athleteLon,
    sportFilter = "primary",
    username,
    maxDistanceKm = 50,
    limit = 20,
  } = body;

  const maxDistanceMeters = maxDistanceKm * 1000;

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
      AND earth_distance(
        ll_to_earth(${athleteLat}, ${athleteLon}),
        ll_to_earth(g."lat", g."lon")
      ) <= ${maxDistanceMeters}
    ORDER BY distance_m ASC
    LIMIT ${limit};
  `;

  // Apply sport/username filters in JS
  const filtered = guides.filter((g) => {
    if (username && g.username !== username) return false;

    if (sportFilter === "primary") {
      return g.PrimarySports && g.PrimarySports === g.PrimarySports;
    }
    if (sportFilter === "secondary") {
      // adjust if you later store secondary sports differently
      return true;
    }
    return true; // "all"
  });
  console.log(guides);

  return NextResponse.json({ guides: filtered });
}
