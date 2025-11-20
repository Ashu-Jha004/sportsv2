"use client";

import React from "react";

export function MatchesList({ matches }: any) {
  if (matches.length === 0) {
    return <p className="text-gray-600">No matches scheduled yet.</p>;
  }

  return (
    <div className="space-y-4">
      {matches.map(
        ({ id, opponent, date, location, result, matchType }: any) => (
          <div
            key={id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">
                {matchType} vs {opponent}
              </h3>
              <p className="text-gray-600">
                {new Date(date).toLocaleDateString()} - {location}
              </p>
            </div>
            {result && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  result === "Won"
                    ? "bg-green-100 text-green-800"
                    : result === "Lost"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {result}
              </span>
            )}
          </div>
        )
      )}
    </div>
  );
}
