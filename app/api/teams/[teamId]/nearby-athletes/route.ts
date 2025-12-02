// app/api/teams/[teamId]/nearby-athletes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getNearbyAthletes } from "@/app/(protected)/team/lib/actions/team/getNearbyAthletes";
import { logger } from "@/app/(protected)/team/lib/utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);

    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const sport = searchParams.get("sport") as any;
    const search = searchParams.get("search") || undefined;

    logger.team.debug("📡 Nearby athletes API", {
      teamId,
      lat,
      lng,
      sport,
      search,
    });

    const athletes = await getNearbyAthletes({
      teamId,
      lat,
      lng,
      sport: sport || "",
      search: search || "",
      limit:50
    });

    return NextResponse.json(athletes);
  } catch (error) {
    logger.team.error(error as Error, {
      endpoint: "/api/teams/[teamId]/nearby-athletes",
      method: "GET",
    });

    return NextResponse.json([], { status: 500 });
  }
}
