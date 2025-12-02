// lib/hooks/useCurrentUser.ts
"use client";
import { useUser } from "@clerk/nextjs";

export function useCurrentUser() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return { userId: null, isLoaded: false };

  return {
    userId: (user?.publicMetadata?.athleteId as string) || user?.id || null,
    isLoaded: true,
    user,
  };
}
