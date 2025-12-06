"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================
// SKELETON LOADER COMPONENT
// ============================================

export const TeamTabSkeleton: React.FC = () => {
  return (
    <Card className="w-full overflow-hidden border-border/50 bg-linear-to-br from-card to-card/80 shadow-lg backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6">
          {/* Team Logo Skeleton */}
          <Skeleton className="h-20 w-20 rounded-xl shrink-0" />

          {/* Team Info Skeleton */}
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              {/* Team Name */}
              <Skeleton className="h-7 w-48" />
              {/* Sport & Class */}
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Role Badge */}
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Mini Stats Bar */}
        <div className="flex items-center justify-between mb-6 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Action Button */}
        <Skeleton className="h-11 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
};

// ============================================
// COMPACT SKELETON (for smaller spaces)
// ============================================

export const TeamTabSkeletonCompact: React.FC = () => {
  return (
    <Card className="w-full overflow-hidden border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-6 w-10 mx-auto" />
              <Skeleton className="h-2 w-12 mx-auto" />
            </div>
          ))}
        </div>

        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
};

// ============================================
// PULSING SKELETON (animated version)
// ============================================

export const TeamTabSkeletonPulsing: React.FC = () => {
  return (
    <Card className="w-full overflow-hidden border-border/50 bg-linear-to-br from-card to-card/80 shadow-lg backdrop-blur-sm animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-20 w-20 rounded-xl shrink-0 bg-muted/50" />

          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-muted/50 rounded" />
              <div className="h-4 w-32 bg-muted/50 rounded" />
            </div>
            <div className="h-6 w-20 bg-muted/50 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-8 w-12 mx-auto bg-muted/50 rounded" />
              <div className="h-3 w-16 mx-auto bg-muted/50 rounded" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-muted/50" />
            <div className="h-3 w-24 bg-muted/50 rounded" />
          </div>
          <div className="h-6 w-16 bg-muted/50 rounded-full" />
        </div>

        <div className="h-11 w-full bg-muted/50 rounded-lg" />
      </CardContent>
    </Card>
  );
};

export default TeamTabSkeleton;
