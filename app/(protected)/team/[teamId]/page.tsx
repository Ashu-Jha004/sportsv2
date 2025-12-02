// app/team/[teamId]/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTeamData } from "../lib/actions/team/getTeamData";
import TeamPageClient from "./_components/TeamPageClient";
import { logger } from "../lib/utils/logger";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

interface TeamPageProps {
  params: Promise<{ teamId: string }>; // ✅ Next.js 15: params is a Promise
}

export default async function TeamPage({ params }: TeamPageProps) {
  // ✅ FIXED: Await cookies() and params
  const cookieStore = await cookies();
  const { teamId } = await params;
  const { userId }: any = await auth();
  const athlete = await prisma.athlete.findUnique({
    where: { clerkUserId: userId }, // ← Match Clerk → Athlete!
    select: { id: true },
  });

  if (!teamId) {
    logger.team.error(new Error("Missing teamId param"));
    redirect("/teams");
  }

  try {
    const teamData = await getTeamData({
      teamId,
      currentUserId: athlete?.id || null,
    });

    if (!teamData) {
      logger.team.debug("Team not found:", teamId);
      throw new Error(`Team with ID ${teamId} not found`);
    }

    logger.team.debug("✅ Team data loaded for RSC:", {
      teamId,
      memberCount: teamData.members.length,
      hasViewerMembership: !!teamData.members.find((m: any) => m.id === userId),
    });

    return (
      <TeamPageClient
        initialTeamData={teamData}
        currentUserId={athlete?.id || null}
        teamId={teamId}
      />
    );
  } catch (error) {
    logger.team.error(error as Error, { teamId, userId: userId });
    throw error; // Let error boundary handle it
  }
}

// ✅ FIXED: Async metadata generation
export async function generateMetadata({ params }: TeamPageProps) {
  try {
    const { teamId } = await params;
    const teamData = await getTeamData({
      teamId,
      currentUserId: null,
    });

    return {
      title: `${teamData?.name || "Team"} - Sports Performance Platform`,
      description:
        teamData?.bio || "View team profile, members, matches, and more.",
    };
  } catch {
    return {
      title: "Team Not Found",
    };
  }
}
