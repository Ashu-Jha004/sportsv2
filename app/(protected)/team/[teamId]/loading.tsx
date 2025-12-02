// app/team/[teamId]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-32 w-full rounded-2xl mb-6" />
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-3 mb-8 max-w-md">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b border-slate-200">
          <Skeleton className="h-12 w-48" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
