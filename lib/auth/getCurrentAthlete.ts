// src/lib/auth/getCurrentAthlete.ts
"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "../prisma";

export async function getCurrentAthleteOrThrow() {
  const user = await currentUser();

  if (!user) {
    // Not authenticated
    throw Object.assign(new Error("UNAUTHENTICATED"), {
      code: "AUTH_UNAUTHENTICATED",
      scope: "notifications:getCurrentAthlete",
    });
  }

  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!athlete) {
    // Athlete record missing for a valid Clerk user
    throw Object.assign(new Error("ATHLETE_NOT_FOUND"), {
      code: "ATHLETE_NOT_FOUND",
      scope: "notifications:getCurrentAthlete",
      meta: { clerkUserId: user.id },
    });
  }

  return athlete;
}
