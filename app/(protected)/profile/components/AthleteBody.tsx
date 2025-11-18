// components/profile/ProfileBody.tsx

"use client";

import { useState } from "react";
import { ProfileData } from "../types/profile.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AboutTab from "./tabs/AboutTab";
import StatsTabs from "./tabs/StatsTabs";
import MediaTab from "./tabs/Media";
import FriendsTab from "./tabs/FriendsTab";
import MatchTab from "./tabs/MatchTab";
import {
  User,
  BarChart3,
  Image as ImageIcon,
  Users,
  Trophy,
} from "lucide-react";

interface ProfileBodyProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
}

export function ProfileBody({
  profile,
  isOwnProfile = true,
}: ProfileBodyProps) {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation */}
        <TabsList className="w-full justify-start rounded-none border-b bg-slate-50 p-0 h-auto">
          <TabsTrigger
            value="about"
            className="flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white rounded-none"
          >
            <User className="w-4 h-4" />
            <span className="font-semibold">About</span>
          </TabsTrigger>

          <TabsTrigger
            value="stats"
            className="flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white rounded-none"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="font-semibold">Stats</span>
          </TabsTrigger>

          <TabsTrigger
            value="media"
            className="flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white rounded-none"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="font-semibold">Media</span>
          </TabsTrigger>

          <TabsTrigger
            value="friends"
            className="flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white rounded-none"
          >
            <Users className="w-4 h-4" />
            <span className="font-semibold">Friends</span>
          </TabsTrigger>

          <TabsTrigger
            value="match"
            className="flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white rounded-none"
          >
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">Match</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          <TabsContent value="about" className="mt-0">
            <AboutTab profile={profile} isOwnProfile={isOwnProfile} />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <StatsTabs profile={profile} />
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            <MediaTab profile={profile} isOwnProfile={isOwnProfile} />
          </TabsContent>

          <TabsContent value="friends" className="mt-0">
            <FriendsTab profile={profile} />
          </TabsContent>

          <TabsContent value="match" className="mt-0">
            <MatchTab profile={profile}  />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
