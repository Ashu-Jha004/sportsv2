"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { sendTeamInvitation } from "../../../lib/actions/team/sendInvitation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Crown, UserCheck, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Athlete {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  primarySport?: string;
  rank?: string;
  class?: string;
  teamMembership?: any;
}

interface AthleteCardProps {
  athlete: Athlete;
  teamId: string;
  distance?: number;
  onInviteSuccess?: () => void;
}

export default function AthleteCard({
  athlete,
  teamId,
  distance,
  onInviteSuccess,
}: AthleteCardProps) {
  const queryClient = useQueryClient();
  const [inviteSent, setInviteSent] = useState(false);

  const sendInvite = useMutation({
    mutationFn: () => sendTeamInvitation({ teamId, athleteId: athlete.id }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Invite sent to ${athlete.firstName}!`, {
          duration: 3000,
        });
        setInviteSent(true);

        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: ["team-invites", teamId],
        });
        queryClient.invalidateQueries({
          queryKey: ["nearby-athletes", teamId],
        });

        // Call parent callback if provided
        onInviteSuccess?.();
      } else {
        toast.error(data.error || "Failed to send invite");
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to send invite");
    },
  });

  const isFreeAgent = !athlete.teamMembership;
  const canInvite = isFreeAgent && !inviteSent;

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-200 overflow-hidden border min-h-[180px] ${
        inviteSent
          ? "border-emerald-300 bg-emerald-50/50"
          : "border-slate-200 hover:border-emerald-200 bg-white"
      }`}
    >
      <CardContent className="p-4">
        {/* Mobile: Vertical Layout, Desktop: Horizontal */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar & Name Section */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ring-2 ring-slate-200 group-hover:ring-emerald-300 transition-all">
                <Image
                  src={
                    athlete.profileImage ||
                    `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${
                      athlete.username || athlete.id
                    }`
                  }
                  alt={`${athlete.firstName} ${athlete.lastName}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Status Badge Overlay */}
              {inviteSent && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base sm:text-lg text-slate-900 truncate">
                {athlete.firstName} {athlete.lastName}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 truncate">
                @{athlete.username || "no-username"}
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {athlete.rank && athlete.class && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-purple-100 text-purple-700 border-purple-200"
                  >
                    {athlete.rank} {athlete.class}
                  </Badge>
                )}
                {athlete.primarySport && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200"
                  >
                    {athlete.primarySport}
                  </Badge>
                )}
                {distance !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-0.5" />
                    {distance.toFixed(1)}km
                  </Badge>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                {isFreeAgent ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">
                      {inviteSent ? "Invite sent" : "Free agent"}
                    </span>
                  </>
                ) : (
                  <>
                    <Crown className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-slate-600">In another team</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {canInvite && (
            <div className="flex sm:flex-col justify-end items-end sm:items-center">
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium shadow-sm transition-all w-full sm:w-auto"
                onClick={() => sendInvite.mutate()}
                disabled={sendInvite.isPending}
                aria-label={`Invite ${athlete.firstName} to team`}
              >
                {sendInvite.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending
                  </>
                ) : (
                  "Invite"
                )}
              </Button>
            </div>
          )}

          {/* Already Invited State */}
          {inviteSent && (
            <div className="flex items-center justify-center sm:justify-end">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Invited
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
