import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChallengeTeamCardSkeleton() {
  return (
    <Card className="border-2">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo Skeleton */}
          <Skeleton className="h-16 w-16 rounded-full" />

          {/* Info Skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-20 mt-2" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Match Record */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-2/3" />
        </div>

        {/* Location Section */}
        <div className="mb-4 pb-4 border-b">
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
