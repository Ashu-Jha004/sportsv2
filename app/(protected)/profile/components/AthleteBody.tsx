"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageDrawer } from "./MessageDrawer";
import { StatsTab } from "./StatsTab";
import MediaGallery from "./MediaTab";
import { MatchesList } from "./MatchesList";
import { FriendsList } from "./FriendsTab";
import { useSendFriendRequest } from "../hooks/friends";
import { toast } from "sonner";

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface Location {
  country: string | undefined;
  state: string | undefined;
  city: string | undefined;
  coordinates: LocationCoordinates;
}

interface Athlete {
  id: string | undefined;
  username?: string | undefined;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  fullName: string | undefined;
  profileImage?: string | undefined;
  dateOfBirth: string | "";
  gender: string | undefined;
  bio: string | undefined;
  primarySport: string | undefined;
  secondarySport: string | undefined;
  rank: string | undefined;
  class: string | undefined;
  roles: string;
  location: Location;
  createdAt: string | "";
  updatedAt: string | "";
  isOwnProfile?: boolean;
}

interface AthleteProfileProps {
  athlete: Athlete;
  isOwnProfile: boolean;
}
interface Stat {
  name: string;
  value: number;
  unit?: string;
}

export default function AthleteProfile({
  athlete,
  isOwnProfile,
}: AthleteProfileProps) {
  const [activeTab, setActiveTab] = useState("about");

  const tabs = [
    { id: "about", label: "About" },
    { id: "stats", label: "Stats" },
    { id: "media", label: "Media" },
    { id: "matches", label: "Matches" },
    { id: "friends", label: "Friends" },
  ];
  const mockStats: Stat[] = [
    { name: "Strength", value: 85, unit: "kg" },
    { name: "Power", value: 90, unit: "W" },
    { name: "Speed", value: 28, unit: "km/h" },
    { name: "Agility", value: 75, unit: "score" },
  ];
  const mockMedia: any = [
    {
      id: "1",
      type: "image",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      title: "Athlete running",
    },
    {
      id: "2",
      type: "image",
      url: "https://images.unsplash.com/photo-1526406915895-c87cc1b6e5b0?auto=format&fit=crop&w=800&q=80",
      title: "Soccer ball",
    },
    {
      id: "3",
      type: "video",
      url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      thumbnailUrl:
        "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
      title: "Training video",
    },
    {
      id: "4",
      type: "image",
      url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
      title: "Football field",
    },
  ];
  const mockMatches = [
    {
      id: "m1",
      opponent: "Team Red",
      date: "2025-12-05T15:00:00Z",
      location: "City Stadium",
      result: "Won",
      matchType: "League",
    },
    {
      id: "m2",
      opponent: "Blue Warriors",
      date: "2025-12-20T18:00:00Z",
      location: "National Arena",
      result: "Lost",
      matchType: "Cup",
    },
    {
      id: "m3",
      opponent: "Green Giants",
      date: "2026-01-10T16:30:00Z",
      location: "Home Ground",
      result: null,
      matchType: "Friendly",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto my-12 px-4">
      <nav className="flex border-b border-gray-300 mb-8 space-x-6 text-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-4 font-semibold transition border-b-4 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent hover:text-blue-600 hover:border-b-4"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section>
        {activeTab === "about" && (
          <AboutTab athlete={athlete} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === "stats" && <StatsTab stats={mockStats} />}
        {activeTab === "media" && <MediaGallery media={mockMedia} />}
        {activeTab === "matches" && <MatchesList matches={mockMatches} />}
        {activeTab === "friends" && <FriendsList />}
      </section>
    </div>
  );
}

export function AboutTab({ athlete, isOwnProfile }: any) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const sendFriendRequest = useSendFriendRequest();

  const handleEditOpen = () => setIsEditOpen(true);
  const handleEditClose = () => setIsEditOpen(false);
  const handleMessageOpen = () => setIsMessageOpen(true);
  const handleMessageClose = () => setIsMessageOpen(false);
  console.log("athlete", athlete);

  const handleAddFriend = () => {
    if (!athlete?.id) return;
    sendFriendRequest.mutate(athlete.id, {
      onSuccess: () => {
        setIsFriend(true);
        alert("Friend request sent");
      },
      onError: (err: any) => {
        if (err?.message?.includes("Already friends")) {
          setIsFriend(true); // already friends
        } else {
          alert(err?.message || "Failed to send request");
        }
      },
    });
  };

  if (!athlete) {
    return <div>Loading athlete data...</div>;
  }

  return (
    <div className="bg-white p-8 rounded shadow-md space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        {athlete?.profileImage ? (
          <img
            src={athlete.profileImage}
            alt={`${athlete.fullName} profile`}
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-600"
          />
        ) : (
          <div className="w-36 h-36 bg-blue-100 flex items-center justify-center rounded-full text-5xl font-extrabold text-blue-600">
            {athlete?.firstName?.[0]?.toUpperCase() ?? "A"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold text-gray-900 truncate">
            {athlete?.fullName}
          </h1>
          <p className="text-xl text-gray-600">
            @{athlete?.username ?? athlete?.firstName}
          </p>
          <p className="text-gray-700 mt-2">{athlete?.email}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 whitespace-nowrap">
          {athlete?.isOwnProfile ? (
            <Button onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
          ) : isFriend ? (
            <Button onClick={() => alert("Open message window here")}>
              Message
            </Button>
          ) : (
            <Button
              onClick={handleAddFriend}
              disabled={sendFriendRequest.isPending}
            >
              {sendFriendRequest.isPending ? "Sending..." : "Add Friend"}
            </Button>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={handleEditClose}>
        <DialogContent>
          {/* Place EditProfileDialog Component Here */}
        </DialogContent>
      </Dialog>

      {/* Message Drawer */}
      <MessageDrawer
        isOpen={isMessageOpen}
        onClose={handleMessageClose}
        receiverUsername={athlete?.username}
        receiverName={`${athlete?.firstName} ${athlete?.lastName}`}
      />

      {/* Biography */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Biography</h2>
        <p>{athlete?.bio}</p>
      </div>

      {/* Details Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Gender" value={athlete?.gender} />
          <DetailItem
            label="Date of Birth"
            value={new Date(athlete?.dateOfBirth).toLocaleDateString()}
          />
          <DetailItem label="Primary Sport" value={athlete?.primarySport} />
          <DetailItem label="Secondary Sport" value={athlete?.secondarySport} />
          <DetailItem label="Rank" value={athlete?.rank} />
          <DetailItem label="Class" value={athlete?.class} />
          <DetailItem label="Roles" value={athlete?.roles} />
        </div>
      </div>

      {/* Location */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Location</h2>
        <p>
          {athlete?.location.city}, {athlete?.location.state},{" "}
          {athlete?.location.country}
        </p>
        <p>
          Coordinates: {athlete?.location.coordinates.latitude.toFixed(4)},{" "}
          {athlete?.location.coordinates.longitude.toFixed(4)}
        </p>
      </div>

      {/* Account Info */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Account Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <DetailItem
            label="Joined"
            value={new Date(athlete?.createdAt).toLocaleDateString()}
          />
          <DetailItem
            label="Last Updated"
            value={new Date(athlete?.updatedAt).toLocaleDateString()}
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string | undefined;
  value: string | undefined;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string | undefined }) {
  return (
    <div className="p-6 bg-white rounded shadow text-center text-gray-600 font-medium">
      {label} content coming soon.
    </div>
  );
}
