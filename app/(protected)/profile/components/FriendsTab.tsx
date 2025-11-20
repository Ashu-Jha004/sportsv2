"use client";

import React, { useState, useMemo } from "react";
import {
  useFriends,
  useSendFriendRequest,
  useUnfriend,
  Friend,
} from "../hooks/friends";

export function FriendsList() {
  const { data: friends = [], isLoading, isError } = useFriends();
  const sendFriendRequestMutation = useSendFriendRequest();
  const unfriendMutation = useUnfriend();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredFriends = useMemo(() => {
    if (!Array.isArray(friends)) return [];
    const lower = searchTerm.toLowerCase();
    return friends.filter(
      (friend: Friend) =>
        friend.fullName.toLowerCase().includes(lower) ||
        friend.username.toLowerCase().includes(lower)
    );
  }, [friends, searchTerm]);

  if (isLoading) return <p>Loading friends...</p>;
  if (isError) return <p>Failed to load friends.</p>;

  return (
    <div>
      <input
        type="search"
        placeholder="Search friends..."
        className="w-full px-4 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search friends"
      />

      {filteredFriends.length === 0 ? (
        <p className="text-gray-600">No friends found.</p>
      ) : (
        <div className="space-y-4">
          {filteredFriends.map(
            ({ id, username, fullName, profileImage, isFriend }: Friend) => (
              <div
                key={id}
                className="flex items-center justify-between bg-white rounded shadow p-3"
              >
                <div className="flex items-center gap-4">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={`${fullName} avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold uppercase text-gray-700">
                      {fullName[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{fullName}</p>
                    <p className="text-gray-500">@{username}</p>
                  </div>
                </div>

                <button
                  disabled={
                    sendFriendRequestMutation.isPending ||
                    unfriendMutation.isPending
                  }
                  onClick={() => {
                    if (isFriend) {
                      unfriendMutation.mutate(id);
                    } else {
                      sendFriendRequestMutation.mutate(id);
                    }
                  }}
                  className={`px-4 py-1 rounded transition ${
                    isFriend
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {sendFriendRequestMutation.isPending ||
                  unfriendMutation.isPending
                    ? "Processing..."
                    : isFriend
                    ? "Unfriend"
                    : "Send Friend Request"}
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
