// app/team/[teamId]/_components/invite/AthleteSearch.tsx
"use client";

import { useNearbyAthletes } from "../../../hooks/useNearbyAthletes";
import AthleteCard from "./AthleteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Target } from "lucide-react";
import { Sport } from "@prisma/client";

interface AthleteSearchProps {
  teamId: string;
  searchQuery: string;
  tab: "nearby" | "search";
}

export default function AthleteSearch({
  teamId,
  searchQuery,
  tab,
}: AthleteSearchProps) {
  const team = {
    latitude: 23.0225,
    longitude: 72.5714,
    sport: "FOOTBALL" as Sport,
  }; // Mock team location

  const {
    data: athletes = [],
    isLoading,
    error,
  } = useNearbyAthletes({
    teamId,
    lat: team.latitude,
    lng: team.longitude,
    sport: team.sport,
    search: searchQuery || undefined,
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Search failed
          </h3>
          <p className="text-slate-500">Please try again</p>
        </CardContent>
      </Card>
    );
  }

  const eligibleCount = athletes.filter((a: any) => !a.teamMembership).length;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-linear-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {tab === "nearby" ? "Nearby Free Agents" : "Search Results"}
            </h3>
            <p className="text-slate-600">
              {tab === "nearby"
                ? `${eligibleCount} eligible athletes within 100km`
                : `${athletes.length} athletes found`}
            </p>
          </div>
        </div>
        {tab === "nearby" && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <MapPin className="w-4 h-4 mr-1" />
            100km radius
          </Badge>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && athletes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {athletes.map((athlete: any, i: any) => (
            <AthleteCard
              key={`${athlete.id}-${i}`}
              athlete={athlete}
              teamId={teamId}
              distance={athlete.distanceKm}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && athletes.length === 0 && (
        <Card className="border-dashed border-slate-300/50">
          <CardContent className="p-16 text-center">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {searchQuery ? "No athletes found" : "No nearby athletes"}
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
              {searchQuery
                ? `No athletes match "${searchQuery}". Try different keywords.`
                : "No free agents found within 100km. Try expanding search."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
