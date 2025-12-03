"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamStore } from "@/stores/team/fetching/teamStore";
import { getTeamPermissions } from "../../lib/utils/teamPermissions";
import MembersList from "./members/MembersList";
import PostsFeedInfinite from "./posts/PostsFeedInfinite";
import MatchesList from "./matches/MatchesList";
import TeamInfo from "./TeamInfo";
import { TeamWithRelations } from "../../lib/types/team";
import { Users, MessageCircle, Trophy, Info } from "lucide-react";
import CreatePostDialog from "./posts/CreatePostDialog";
import { Badge } from "@/components/ui/badge";

interface TeamTabsProps {
  team: TeamWithRelations;
  currentUserId: string | null;
}

export default function TeamTabs({ team, currentUserId }: TeamTabsProps) {
  const { activeTab, setActiveTab }: any = useTeamStore();
  const permissions = getTeamPermissions(team, currentUserId);

  const membersCount = team.members?.length || 0;
  const postsCount = team.counters?.postsCount || team.recentPosts?.length || 0;
  const matchesCount = team.counters?.matchesPlayed || 0;
  console.log("counter", team);
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tab Navigation - Responsive */}
      <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <TabsList className="w-full h-auto bg-transparent border-0 p-0 grid grid-cols-4 gap-0">
          {/* Overview Tab */}
          <TabsTrigger
            value="overview"
            className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 rounded-t-lg transition-all"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Overview
            </span>
            <span className="text-xs font-medium sm:hidden">Info</span>
          </TabsTrigger>

          {/* Members Tab */}
          <TabsTrigger
            value="members"
            className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 data-[state=active]:bg-orange-50/50 rounded-t-lg transition-all"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Members
            </span>
            <span className="text-xs font-medium sm:hidden">Team</span>
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto h-5 min-w-5 text-xs px-1.5"
            >
              {membersCount}
            </Badge>
          </TabsTrigger>

          {/* Posts Tab */}
          <TabsTrigger
            value="posts"
            className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-purple-50/50 rounded-t-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Posts
            </span>
            <span className="text-xs font-medium sm:hidden">Feed</span>
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto h-5 min-w-5 text-xs px-1.5"
            >
              {postsCount}
            </Badge>
          </TabsTrigger>

          {/* Matches Tab */}
          <TabsTrigger
            value="matches"
            className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:bg-emerald-50/50 rounded-t-lg transition-all"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Matches
            </span>
            <span className="text-xs font-medium sm:hidden">Games</span>
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto h-5 min-w-5 text-xs px-1.5"
            >
              {matchesCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content */}
      <div className="mt-6 sm:mt-8">
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Team Posts
            </h3>
            {permissions.canPost && <CreatePostDialog teamId={team.id} />}
          </div>
          <PostsFeedInfinite teamId={team.id} />
        </TabsContent>

        <TabsContent value="matches" className="mt-0">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Team Matches
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              View match history and upcoming games
            </p>
          </div>
          <MatchesList teamId={team.id} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
