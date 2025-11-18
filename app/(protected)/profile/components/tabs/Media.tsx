// components/profile/tabs/MediaTab.tsx

"use client";

import { useState } from "react";
import { ProfileData } from "../../types/profile.types";
import { PhotoGallery } from "./SubComponents/media/PhotoGallery";
import { VideoGallery } from "./SubComponents/media/VideoGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMediaData } from "../../data/mockProfile";
import { Image as ImageIcon, Video } from "lucide-react";

interface MediaTabProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
}

export default function MediaTab({ profile, isOwnProfile }: MediaTabProps) {
  const [mediaType, setMediaType] = useState("photos");

  return (
    <div className="space-y-4">
      <Tabs value={mediaType} onValueChange={setMediaType} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Photos ({mockMediaData.photos.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Videos ({mockMediaData.videos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-6">
          <PhotoGallery
            photos={mockMediaData.photos}
            isOwnProfile={isOwnProfile}
          />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <VideoGallery
            videos={mockMediaData.videos}
            isOwnProfile={isOwnProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
