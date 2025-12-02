// app/team/[teamId]/_components/invite/AthleteCard.tsx - FIXED
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { sendTeamInvitation } from "../../../lib/actions/team/sendInvitation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Crown, UserCheck } from "lucide-react";

interface AthleteCardProps {
  athlete: any;
  teamId: string;
  distance?: number;
}

export default function AthleteCard({
  athlete,
  teamId,
  distance,
}: AthleteCardProps) {
  const queryClient = useQueryClient();

  const sendInvite = useMutation({
    mutationFn: () => sendTeamInvitation({ teamId, athleteId: athlete.id }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `✅ Invite sent to ${athlete.firstName} ${athlete.lastName}!`,
          { duration: 4000 }
        );
        // ✅ FIXED: Proper query invalidation
        queryClient.invalidateQueries({
          queryKey: ["team-invites", "pending", teamId],
        });
        queryClient.invalidateQueries({ queryKey: ["nearby-athletes"] });
      } else {
        toast.error(data.error || "Failed to send invite");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send invite");
    },
  });

  const isFreeAgent = !athlete.teamMembership;

  return (
    <Card className="group hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-300/50 transition-all duration-300 overflow-hidden border-slate-200 bg-white/80 backdrop-blur-sm hover:-translate-y-2">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {" "}
            {/* ✅ Tailwind: flex-shrink-0 → shrink-0 */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-slate-200/50 group-hover:ring-emerald-400/50 transition-all">
              <Image
                src={
                  athlete.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${
                    athlete.username || athlete.id
                  }`
                }
                alt={`${athlete.firstName} ${athlete.lastName}`}
                width={80}
                height={80}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                unoptimized
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <h4 className="font-bold text-xl text-slate-900 group-hover:text-emerald-600 truncate">
                  {athlete.firstName} {athlete.lastName}
                </h4>
                <p className="text-sm font-semibold text-slate-600">
                  @{athlete.username || "no-username"}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="bg-gradient-linear-to-r from-purple-500/20 to-pink-500/20 text-purple-800 border-purple-200"
              >
                {" "}
                {/* ✅ Fixed gradient */}
                {athlete.rank} {athlete.class}
              </Badge>
              <Badge
                variant="outline"
                className="bg-gradient-linear-to-r from-emerald-500/20 to-green-500/20 text-emerald-800 border-emerald-200"
              >
                {" "}
                {/* ✅ Fixed gradient */}
                {athlete.primarySport}
              </Badge>
              {distance && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <MapPin className="w-3 h-3 mr-1" />
                  {distance.toFixed(1)}km
                </Badge>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
              {isFreeAgent ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Free agent</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 text-orange-500" />
                  <span>In another team</span>
                </>
              )}
            </div>
          </div>

          {/* Invite Button */}
          {isFreeAgent && (
            <Button
              size="sm"
              className="bg-gradient-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 text-white font-semibold shadow-lg whitespace-nowrap ml-auto group-hover:scale-105 transition-all px-6"
              onClick={() => sendInvite.mutate()}
              disabled={sendInvite.isPending}
            >
              {sendInvite.isPending ? (
                <>
                  <span className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-r-transparent mr-2" />
                  Sending...
                </>
              ) : (
                "Invite"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
