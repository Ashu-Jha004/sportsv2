"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  AthleteHeaderProps,
  Sport,
} from "@/types/profile/athlete-profile.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Edit,
  MessageSquare,
  UserPlus,
  Trophy,
  Star,
  Users,
} from "lucide-react";

import EditProfileDialog from "./EditProfileDialog";

const BANNER_URL =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&q=80";

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AthleteHeader({
  athlete,
  isOwnProfile,
  onMessageUser,
  onAddFriend,
  isFriendProfile, // added flag to indicate friend status
}: AthleteHeaderProps & { isFriendProfile?: boolean }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fullName = useMemo(
    () => `${athlete.firstName} ${athlete.lastName}`,
    [athlete.firstName, athlete.lastName]
  );
  const initials = useMemo(() => getInitials(fullName), [fullName]);

  const handleEditClick = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
  }, []);

  const handleMessageClick = useCallback(() => {
    if (onMessageUser) onMessageUser();
    else console.log(`Message button clicked for ${athlete.username}`);
  }, [athlete.username, onMessageUser]);

  const handleAddFriendClick = useCallback(() => {
    if (onAddFriend) onAddFriend();
    else console.log(`Add friend button clicked for ${athlete.username}`);
  }, [athlete.username, onAddFriend]);

  // Decide which button to show if not own profile
  // Priority: If friend show Message else Add Friend
  const renderActionButton = () => {
    if (isOwnProfile) {
      return (
        <>
          <Button
            variant="outline"
            onClick={handleEditClick}
            className="flex items-center gap-2"
          >
            <Edit size={18} /> Edit Profile
          </Button>
          <EditProfileDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogOpenChange}
          />
        </>
      );
    } else if (isFriendProfile) {
      return (
        <Button
          variant="default"
          onClick={handleMessageClick}
          className="flex items-center gap-2"
        >
          <MessageSquare size={18} /> Message
        </Button>
      );
    } else {
      return (
        <Button
          variant="secondary"
          onClick={handleAddFriendClick}
          className="flex items-center gap-2"
        >
          <UserPlus size={18} /> Add Friend
        </Button>
      );
    }
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg bg-white">
      {/* Banner */}
      <div
        className="h-48 w-full object-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BANNER_URL})` }}
        aria-label="Banner Image"
      />

      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6">
        {/* Avatar */}
        <div className="relative -mt-16 sm:mt-0">
          {athlete.profileImage ? (
            <Avatar className="rounded-full border-4 border-white shadow-lg w-32 h-32">
              <img
                src={athlete.profileImage}
                alt={fullName}
                className="rounded-full object-cover"
              />
            </Avatar>
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-400 rounded-full text-white text-4xl font-bold border-4 border-white shadow-lg">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Username */}
          <h1 className="text-3xl font-extrabold text-gray-900">{fullName}</h1>
          <p className="text-blue-600 text-lg font-semibold">
            @{athlete.username}
          </p>

          {/* Followers & Following */}
          <div className="flex items-center space-x-6 mt-2">
            <div className="flex items-center gap-1 text-gray-600">
              <Users size={16} />
              <span>{athlete.followersCount} Followers</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Users size={16} />
              <span>{athlete.followingCount} Following</span>
            </div>
          </div>

          {/* Rank & Class */}
          <div className="flex items-center space-x-3 mt-3">
            <Badge className="flex items-center gap-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full">
              <Trophy size={16} /> {athlete.rank}
            </Badge>
            <Badge className="flex items-center gap-1 bg-linear-to-r from-green-600 to-teal-600 text-white px-3 py-1 rounded-full">
              <Star size={16} /> Class {athlete.class}
            </Badge>
          </div>

          {/* Bio */}
          {athlete.bio && (
            <p className="mt-4 text-gray-700 text-base max-w-2xl">
              {athlete.bio}
            </p>
          )}

          {/* Primary & Secondary Sports */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-blue-600 text-white px-2 py-1 rounded">
              Primary: {athlete.primarySport}
            </Badge>
            {(athlete.secondarySports || []).map((sport) => (
              <Badge
                key={sport}
                className="bg-gray-400 text-white px-2 py-1 rounded"
              >
                {sport}
              </Badge>
            ))}
          </div>

          {/* Actions: Edit / Message / Add Friend */}
          <div className="flex flex-wrap gap-4 mt-6">
            {renderActionButton()}
          </div>
        </div>
      </div>
    </section>
  );
}
