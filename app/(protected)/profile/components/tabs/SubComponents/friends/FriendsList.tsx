// components/profile/friends/FriendsList.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Users } from "lucide-react";

interface Friend {
  id: number;
  name: string;
  username: string;
  avatar: string;
  sport: string;
  mutualFriends: number;
  isFollowing: boolean;
}

interface FriendsListProps {
  friends: Friend[];
}

export function FriendsList({ friends }: FriendsListProps) {
  const [followingState, setFollowingState] = useState<Record<number, boolean>>(
    friends.reduce(
      (acc, friend) => ({ ...acc, [friend.id]: friend.isFollowing }),
      {}
    )
  );

  const toggleFollow = (friendId: number) => {
    setFollowingState((prev) => ({
      ...prev,
      [friendId]: !prev[friendId],
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {friends.map((friend) => (
        <Card key={friend.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                <Image
                  src={friend.avatar}
                  alt={friend.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">
                  {friend.name}
                </h4>
                <p className="text-sm text-slate-600 truncate">
                  @{friend.username}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span className="font-medium text-blue-600">
                    {friend.sport}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {friend.mutualFriends} mutual
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <Button
                variant={followingState[friend.id] ? "outline" : "default"}
                size="sm"
                onClick={() => toggleFollow(friend.id)}
                className={
                  followingState[friend.id]
                    ? "border-slate-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              >
                {followingState[friend.id] ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
