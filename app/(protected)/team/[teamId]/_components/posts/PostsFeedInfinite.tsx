"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { Loader2, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInfiniteQuery } from "@tanstack/react-query";
import { teamQueryKeys } from "../../../lib/api/teams";

// Helper to detect media type
const isVideo = (url: string) => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
};

// Helper to optimize Cloudinary URLs
const getOptimizedCloudinaryUrl = (url: string, width = 800, height = 800) => {
  if (url.includes("cloudinary.com")) {
    // Insert transformation parameters
    return url.replace(
      "/upload/",
      `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`
    );
  }
  return url;
};

// Media Renderer Component - Instagram style
function MediaRenderer({ mediaUrls }: { mediaUrls: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const currentMedia = mediaUrls[currentIndex];
  const isCurrentVideo = isVideo(currentMedia);

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Media Display */}
      <div className="relative w-full aspect-square">
        {isCurrentVideo ? (
          <video
            src={currentMedia}
            controls
            className="w-full h-full object-contain"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={getOptimizedCloudinaryUrl(currentMedia, 800, 800)}
            alt="Post media"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 800px"
            priority={currentIndex === 0}
          />
        )}
      </div>

      {/* Navigation dots if multiple media */}
      {mediaUrls.length > 1 && (
        <>
          {/* Left/Right Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
              aria-label="Previous media"
            >
              ←
            </button>
          )}
          {currentIndex < mediaUrls.length - 1 && (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
              aria-label="Next media"
            >
              →
            </button>
          )}

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {mediaUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to media ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function PostsFeedInfinite({ teamId }: { teamId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: teamQueryKeys.teamPosts(teamId),
    queryFn: async ({ pageParam = 0 }) => {
      const url = new URL(
        `/api/teams/${teamId}/posts?page=${pageParam}&limit=10`,
        location.origin
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const json = await response.json();
      return {
        posts: json.data || [],
        nextCursor: json.nextCursor || null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load posts</h3>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const posts = data?.pages.flatMap((page: any) => page.posts) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="p-4 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="w-full aspect-square" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">
              No posts yet
            </h3>
            <p className="text-slate-600 mb-6">
              Be the first to share an update!
            </p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post: any) => (
          <Card key={post.id} className="overflow-hidden border-0 shadow-sm">
            <CardContent className="p-0">
              {/* Post Header - Instagram style */}
              <div className="p-4 flex items-center gap-3">
                <Image
                  src={post.author.profileImage || "/api/placeholder/40/40"}
                  alt={post.author.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-900 truncate">
                    {post.author.firstName} {post.author.lastName}
                  </h4>
                  <time className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
                <Badge variant="outline" className="text-xs">
                  {post.type}
                </Badge>
              </div>

              {/* Media Section */}
              {post.mediaUrls?.length > 0 && (
                <MediaRenderer mediaUrls={post.mediaUrls} />
              )}

              {/* Post Actions - Instagram style */}
              <div className="px-4 pt-3 flex items-center gap-4">
                <button
                  className="hover:text-red-500 transition-colors"
                  aria-label="Like"
                >
                  <Heart className="w-6 h-6" />
                </button>
                <button
                  className="hover:text-blue-500 transition-colors"
                  aria-label="Comment"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button
                  className="hover:text-emerald-500 transition-colors"
                  aria-label="Share"
                >
                  <Send className="w-6 h-6" />
                </button>
                <button
                  className="ml-auto hover:text-amber-500 transition-colors"
                  aria-label="Save"
                >
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 py-3">
                {post.title && (
                  <h5 className="font-semibold text-base mb-2">{post.title}</h5>
                )}
                {post.content && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-semibold mr-2">
                      @{post.author.username}
                    </span>
                    {post.content}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <div ref={ref} className="flex justify-center py-12">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more...
          </div>
        ) : hasNextPage ? (
          <Button variant="outline" onClick={() => fetchNextPage()}>
            Load More Posts
          </Button>
        ) : (
          posts.length > 0 && (
            <p className="text-sm text-slate-500">You're all caught up!</p>
          )
        )}
      </div>
    </div>
  );
}
