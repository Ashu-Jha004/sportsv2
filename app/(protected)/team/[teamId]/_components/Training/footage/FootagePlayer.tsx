"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, User, ExternalLink } from "lucide-react";
import { TrainingFootageWithRelations } from "@/types/Training/types/training";
import { getYouTubeEmbedUrl } from "@/lib/utils/trainingHelpers";
import { incrementFootageViewCount } from "@/app/(protected)/team/actions/training/trainingFootageActions";
import { format } from "date-fns";
import Image from "next/image";

interface FootagePlayerProps {
  footage: TrainingFootageWithRelations;
  onClose: () => void;
}

export default function FootagePlayer({
  footage,
  onClose,
}: FootagePlayerProps) {
  const embedUrl = useMemo(() => {
    return getYouTubeEmbedUrl(footage.youtubeUrl);
  }, [footage.youtubeUrl]);

  // Increment view count mutation
  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      return await incrementFootageViewCount(footage.id);
    },
    onError: (error) => {
      console.error("[FootagePlayer] Failed to increment view count:", error);
    },
  });

  // Increment view count when player opens
  useEffect(() => {
    incrementViewMutation.mutate();
  }, [footage.id]);

  const handleOpenYouTube = useCallback(() => {
    window.open(footage.youtubeUrl, "_blank", "noopener,noreferrer");
  }, [footage.youtubeUrl]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">{footage.title}</DialogTitle>
          {footage.description && (
            <DialogDescription className="text-base mt-2">
              {footage.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Video Player */}
          <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
            <iframe
              src={embedUrl}
              title={footage.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Video Info Card */}
          <Card className="border-slate-200">
            <CardContent className="pt-6 pb-6 space-y-4">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Recorded:{" "}
                    {format(new Date(footage.recordedDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{footage.viewCount + 1} views</span>
                </div>
                {footage.duration && (
                  <Badge variant="secondary" className="text-xs">
                    Duration: {Math.floor(footage.duration / 60)}:
                    {String(footage.duration % 60).padStart(2, "0")}
                  </Badge>
                )}
              </div>

              {/* Session Info */}
              {footage.session && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">
                    Associated Session
                  </p>
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-700"
                  >
                    {footage.session.title}
                  </Badge>
                </div>
              )}

              {/* Plan Info */}
              {footage.plan && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Training Plan</p>
                  <Badge
                    variant="outline"
                    className="border-purple-300 text-purple-700"
                  >
                    {footage.plan.name}
                  </Badge>
                </div>
              )}

              {/* Uploader Info */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Uploaded by</p>
                <div className="flex items-center gap-3">
                  {footage.uploadedBy.profileImage ? (
                    <Image
                      src={footage.uploadedBy.profileImage}
                      alt={footage.uploadedBy.username || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                      {footage.uploadedBy.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {footage.uploadedBy.username ||
                        `${footage.uploadedBy.firstName} ${footage.uploadedBy.lastName}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(
                        new Date(footage.createdAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Open in YouTube Button */}
              <div className="pt-3 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={handleOpenYouTube}
                  className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch on YouTube
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
