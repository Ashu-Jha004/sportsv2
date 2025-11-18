// components/profile/media/VideoGallery.tsx

"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Play } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Video {
  id: number;
  thumbnail: string;
  title: string;
  duration: string;
  date: string;
}

interface VideoGalleryProps {
  videos: Video[];
  isOwnProfile?: boolean;
}

export function VideoGallery({ videos, isOwnProfile }: VideoGalleryProps) {
  return (
    <>
      {/* Upload Button */}
      {isOwnProfile && (
        <div className="mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Videos
          </Button>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="relative aspect-video">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-blue-600" fill="currentColor" />
                </div>
              </div>
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-900 truncate">
                {video.title}
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                {format(parseISO(video.date), "MMM dd, yyyy")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
