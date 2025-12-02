// app/team/[teamId]/_components/TeamTabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamStore } from "@/stores/team/fetching/teamStore";
import { getTeamPermissions } from "../../lib/utils/teamPermissions";
import MembersList from "./members/MembersList";
// import PostsFeed from "./posts/PostsFeed";
import PostsFeedInfinite from "./posts/PostsFeedInfinite";
import MatchesList from "./matches/MatchesList";
import TeamInfo from "./TeamInfo";
import { TeamWithRelations } from "../../lib/types/team";
import { Users, MessageCircle, Trophy } from "lucide-react";
import CreatePostDialog from "./posts/CreatePostDialog";

interface TeamTabsProps {
  team: TeamWithRelations;
  currentUserId: string | null;
}

export default function TeamTabs({ team, currentUserId }: any) {
  const { activeTab, setActiveTab }: any = useTeamStore();
  const permissions = getTeamPermissions(team, currentUserId);

  return (
    <>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-md border-slate-200 rounded-3xl p-1 shadow-xl sticky top-4 z-20">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-2xl py-3 font-semibold"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-2xl py-3 font-semibold"
          >
            <Users className="w-4 h-4 mr-1" />
            Members ({team.counters?.membersCount || team.members.length})
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-2xl py-3 font-semibold"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Posts ({team.counters?.postsCount || team.recentPosts?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-2xl py-3 font-semibold"
          >
            <Trophy className="w-4 h-4 mr-1" />
            Matches ({team.counters?.matchesPlayed || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-8">
          <TabsContent value="overview" className="mt-0">
            <TeamInfo team={team} />
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <MembersList
              team={team}
              currentUserId={currentUserId}
              permissions={permissions}
            />
          </TabsContent>

          <TabsContent value="posts" className="mt-0">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Team Posts</h3>
              <CreatePostDialog teamId={team.id} />
            </div>
            <PostsFeedInfinite teamId={team.id} />
          </TabsContent>

          <TabsContent value="matches" className="mt-0">
            <MatchesList teamId={team.id} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
