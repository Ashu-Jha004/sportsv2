"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { leaveTeam } from "../../lib/actions/team/leaveTeam";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTeamStore } from "@/stores/team/fetching/teamStore";
import { getTeamPermissions } from "../../lib/utils/teamPermissions";
import { sendTeamJoinRequest } from "../../lib/actions/team/sendJoinRequest";
import InviteDialog from "./invite/InviteDialog";
import { TeamWithRelations } from "../../lib/types/team";
import { Users, Edit3, UserPlus, Send, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface TeamActionsProps {
  team: TeamWithRelations;
  currentUserId: string | null;
}

export default function TeamActions({ team, currentUserId }: TeamActionsProps) {
  const permissions = getTeamPermissions(team, currentUserId);
  const [joinMessage, setJoinMessage] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const joinRequestMutation = useMutation({
    mutationFn: () =>
      sendTeamJoinRequest({ teamId: team.id, message: joinMessage }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Join request sent! Team captains will review it soon.");
        setIsJoinDialogOpen(false);
        setJoinMessage("");
      } else {
        toast.error(data.error || "Failed to send join request");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send join request");
    },
  });

  const handleJoinRequest = () => {
    if (joinMessage.trim().length > 500) {
      toast.error("Message too long (max 500 characters)");
      return;
    }
    if (!joinMessage.trim()) {
      toast.error("Please write a message to the team");
      return;
    }
    joinRequestMutation.mutate();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Join Button - For Visitors */}
      {!permissions.isMember && (
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="flex-1 sm:flex-none">
              <Users className="w-4 h-4 mr-2" />
              Request to Join
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request to Join {team.name}</DialogTitle>
              <DialogDescription>
                Tell the team captains why you'd be a great addition to their
                roster.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="I'm a dedicated player with experience in..."
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-slate-500 text-right">
                {joinMessage.length}/500 characters
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsJoinDialogOpen(false)}
                disabled={joinRequestMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRequest}
                disabled={joinRequestMutation.isPending || !joinMessage.trim()}
              >
                {joinRequestMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Member Actions */}
      {permissions.isMember && (
        <>
          {/* Invite Button */}
          {permissions.canInvite && (
            <InviteDialog
              teamId={team.id}
              teamName={team.name}
              canInvite={permissions.canInvite}
            />
          )}

          {/* Edit Button - Owner Only */}
          {permissions.canEdit && (
            <Button size="lg" variant="outline">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Team
            </Button>
          )}
        </>
      )}
      {permissions.isMember && !permissions.isOwner && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="lg">
              <LogOut className="w-4 h-4 mr-2" />
              Leave Team
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave {team.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                You will lose access to this team and all its features. You can
                request to join again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <LeaveTeamMutationButton teamId={team.id} />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
function LeaveTeamMutationButton({ teamId }: { teamId: string }) {
  const leaveMutation = useMutation({
    mutationFn: leaveTeam,
    onSuccess: () => {
      toast.success("You have left the team");
      window.location.href = "/teams";
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to leave team");
    },
  });

  return (
    <AlertDialogAction
      onClick={() => leaveMutation.mutate({ teamId })}
      disabled={leaveMutation.isPending}
    >
      {leaveMutation.isPending ? "Leaving..." : "Leave Team"}
    </AlertDialogAction>
  );
}
