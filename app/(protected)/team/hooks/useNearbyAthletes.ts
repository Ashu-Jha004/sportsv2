// lib/hooks/useNearbyAthletes.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "../lib/api/teams";
import { Sport } from "@prisma/client";
import { logger } from "../lib/utils/logger";

interface NearbyAthletesParams {
  teamId: string;
  lat: number;
  lng: number;
  sport?: Sport;
  search?: string;
}

export function useNearbyAthletes({ teamId, lat, lng, sport, search }: any) {
  const params = { lat, lng, sport, search };

  return useQuery({
    queryKey: teamQueryKeys.nearbyAthletes(params),
    queryFn: async () => {
      const url = new URL(
        `/api/teams/${teamId}/nearby-athletes`,
        location.origin
      );
      url.searchParams.set("lat", lat.toString());
      url.searchParams.set("lng", lng.toString());
      if (sport) url.searchParams.set("sport", sport);
      if (search) url.searchParams.set("search", search);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const json = await response.json();
      logger.team.debug("✅ Nearby athletes loaded", {
        teamId,
        count: json.length,
        search,
        sport,
        sampleDistance: json[0]?.distanceKm,
      });

      return json;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30000, // 30s polling
    placeholderData: [],
  });
}
