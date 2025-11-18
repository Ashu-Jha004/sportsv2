// components/profile/tabs/FriendsTab.tsx

"use client";

import { ProfileData } from "../../types/profile.types";
import { FriendsList } from "./SubComponents/friends/FriendsList";
import { mockFriendsData } from "../../data/mockProfile";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface FriendsTabProps {
  profile: ProfileData;
}

export default function FriendsTab({ profile }: FriendsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = mockFriendsData.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Friends Count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          All Friends ({filteredFriends.length})
        </h3>
      </div>

      {/* Friends List */}
      <FriendsList friends={filteredFriends} />
    </div>
  );
}
