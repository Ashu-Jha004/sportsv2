// app/(guide)/dashboard/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import GuideDashboardHeader from "./components/GuideDashboardHeader";
import GuideDashboardBody from "./components/GuideDashboardBody";

type GuideStatus = "pending_review" | "approved" | "rejected";

export default async function GuideDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  // Find athlete by Clerk user id
  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!athlete) {
    // No athlete profile yet – send to athlete onboarding
    redirect("/onboarding");
  }

  const guide = await prisma.guide.findUnique({
    where: { userId: athlete.id },
    select: {
      id: true,
      guideEmail: true,
      PrimarySports: true,
      Sports: true,
      Experience: true,
      state: true,
      city: true,
      country: true,
      lat: true,
      lon: true,
      status: true,
      reviewNote: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });

  if (!guide) {
    // No guide application yet – back to guide onboarding wizard
    redirect("/business/feature/guide/onboarding");
  }

  const status = guide.status as GuideStatus;

  if (status === "pending_review") {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col gap-4 px-4 py-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Guide application
            </h1>
            <p className="text-sm text-gray-500">
              Your application is currently under review by the admin team.
            </p>
          </div>
          <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
            Pending review
          </div>
        </header>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">
            Thank you for applying to become a guide. We will notify you as soon
            as a decision is made. You can safely close this page; once
            approved, your full guide dashboard will become available here.
          </p>

          {guide.reviewNote && (
            <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-700">
              <p className="font-medium text-gray-900">Admin note</p>
              <p>{guide.reviewNote}</p>
            </div>
          )}
        </section>
      </main>
    );
  }

  if (status === "rejected") {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col gap-4 px-4 py-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Guide application
            </h1>
            <p className="text-sm text-gray-500">
              Your application has been reviewed.
            </p>
          </div>
          <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200">
            Rejected
          </div>
        </header>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">
            Unfortunately, your guide application was not approved at this time.
            You may review the admin&apos;s notes below and submit an updated
            application in the future.
          </p>

          {guide.reviewNote && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-xs text-red-700">
              <p className="font-medium">Reason from admin</p>
              <p>{guide.reviewNote}</p>
            </div>
          )}
        </section>
      </main>
    );
  }

  // Approved guide – render full dashboard (header + body components)
  return (
    <main className="flex min-h-[60vh] flex-col gap-4 px-4 py-6 md:px-6 lg:px-8">
      <GuideDashboardHeader
        guide={{
          id: guide.id,
          name:
            `${guide.user?.firstName ?? ""} ${
              guide.user?.lastName ?? ""
            }`.trim() ||
            guide.user?.email ||
            guide.guideEmail,
          email: guide.guideEmail ?? guide.user?.email ?? "",
          status: guide.status as GuideStatus,
          location: {
            city: guide.city,
            state: guide.state,
            country: guide.country,
            lat: guide.lat,
            lon: guide.lon,
          },
          primarySport: guide.PrimarySports,
        }}
      />

      <GuideDashboardBody
        guide={{
          id: guide.id,
          guideEmail: guide.guideEmail,
          primarySport: guide.PrimarySports,
          secondarySports: guide.Sports,
          experience: guide.Experience,
          city: guide.city,
          state: guide.state,
          country: guide.country,
          lat: guide.lat,
          lon: guide.lon,
          status: guide.status as GuideStatus,
          reviewNote: guide.reviewNote,
          createdAt: guide.createdAt,
          updatedAt: guide.updatedAt,
        }}
      />
    </main>
  );
}
