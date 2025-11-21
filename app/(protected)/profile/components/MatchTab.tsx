// components/MatchTab.tsx

"use client";

import React from "react";
import { MatchTabProps } from "@/types/profile/athlete-profile.types";

export default function MatchTab({ matches }: MatchTabProps) {
  if (!matches.length) {
    return (
      <p className="text-center text-gray-500">No match history available.</p>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {matches.map(
        ({
          id,
          date,
          sport,
          matchType,
          opponent,
          result,
          score,
          location,
          duration,
        }) => (
          <div
            key={id}
            className="border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500">
                <span className="font-semibold">
                  {new Date(date).toLocaleDateString()}
                </span>{" "}
                &middot; {matchType} &middot; {sport}
              </div>
              <div
                className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                  result === "WIN"
                    ? "bg-green-600"
                    : result === "LOSS"
                    ? "bg-red-600"
                    : "bg-gray-600"
                }`}
              >
                {result}
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Opponent: {opponent}
            </h3>
            <p className="text-gray-600 mb-1">
              Score: {score.own} - {score.opponent}
            </p>
            <p className="text-gray-600 mb-1">Location: {location}</p>
            {duration && (
              <p className="text-gray-600">Duration: {duration} min</p>
            )}
          </div>
        )
      )}
    </div>
  );
}
