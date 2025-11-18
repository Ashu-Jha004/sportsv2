// components/profile/media/PhotoGallery.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Photo {
  id: number;
  url: string;
  caption: string;
  date: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  isOwnProfile?: boolean;
}

export function PhotoGallery({ photos, isOwnProfile }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      {/* Upload Button */}
      {isOwnProfile && (
        <div className="mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-square">
              <Image
                src={photo.url}
                alt={photo.caption}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-3">
                <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                  {photo.caption}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            title="media"
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-bold">{selectedPhoto.caption}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {format(parseISO(selectedPhoto.date), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
