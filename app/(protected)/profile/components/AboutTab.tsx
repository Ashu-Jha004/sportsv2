// components/AboutTab.tsx

"use client";

import React, { useMemo } from "react";
import { AboutTabProps } from "@/types/profile/athlete-profile.types";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Trophy, Star, UserCheck } from "lucide-react";

export default function AboutTab({ athlete }: AboutTabProps) {
  const {
    firstName,
    lastName,
    bio,
    city,
    state,
    country,
    primarySport,
    secondarySports = [],
    rank,
    class: athleteClass,
    gender,
  } = athlete;

  const fullName = useMemo(
    () => `${firstName} ${lastName}`,
    [firstName, lastName]
  );

  return (
    <div className="space-y-6 text-gray-800 max-w-3xl mx-auto">
      {/* Bio Section */}
      {bio && (
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User size={22} /> About {fullName}
          </h2>
          <p className="mt-2 text-gray-700 whitespace-pre-line">{bio}</p>
        </section>
      )}

      {/* Location */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MapPin size={22} /> Location
        </h2>
        <p className="mt-1 text-gray-700">
          {[city, state, country].filter(Boolean).join(", ") || "Not specified"}
        </p>
      </section>

      {/* Sports */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserCheck size={22} /> Sports
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge
            variant="outline"
            className="bg-blue-600 text-white px-3 py-1 rounded-full"
          >
            Primary: {primarySport}
          </Badge>
          {secondarySports.length > 0 &&
            secondarySports.map((sport) => (
              <Badge
                variant="outline"
                key={sport}
                className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full"
              >
                {sport}
              </Badge>
            ))}
        </div>
      </section>

      {/* Rank & Class */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy size={22} /> Rank & Class
        </h2>
        <div className="flex gap-8 mt-2">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            <span className="text-gray-700">Rank: {rank}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={20} className="text-green-500" />
            <span className="text-gray-700">Class: {athleteClass}</span>
          </div>
        </div>
      </section>

      {/* Gender */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <User size={22} /> Gender
        </h2>
        <p className="mt-1 text-gray-700">{gender || "Not specified"}</p>
      </section>
    </div>
  );
}
