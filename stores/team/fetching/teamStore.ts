// lib/stores/teamStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { TeamWithRelations } from "@/app/(protected)/team/lib/types/team";

interface TeamStore {
  activeTab: "overview" | "members" | "posts" | "matches";
  isFollowing: boolean;
  showDebugPanel: boolean;
  memberCount: number;
  postCount: number;
  matchCount: number;
  followerCount: number;
  pendingInvitesCount: number;
  teamData: TeamWithRelations | null;

  setActiveTab: (tab: TeamStore["activeTab"]) => void;
  setTeamData: (data: TeamWithRelations | null) => void;
  toggleFollowing: () => void;
  // ✅ FIXED: Proper typing for partial updates
  updateCounts: (
    counts: Partial<{
      memberCount: number;
      postCount: number;
      matchCount: number;
      followerCount: number;
      pendingInvitesCount: number;
    }>
  ) => void;
  incrementPendingInvites: () => void;
  toggleDebug: () => void;
  reset: () => void;
}

export const useTeamStore = create<TeamStore>()(
  devtools(
    (set, get) => ({
      activeTab: "overview",
      isFollowing: false,
      showDebugPanel: process.env.NODE_ENV === "development",
      memberCount: 0,
      postCount: 0,
      matchCount: 0,
      followerCount: 0,
      pendingInvitesCount: 0,
      teamData: null,

      setActiveTab: (tab) => set({ activeTab: tab }),

      setTeamData: (data) => {
        set((state) => ({
          ...state,
          teamData: data,
          memberCount:
            data?.counters?.membersCount || data?.members.length || 0,
          postCount:
            data?.counters?.postsCount || data?.recentPosts?.length || 0,
          matchCount: data?.upcomingMatches?.length || 0,
        }));
      },

      toggleFollowing: () => {
        console.warn(
          "[teamStore] toggleFollowing is deprecated - use FollowButton component"
        );
      },
      // ✅ FIXED: Type-safe partial updates
      updateCounts: (counts) => {
        set((state) => ({
          ...state,
          ...counts,
        }));
      },

      incrementPendingInvites: () => {
        set((state) => ({
          pendingInvitesCount: state.pendingInvitesCount + 1,
        }));
      },

      toggleDebug: () =>
        set((state) => ({
          showDebugPanel: !state.showDebugPanel,
        })),

      reset: () => {
        set({
          activeTab: "overview",
          isFollowing: false,
          memberCount: 0,
          postCount: 0,
          matchCount: 0,
          followerCount: 0,
          pendingInvitesCount: 0,
          teamData: null,
        });
      },
    }),
    {
      name: "team-store",
    }
  )
);
