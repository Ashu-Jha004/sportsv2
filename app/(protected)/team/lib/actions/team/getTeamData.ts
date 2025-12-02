  // actions/team/getTeamData.ts
  "use server";

  import prisma from "@/lib/prisma";
  import { TeamWithRelations } from "../../types/team";
  import { logger } from "../../utils/logger";

  export async function getTeamData({
    teamId,
    currentUserId,
  }: {
    teamId: string;
    currentUserId: string | null;
  }) {
    const startTime = Date.now();

    try {
      const team = await prisma.team.findUnique({
        where: { teamApplicationId: teamId },
        select: {
          id: true,
          name: true,
          bio: true,
          logoUrl: true,
          sport: true,
          class: true,
          rank: true,
          country: true,
          state: true,
          city: true,
          latitude: true,
          longitude: true,
          status: true,
          ownerId: true,
          overseerGuideId: true,
          createdAt: true,
          updatedAt: true,

          // Owner profile (minimal)
          owner: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              rank: true,
              class: true,
            },
          },

          // Guide overseer (minimal)
          overseerGuide: {
            select: {
              id: true,
              guideEmail: true,
              PrimarySports: true,
              city: true,
              country: true,
            },
          },

          // ✅ FIXED: Query through TeamMembership join table
          members: {
            take: 50,
            select: {
              id: true,
              role: true,
              isCaptain: true,
              createdAt: true,
              // Now query the athlete relation
              athlete: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                  primarySport: true,
                  rank: true,
                  class: true,
                },
              },
            },
            // ✅ FIXED: Order by role directly (no nested orderBy)
            orderBy: [{ role: "desc" }, { createdAt: "desc" }],
          },

          // Team counters
          counters: {
            select: {
              membersCount: true,
              postsCount: true,
              matchesPlayed: true,
            },
          },

          // Recent posts (limit 5)
          posts: {
            take: 5,
            select: {
              id: true,
              type: true,
              title: true,
              content: true,
              mediaUrls: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },

          // Upcoming matches (limit 3)
          homeMatches: {
            where: {
              status: { in: ["SCHEDULING", "SCHEDULED"] },
            },
            take: 3,
            select: {
              id: true,
              status: true,
              scheduledStart: true,
              challengerTeam: {
                select: { id: true, name: true, logoUrl: true },
              },
              challengedTeam: {
                select: { id: true, name: true, logoUrl: true },
              },
            },
            orderBy: { scheduledStart: "asc" },
          },
          awayMatches: {
            where: {
              status: { in: ["SCHEDULING", "SCHEDULED"] },
            },
            take: 3,
            select: {
              id: true,
              status: true,
              scheduledStart: true,
              challengerTeam: {
                select: { id: true, name: true, logoUrl: true },
              },
              challengedTeam: {
                select: { id: true, name: true, logoUrl: true },
              },
            },
            orderBy: { scheduledStart: "asc" },
          },
        },
      });

      if (!team) {
        logger.team.debug("Team not found:", teamId);
        return null;
      }

      // ✅ Transform data to match TeamWithRelations interface
      const transformedTeam: any = {
        ...team,
        // Flatten members structure
        members: team.members.map((membership) => ({
          ...membership.athlete,
          TeamMembership: {
            role: membership.role,
            isCaptain: membership.isCaptain,
          },
        })),
        // Combine home and away matches
        upcomingMatches: [...team.homeMatches, ...team.awayMatches]
          .sort((a, b) => {
            if (!a.scheduledStart || !b.scheduledStart) return 0;
            return (
              new Date(a.scheduledStart).getTime() -
              new Date(b.scheduledStart).getTime()
            );
          })
          .slice(0, 3),
        // Rename posts to recentPosts
        recentPosts: team.posts,
      };

      const queryTime = Date.now() - startTime;
      logger.team.debug("✅ getTeamData success", {
        teamId,
        queryTime: `${queryTime}ms`,
        memberCount: transformedTeam.members.length,
        postsCount: transformedTeam.recentPosts?.length || 0,
      });

      return transformedTeam;
    } catch (error) {
      const queryTime = Date.now() - startTime;
      logger.team.error(error as Error, {
        teamId,
        currentUserId,
        queryTime: `${queryTime}ms`,
      });
      throw error; // Re-throw to be caught by error boundary
    }
  }
