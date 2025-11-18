// components/profile/tabs/MatchTab.tsx

"use client";

import { useState } from "react";
import { ProfileData } from "../../types/profile.types";
import { UpcomingMatches } from "./SubComponents/matches/UpcomingMatches";
import { PastMatches } from "./SubComponents/matches/PastMatches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMatchData } from "../../data/mockProfile";
import { Calendar, History } from "lucide-react";

interface MatchTabProps {
  profile: ProfileData;
}

export default function MatchTab({ profile }: MatchTabProps) {
  const [matchType, setMatchType] = useState("upcoming");

  return (
    <div className="space-y-4">
      <Tabs value={matchType} onValueChange={setMatchType} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming ({mockMatchData.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Past Matches ({mockMatchData.past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <UpcomingMatches matches={mockMatchData.upcoming} />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <PastMatches matches={mockMatchData.past} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
