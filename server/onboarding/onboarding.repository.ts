// src/server/onboarding/onboarding.repository.ts
import prisma from "@/lib/prisma";
import type { OnboardingRequestDTO } from "@/lib/validations/onboarding/onboarding.dto";

export type AthleteEntity = Awaited<
  ReturnType<OnboardingRepository["findByClerkUserId"]>
>;

export class OnboardingRepository {
  private readonly db;

  constructor(dbClient: any) {
    this.db = dbClient ?? prisma;
  }

  async findByClerkUserId(clerkUserId: string) {
    return this.db.athlete.findUnique({
      where: { clerkUserId },
    });
  }

  async upsertByClerkUserId(
    clerkUserId: string,
    payload: OnboardingRequestDTO
  ) {
    const { profile, sports, location } = payload;

    const dateOfBirth = new Date(profile.dateOfBirth);
    console.log("[repo] upsert start for", clerkUserId);

    const result = await this.db.athlete.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImage: profile.profileImage ?? undefined,
        dateOfBirth,
        gender: profile.gender,
        bio: profile.bio ?? undefined,
        primarySport: sports.primarySport,
        secondarySport: sports.secondarySport ?? undefined,
        country: location.country,
        state: location.state,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        onboardingComplete: true,
      },
      update: {
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImage: profile.profileImage ?? undefined,
        dateOfBirth,
        gender: profile.gender,
        bio: profile.bio ?? undefined,
        primarySport: sports.primarySport,
        secondarySport: sports.secondarySport ?? undefined,
        country: location.country,
        state: location.state,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        onboardingComplete: true,
      },
    });

    console.log("[repo] upsert done in");

    return result;
  }
}
