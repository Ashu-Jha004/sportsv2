"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useJoinRequests } from "../../../hooks/useJoinRequests";
import JoinRequestsDialog from "./JoinRequestsDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamMembers } from "../../../hooks/useTeamMembers";
import {
  Users,
  Crown,
  Anchor,
  UserCheck,
  Shield,
  MoreVertical,
  UserMinus,
  UserCog,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { TeamWithRelations } from "../../../lib/types/team";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { tokens, getRoleColors } from "../../../../../../lib/design-tokens";
import InviteDialog from "../invite/InviteDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { manageMember } from "../../../lib/actions/team/manageMember";
import { toast } from "sonner";
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

function MemberCard({ athlete, permissions, currentUserId, teamId }: any) {
  const queryClient = useQueryClient();
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");

  const role = athlete.TeamMembership?.role || "PLAYER";
  const roleColors = getRoleColors(role);

  const roleIcons: Record<string, React.ReactNode> = {
    OWNER: <Crown className="w-3 h-3" />,
    CAPTAIN: <Anchor className="w-3 h-3" />,
    PLAYER: <UserCheck className="w-3 h-3" />,
    MANAGER: <Shield className="w-3 h-3" />,
  };

  const manageMutation = useMutation({
    mutationFn: manageMember,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update member");
    },
  });

  const handleAction = (action: string, role?: string) => {
    setSelectedAction(action);
    if (role) setNewRole(role);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100">
              <Image
                src={
                  athlete.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${
                    athlete.username || athlete.id
                  }`
                }
                alt={`${athlete.firstName} ${athlete.lastName}`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            {role === "OWNER" && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate">
              {athlete.firstName} {athlete.lastName}
            </h4>
            <p className="text-sm text-slate-600 truncate">
              @{athlete.username || "no-username"}
            </p>

            {/* Role Badge */}
            <Badge className={`mt-2 text-xs ${roleColors.badge} text-white`}>
              {roleIcons[role]}
              <span className="ml-1 capitalize">{role.toLowerCase()}</span>
            </Badge>

            {/* Stats */}
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>{athlete.rank}</span>
              <span>•</span>
              <span>Class {athlete.class}</span>
              {athlete.primarySport && (
                <>
                  <span>•</span>
                  <span>{athlete.primarySport}</span>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Management Actions */}
          {permissions.canManageRequests && role !== "OWNER" && (
            <div className="flex flex-col gap-1 shrink-0 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {permissions.isOwner && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleAction("TRANSFER_OWNERSHIP")}
                      >
                        👑 Transfer Ownership
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {permissions.isOwner || permissions.isCaptain ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleAction("CHANGE_ROLE")}
                      >
                        👤 Change Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : null}

                  {(permissions.isOwner || permissions.isCaptain) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove {athlete.firstName}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This member will lose access to the team and receive
                            a notification. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() =>
                              manageMutation.mutate({
                                teamId,
                                targetAthleteId: athlete.id,
                                action: "REMOVE",
                              })
                            }
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Change Role Dialog */}
              {selectedAction === "CHANGE_ROLE" && (
                <AlertDialog
                  open={roleSelectOpen}
                  onOpenChange={setRoleSelectOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Change Role for {athlete.firstName}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Select the new role for this team member.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLAYER">Player</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          {permissions.isOwner && (
                            <>
                              <SelectItem value="CAPTAIN">Captain</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setSelectedAction("")}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          manageMutation.mutate({
                            teamId,
                            targetAthleteId: athlete.id,
                            action: "CHANGE_ROLE",
                            newRole: newRole as any,
                          });
                          setRoleSelectOpen(false);
                          setSelectedAction("");
                        }}
                        disabled={!newRole}
                      >
                        Update Role
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MemberSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-14 h-14 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-20 rounded-full mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MembersList({
  team,
  currentUserId,
  permissions,
}: {
  team: TeamWithRelations;
  currentUserId: string | null;
  permissions: any;
}) {
  const {
    data: members,
    isLoading,
    error,
  } = useTeamMembers(team.id, permissions.isOwner, permissions.isCaptain);
  const membersList = Array.isArray(members) ? members : [];
  const [joinRequestsDialogOpen, setJoinRequestsDialogOpen] = useState(false);
  // Filters & Pagination
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { data: requests = [] } = useJoinRequests(team.id);

  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Filter members by role
  const filteredMembers = membersList.filter((member) => {
    if (roleFilter === "ALL") return true;
    return member.TeamMembership?.role === roleFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  const handleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Failed to load members
          </h3>
          <p className="text-slate-500 mb-4">{error.toString()}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Roster</h2>
          <p className="text-slate-600 mt-1">
            {isLoading
              ? "Loading members..."
              : `${filteredMembers.length} member${
                  filteredMembers.length !== 1 ? "s" : ""
                }${roleFilter !== "ALL" ? ` (filtered)` : ""}`}
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <Select value={roleFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="CAPTAIN">Captain</SelectItem>
              <SelectItem value="PLAYER">Player</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
            </SelectContent>
          </Select>

          {permissions.canInvite && (
            <>
              {permissions.canInvite && (
                <InviteDialog
                  teamId={team.id}
                  teamName={team.name}
                  canInvite={permissions.canInvite}
                />
              )}
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MemberSkeleton key={i} />
          ))}
        </div>
      ) : paginatedMembers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedMembers.map((member) => (
              <MemberCard
                key={member.id}
                athlete={member}
                isOwner={member.id === currentUserId}
                permissions={permissions}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {roleFilter === "ALL"
                ? "No members yet"
                : "No members with this role"}
            </h3>
            <p className="text-slate-600 mb-6">
              {roleFilter === "ALL"
                ? "This team is just getting started"
                : "Try selecting a different role filter"}
            </p>
            {permissions.canInvite && roleFilter === "ALL" && (
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First Member
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Join Requests - Only for Owners/Captains */}
      {permissions.canManageRequests && (
        <>
          <JoinRequestsDialog
            teamId={team.id}
            isOpen={joinRequestsDialogOpen}
            onClose={() => setJoinRequestsDialogOpen(false)}
          />
          <Card className="border-dashed border-2 hover:shadow-md transition-all">
            <CardContent
              className="p-8 text-center cursor-pointer hover:bg-slate-50"
              onClick={() => setJoinRequestsDialogOpen(true)}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Pending Join Requests
              </h3>
              <p className="text-slate-600 mb-4">
                {joinRequestsDialogOpen
                  ? "Loading..."
                  : `${requests.length} new athlete${
                      requests.length !== 1 ? "s" : ""
                    }`}
              </p>
              <Button variant="outline" size="sm">
                Review Requests
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
