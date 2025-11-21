// components/MediaTab.tsx

"use client";

import React from "react";
import { MediaTabProps } from "@/types/profile/athlete-profile.types";

export default function MediaTab({ media }: MediaTabProps) {
  if (!media.length) {
    return <p className="text-center text-gray-500">No media available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {media.map(({ id, url, caption }) => (
        <div key={id} className="rounded-lg overflow-hidden shadow-md">
          <img
            src={url}
            alt={caption ?? "Athlete media"}
            loading="lazy"
            className="w-full object-cover aspect-square"
          />
          {caption && (
            <p className="text-center text-sm text-gray-600 mt-1">{caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}
