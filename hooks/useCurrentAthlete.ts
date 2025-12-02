// lib/hooks/useCurrentAthlete.ts
"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useCurrentAthlete() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [athleteId, setAthleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Get athleteId from Clerk publicMetadata or custom field
    const id =
      (user.publicMetadata?.athleteId as string) ||
      (user.publicMetadata?.databaseId as string) ||
      null;

    setAthleteId(id);
  }, [user, isLoaded]);

  return {
    athleteId,
    isLoaded,
    user,
    isAuthenticated: !!user && !!athleteId,
  };
}
