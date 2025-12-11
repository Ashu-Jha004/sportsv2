"use client";

import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Play, Calendar, Eye, MoreVertical, Trash2, User } from "lucide-react";
import { TrainingFootageWithRelations } from "@/types/Training/types/training";
import { getYouTubeThumbnail } from "@/lib/utils/trainingHelpers";
import { deleteTrainingFootage } from "@/app/(protected)/team/actions/training/trainingFootageActions";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";

interface FootageCardProps {
  footage: TrainingFootageWithRelations;
  onClick: () => void;
  currentUserId: string | null;
  onDeleted: () => void;
}

export default function FootageCard({
  footage,
  onClick,
  currentUserId,
  onDeleted,
}: FootageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const thumbnailUrl = useMemo(() => {
    return (
      footage.thumbnailUrl || getYouTubeThumbnail(footage.youtubeUrl, "hq")
    );
  }, [footage.thumbnailUrl, footage.youtubeUrl]);

  const canDelete = useMemo(() => {
    return (
      currentUserId === footage.uploadedById ||
      currentUserId === footage.team.ownerId
    );
  }, [currentUserId, footage.uploadedById, footage.team.ownerId]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteTrainingFootage(footage.id);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast("Footage deleted");
        onDeleted();
      } else {
        toast("Failed to delete");
      }
    },
    onError: (error) => {
      toast("Error");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all group overflow-hidden">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div
            className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer"
            onClick={onClick}
          >
            {!imageError && thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={footage.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-purple-100 to-blue-100">
                <Play className="w-16 h-16 text-purple-400" />
              </div>
            )}

            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white rounded-full p-4 shadow-2xl transform group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-purple-600 fill-purple-600" />
              </div>
            </div>

            {/* Duration Badge */}
            {footage.duration && (
              <Badge
                variant="secondary"
                className="absolute bottom-3 right-3 bg-black/80 text-white border-0"
              >
                {Math.floor(footage.duration / 60)}:
                {String(footage.duration % 60).padStart(2, "0")}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Header with title and menu */}
            <div className="flex items-start justify-between gap-2">
              <h4
                className="font-semibold text-slate-900 line-clamp-2 flex-1 cursor-pointer hover:text-purple-600 transition-colors"
                onClick={onClick}
              >
                {footage.title}
              </h4>
              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Description */}
            {footage.description && (
              <p className="text-sm text-slate-600 line-clamp-2">
                {footage.description}
              </p>
            )}

            {/* Session Badge */}
            {footage.session && (
              <Badge
                variant="outline"
                className="text-xs border-blue-300 text-blue-700"
              >
                {footage.session.title}
              </Badge>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {format(new Date(footage.recordedDate), "MMM d, yyyy")}
                </span>
              </div>
              {footage.viewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{footage.viewCount} views</span>
                </div>
              )}
            </div>

            {/* Uploader */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {footage.uploadedBy.profileImage ? (
                <Image
                  src={footage.uploadedBy.profileImage}
                  alt={footage.uploadedBy.username || "User"}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold">
                  {footage.uploadedBy.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600 truncate">
                  {footage.uploadedBy.username ||
                    `${footage.uploadedBy.firstName} ${footage.uploadedBy.lastName}`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Footage?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{footage.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
