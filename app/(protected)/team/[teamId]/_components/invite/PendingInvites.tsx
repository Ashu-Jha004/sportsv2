// app/team/[teamId]/_components/invite/PendingInvites.tsx - NULL SAFE
"use client";

import { usePendingInvites } from "../../../hooks/usePendingInvites";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function PendingInvites({ teamId }: { teamId: string }) {
  const { data: invites = [], isLoading, refetch } = usePendingInvites(teamId);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // ✅ FIXED #1: Null-safe daysLeft
  const daysLeft = (expiresAt?: Date | string | null) => {
    if (!expiresAt) return 7; // Default 7 days
    try {
      const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
      if (isNaN(date.getTime())) return 7;
      const diff = date.getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return 7;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Pending Invites
            </h3>
            <p className="text-slate-600">
              {invites.length} invitation{invites.length !== 1 ? "s" : ""} sent
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 h-9"
        >
          {refreshing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* List */}
      {invites.length > 0 ? (
        <div className="space-y-4">
          {invites.map((invite: any) => (
            <Card key={invite.id} className="hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={
                      invite.invitedAthlete?.profileImage ||
                      `/api/placeholder/56/56`
                    }
                    alt={invite.invitedAthlete?.username || "Athlete"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 mb-1 truncate">
                    {invite.invitedAthlete?.firstName || "Unknown"}{" "}
                    {invite.invitedAthlete?.lastName || ""}
                  </div>
                  <div className="text-sm text-slate-600 mb-2">
                    @{invite.invitedAthlete?.username || "no-username"}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold px-3 py-1">
                      PENDING
                    </Badge>
                    <div className="text-xs text-slate-500">
                      Expires in {daysLeft(invite.expiresAt)} day
                      {daysLeft(invite.expiresAt) !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    Invited by {invite.invitedBy?.firstName || "Unknown"}
                  </div>
                </div>

                {/* Actions */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 px-4 ml-auto mt-1 whitespace-nowrap"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-16 text-center">
            <Clock className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No pending invites
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
              Your recent invite will appear here. Check back in a few seconds!
            </p>
            <Button className="bg-linear-to-r from-emerald-600 to-green-600">
              Find More Players
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
