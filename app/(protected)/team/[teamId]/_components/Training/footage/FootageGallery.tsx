"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Video,
  Plus,
  Search,
  Calendar,
  Filter,
  AlertCircle,
} from "lucide-react";
import { getTeamFootage } from "@/app/(protected)/team/actions/training/trainingFootageActions";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import FootageCard from "./FootageCard";
import FootagePlayer from "./FootagePlayer";
import UploadFootageDialog from "./UploadFootageDialog";
import { TrainingFootageWithRelations } from "@/types/Training/types/training";

interface FootageGalleryProps {
  teamId: string;
  currentUserId: string | null;
}

export default function FootageGallery({ teamId, currentUserId }: any) {
  const { footageList, setFootageList, isUploadFootageOpen } =
    useTrainingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFootage, setSelectedFootage] =
    useState<TrainingFootageWithRelations | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Fetch team footage
  const {
    data: footageResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["team-footage-gallery", teamId, page],
    queryFn: async () => {
      return await getTeamFootage(
        teamId,
        ITEMS_PER_PAGE,
        (page - 1) * ITEMS_PER_PAGE
      );
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Update local state when data changes
  useEffect(() => {
    if (footageResponse?.success && footageResponse.data) {
      setFootageList(footageResponse.data);
    }
  }, [footageResponse, setFootageList]);

  // Filter footage based on search
  const filteredFootage = useMemo(() => {
    if (!searchQuery.trim()) return footageList;

    const query = searchQuery.toLowerCase();
    return footageList.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.uploadedBy.username?.toLowerCase().includes(query)
    );
  }, [footageList, searchQuery]);

  const handleFootageClick = useCallback(
    (footage: TrainingFootageWithRelations) => {
      setSelectedFootage(footage);
    },
    []
  );

  const handleClosePlayer = useCallback(() => {
    setSelectedFootage(null);
  }, []);

  const hasMore = footageResponse?.hasMore || false;

  // Loading state
  if (isLoading && page === 1) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          Failed to load training footage. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Training Footage</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    {footageList.length}{" "}
                    {footageList.length === 1 ? "video" : "videos"} available
                  </p>
                </div>
              </div>
              <Button
                onClick={() => useTrainingStore.getState().openUploadFootage()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Footage
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Search & Filters */}
        <Card className="border-slate-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search footage by title, description, or uploader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter button (placeholder for future) */}
              <Button variant="outline" className="border-slate-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footage Grid */}
        {filteredFootage.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFootage.map((footage) => (
                <FootageCard
                  key={footage.id}
                  footage={footage}
                  onClick={() => handleFootageClick(footage)}
                  currentUserId={currentUserId}
                  onDeleted={refetch}
                />
              ))}
            </div>

            {/* Pagination */}
            {(page > 1 || hasMore) && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <Badge variant="secondary" className="px-4 py-2">
                  Page {page}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-slate-100 p-4 rounded-full">
                  <Video className="w-12 h-12 text-slate-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery ? "No footage found" : "No footage yet"}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Upload training videos to share with your team"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footage Player Modal */}
      {selectedFootage && (
        <FootagePlayer footage={selectedFootage} onClose={handleClosePlayer} />
      )}

      {/* Upload Dialog */}
      <UploadFootageDialog teamId={teamId} onSuccess={refetch} />
    </>
  );
}
