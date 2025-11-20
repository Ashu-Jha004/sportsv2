"use client";

import React from "react";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  title?: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  if (!media.length) {
    return <p className="text-gray-600">No media uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {media.map(({ id, type, url, thumbnailUrl, title }) => (
        <div
          key={id}
          className="relative rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        >
          {type === "image" ? (
            <img
              src={thumbnailUrl ?? url}
              alt={title ?? "Athlete media"}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
          ) : (
            <video controls className="w-full h-48 object-cover">
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          {title && (
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white px-2 py-1 text-sm w-full truncate">
              {title}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
