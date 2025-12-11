"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Eye, ArrowRight, Calendar } from "lucide-react";
import { TrainingFootageWithRelations } from "@/types/Training/types/training";
import { getYouTubeThumbnail } from "@/lib/utils/trainingHelpers";
import { format } from "date-fns";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import Image from "next/image";

interface RecentFootageProps {
  footage: TrainingFootageWithRelations[];
  teamId: string;
}

export default function RecentFootage({ footage, teamId }: any) {
  const { setViewMode } = useTrainingStore();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Get recent 3 footage items
  const recentFootage = useMemo(() => {
    return footage.slice(0, 3);
  }, [footage]);

  const handleImageError = (footageId: string) => {
    setImageErrors((prev) => ({ ...prev, [footageId]: true }));
  };

  const handleViewAll = () => {
    setViewMode("footage");
  };

  const handleCardClick = (item: TrainingFootageWithRelations) => {
    // For now, just switch to footage gallery view
    setViewMode("footage");
  };

  if (recentFootage.length === 0) {
    return null;
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            Recent Training Footage
          </CardTitle>
          {footage.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentFootage.map((item:any) => {
            const thumbnailUrl =
              item.thumbnailUrl || getYouTubeThumbnail(item.youtubeUrl, "hq");
            const hasError = imageErrors[item.id];

            return (
              <Card
                key={item.id}
                className="border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                onClick={() => handleCardClick(item)}
              >
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {!hasError && thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                        <Video className="w-12 h-12 text-purple-400" />
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Play className="w-6 h-6 text-purple-600 fill-purple-600" />
                      </div>
                    </div>

                    {/* Duration Badge (if available) */}
                    {item.duration && (
                      <Badge
                        variant="secondary"
                        className="absolute bottom-2 right-2 bg-black/70 text-white border-0 text-xs"
                      >
                        {Math.floor(item.duration / 60)}:
                        {String(item.duration % 60).padStart(2, "0")}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <h4 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {item.title}
                    </h4>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {format(new Date(item.recordedDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      {item.viewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{item.viewCount} views</span>
                        </div>
                      )}
                    </div>

                    {/* Uploader */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {item.uploadedBy.profileImage ? (
                        <Image
                          src={item.uploadedBy.profileImage}
                          alt={item.uploadedBy.username || "User"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold">
                          {item.uploadedBy.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="text-xs text-slate-600">
                        {item.uploadedBy.username ||
                          `${item.uploadedBy.firstName} ${item.uploadedBy.lastName}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button (mobile) */}
        {footage.length > 3 && (
          <div className="mt-4 md:hidden">
            <Button
              variant="outline"
              onClick={handleViewAll}
              className="w-full border-slate-300 hover:border-blue-400 hover:bg-blue-50"
            >
              View All Footage ({footage.length})
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
