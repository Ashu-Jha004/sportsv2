// hooks/useNearestGuides.ts
import { useMutation } from "@tanstack/react-query";

export function useNearestGuides() {
  return useMutation({
    mutationKey: ["nearest-guides"],
    mutationFn: async (body: NearestGuidesRequest) => {
      const res = await fetch("/api/guides/nearest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to load nearby guides");
      return res.json() as Promise<NearestGuidesResponse>;
    },
  });
}
