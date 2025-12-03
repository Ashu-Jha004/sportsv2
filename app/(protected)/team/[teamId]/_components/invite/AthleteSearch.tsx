"use client";

import { useNearbyAthletes } from "../../../hooks/useNearbyAthletes";
import AthleteCard from "./AthleteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  MapPin,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Filter,
} from "lucide-react";
import { Sport } from "@prisma/client";
import { useState } from "react";

interface AthleteSearchProps {
  teamId: string;
  searchQuery: string;
  tab: "nearby" | "search";
  teamLatitude?: number;
  teamLongitude?: number;
  teamSport?: Sport;
  onClose?: () => void;
}

interface Athlete {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  primarySport?: string;
  rank?: string;
  class?: string;
  distanceKm?: number;
  teamMembership?: any;
}

export default function AthleteSearch({
  teamId,
  searchQuery,
  tab,
  teamLatitude = 23.0225,
  teamLongitude = 72.5714,
  teamSport = "FOOTBALL" as Sport,
  onClose,
}: AthleteSearchProps) {
  const [radiusKm, setRadiusKm] = useState(100);
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: athletes = [],
    isLoading,
    error,
    refetch,
  } = useNearbyAthletes({
    teamId,
    lat: teamLatitude,
    lng: teamLongitude,
    sport: teamSport,
    search: searchQuery || undefined,
    radius: radiusKm,
  });

  const eligibleAthletes = (athletes as Athlete[]).filter(
    (athlete) => !athlete.teamMembership
  );
  const eligibleCount = eligibleAthletes.length;

  // Error State
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
            Unable to Load Athletes
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            {error instanceof Error
              ? error.message
              : "Something went wrong. Please try again."}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {tab === "nearby" ? "Nearby Free Agents" : "Search Results"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {tab === "nearby"
                ? `${eligibleCount} eligible within ${radiusKm}km`
                : `${athletes.length} athlete${
                    athletes.length !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>
        </div>

        {/* Filters Toggle */}
        {tab === "nearby" && (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs sm:text-sm px-3 py-1.5"
            >
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {radiusKm}km
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && tab === "nearby" && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Search Radius: {radiusKm}km
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  aria-label="Search radius in kilometers"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>10km</span>
                  <span>200km</span>
                </div>
              </div>
              <Button
                onClick={() => refetch()}
                size="sm"
                variant="default"
                className="gap-2 whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && athletes.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {(athletes as Athlete[]).map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                teamId={teamId}
                distance={athlete.distanceKm}
                onInviteSuccess={onClose}
              />
            ))}
          </div>

          {/* Pagination Info */}
          {athletes.length >= 50 && (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">
                Showing first 50 results. Refine your search for more specific
                results.
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && athletes.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              {searchQuery ? "No Athletes Found" : "No Nearby Athletes"}
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              {searchQuery ? (
                <>
                  No athletes match <strong>"{searchQuery}"</strong>. Try
                  different keywords or check spelling.
                </>
              ) : (
                <>
                  No free agents found within {radiusKm}km.{" "}
                  {radiusKm < 100 && "Try expanding your search radius."}
                </>
              )}
            </p>
            {tab === "nearby" && radiusKm < 100 && (
              <Button
                onClick={() => {
                  setRadiusKm(150);
                  refetch();
                }}
                variant="outline"
                size="sm"
              >
                Expand to 150km
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
