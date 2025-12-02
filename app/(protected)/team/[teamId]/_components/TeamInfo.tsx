// app/team/[teamId]/_components/TeamInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Shield } from "lucide-react";
import Image from "next/image";
import { TeamWithRelations } from "../../lib/types/team";
import { formatDistanceToNow } from "date-fns";

interface TeamInfoProps {
  team: TeamWithRelations;
}

export default function TeamInfo({ team }: TeamInfoProps) {
  const memberRoles = team.members.reduce((acc, member) => {
    const role = member.TeamMembership.role;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentActivity = [
    ...(team.recentPosts?.map((post) => ({
      type: "post",
      title: post.title || "New post",
      date: post.createdAt,
      icon: "📝",
    })) || []),
    ...(team.upcomingMatches?.map((match) => ({
      type: "match",
      title: `vs ${match.challengerTeam?.name || match.challengedTeam?.name}`,
      date: match.scheduledStart!,
      icon: "⚽",
    })) || []),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {/* Team Details */}
      <Card className="lg:col-span-2 xl:col-span-2 border-slate-200/50 backdrop-blur-sm bg-white/80 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-8 h-8 text-emerald-500" />
            Team Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sport & Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2 block">
                Primary Sport
              </span>
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                {team.sport}
              </Badge>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Classification
              </span>
              <div className="flex gap-2">
                {team.rank && (
                  <Badge
                    variant="outline"
                    className="bg-linear-to-r from-purple-500/10 to-pink-500/10 border-purple-200 text-purple-800"
                  >
                    {team.rank}
                  </Badge>
                )}
                {team.class && (
                  <Badge
                    variant="secondary"
                    className="bg-linear-to-r from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800"
                  >
                    Class {team.class}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          {team.city && (
            <div className="flex items-center gap-3 p-4 bg-linear-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
              <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{team.city}</div>
                <div className="text-sm text-slate-600">
                  {team.state}, {team.country}
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          {team.status !== "ACTIVE" && (
            <div className="p-4 bg-linear-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                <div>
                  <div className="font-semibold text-orange-900">
                    Team Status
                  </div>
                  <div className="text-sm text-orange-800 capitalize">
                    {team.status.toLowerCase().replace("_", " ")}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-slate-200/50 backdrop-blur-sm bg-white/80 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Calendar className="w-6 h-6 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 text-white font-bold text-sm">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                      {activity.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(activity.date), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium">No recent activity</div>
                <div className="text-sm">Team activity will appear here</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Member Breakdown */}
      <Card className="border-slate-200/50 backdrop-blur-sm bg-white/80 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Users className="w-6 h-6 text-emerald-500" />
            Member Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(memberRoles).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="capitalize font-medium text-slate-900">
                  {role.toLowerCase()}
                </span>
                <Badge className="bg-linear-to-r from-slate-100 to-slate-200 text-slate-800">
                  {count}
                </Badge>
              </div>
            ))}
            {team.members.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No members yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
