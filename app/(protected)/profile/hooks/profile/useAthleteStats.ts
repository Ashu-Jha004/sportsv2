// hooks/useAthleteStats.ts
import { useQuery } from "@tanstack/react-query";

export function useAthleteStats(athleteId: string) {
  return useQuery({
    queryKey: ["athlete-stats", athleteId],
    queryFn: async () => {
      const res = await fetch(`/api/athletes/${athleteId}/stats`);
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json() as Promise<AthleteStatsResponse>;
    },
  });
}
