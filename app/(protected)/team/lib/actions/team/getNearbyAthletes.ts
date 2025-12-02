// actions/team/getNearbyAthletes.ts - PRODUCTION READY
"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { haversineDistance } from "../../utils/haversine";
import { Sport } from "@prisma/client";

const nearbyAthletesSchema = z.object({
  teamId: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  sport: z.nativeEnum(Sport).optional(),
  search: z.string().optional(),
  limit: z.number().max(50).default(20),
});

export async function getNearbyAthletes(
  params: z.infer<typeof nearbyAthletesSchema>
) {
  const {
    teamId,
    sport,
    search,
    limit = 20,
  } = nearbyAthletesSchema.parse(params);

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        latitude: true,
        longitude: true,
        sport: true,
        city: true,
        country: true,
      },
    });

    if (!team?.latitude || !team?.longitude) {
      console.log("❌ Team missing location:", teamId);
      return [];
    }

    console.log(
      "🏟️ Team:",
      `${team.city}, ${team.country}`,
      `(${team.latitude.toFixed(2)}°, ${team.longitude.toFixed(2)}°)`
    );

    // ✅ CORRECT Prisma: teamMembership relation = null (free agents)
    const whereClause: any = {
      teamMembership: null, // ✅ Free agents only
      latitude: {
        not: null, // ✅ Has coordinates
        gte: team.latitude - 2,
        lte: team.latitude + 2,
      },
      longitude: {
        not: null, // ✅ Has coordinates
        gte: team.longitude - 2,
        lte: team.longitude + 2,
      },
    };

    // Sport filter
    if (sport) {
      whereClause.OR = [{ primarySport: sport }, { secondarySport: sport }];
    }

    // Search filter
    if (search) {
      const searchOR = whereClause.OR ? [...whereClause.OR] : [];
      searchOR.push(
        { username: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } }
      );
      whereClause.OR = searchOR;
    }

    console.log("🔍 Where clause:", JSON.stringify(whereClause, null, 2));

    // Query athletes
    const athletes = await prisma.athlete.findMany({
      where: whereClause,
      take: limit * 2,
      select: {
        id: true,
        clerkUserId: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        primarySport: true,
        secondarySport: true,
        rank: true,
        class: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
      },
      orderBy: sport
        ? [{ primarySport: "asc" }, { rank: "desc" }, { class: "desc" }]
        : [{ rank: "desc" }, { class: "desc" }],
    });

    console.log("🔍 Found athletes:", athletes.length);

    // Calculate distances + filter <100km
    const nearbyAthletes = athletes
      .map((athlete) => {
        if (!athlete.latitude || !athlete.longitude) return null;

        const distanceKm = haversineDistance(
          { lat: team.latitude, lng: team.longitude },
          { lat: athlete.latitude, lng: athlete.longitude }
        );

        return {
          ...athlete,
          distanceKm,
        };
      })
      .filter((athlete): any => athlete !== null && athlete.distanceKm <= 100)
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    console.log("✅ Nearby athletes:", {
      teamLocation: `${team.city} (${team.latitude.toFixed(
        2
      )}°, ${team.longitude.toFixed(2)}°)`,
      rawCount: athletes.length,
      finalCount: nearbyAthletes.length,
      closest: nearbyAthletes[0]?.distanceKm?.toFixed(1),
    });

    return nearbyAthletes;
  } catch (error) {
    logger.team.error(error as Error, { teamId, sport, search });
    return [];
  }
}
