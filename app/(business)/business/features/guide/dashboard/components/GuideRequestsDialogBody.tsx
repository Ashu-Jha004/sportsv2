// app/(guide)/dashboard/components/GuideRequestsDialogBody.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useGuideEvaluationRequests } from "../../hooks/useGuideEvaluationRequests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGuideEvaluationRequestStatusAction } from "../EvaluationAction/guideEvaluationRequests";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GuideScheduleDialog } from "./GuideScheduleDialog";

type GuideRequestsDialogBodyProps = {
  guideId: string;
};

export function GuideRequestsDialogBody(_props: GuideRequestsDialogBodyProps) {
  const { data, isLoading, error } = useGuideEvaluationRequests();
  const queryClient = useQueryClient();

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await updateGuideEvaluationRequestStatusAction({
        requestId,
        action: "REJECT",
      });
      if (!res.success) {
        throw new Error(res.message || "Failed to reject evaluation request.");
      }
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["guide-evaluation-requests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["my-evaluation-requests"],
      });
      toast.success("Request rejected", {
        description: "The athlete has been notified.",
      });
    },
    onError: (err) => {
      console.error("[GuideRequestsDialogBody] REJECT error", err);
      toast.error("Failed to reject request.", {
        description:
          process.env.NODE_ENV === "development"
            ? String(err)
            : "Unexpected error while rejecting request.",
      });
    },
  });

  const handleApproveClick = useCallback((requestId: string) => {
    setSelectedRequestId(requestId);
    setScheduleOpen(true);
  }, []);

  const handleRejectClick = useCallback(
    (requestId: string) => {
      rejectMutation.mutate(requestId);
    },
    [rejectMutation]
  );

  const requests = data ?? [];

  const pendingFirst = useMemo(
    () =>
      [...requests].sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (a.status !== "PENDING" && b.status === "PENDING") return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
    [requests]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading requests...
        </span>
      </div>
    );
  }

  if (error) {
    console.error("[GuideRequestsDialogBody] Load error", error);
    return (
      <p className="text-sm text-red-500">
        Failed to load evaluation requests.
      </p>
    );
  }

  if (!pendingFirst.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No physical evaluation requests yet.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {pendingFirst.map((req) => {
          const athlete = req.athlete;
          const fullName =
            (athlete.firstName || athlete.lastName
              ? `${athlete.firstName ?? ""} ${athlete.lastName ?? ""}`.trim()
              : null) ??
            athlete.username ??
            "Unknown athlete";

          const locationParts = [
            athlete.city,
            athlete.state,
            athlete.country,
          ].filter(Boolean);
          const locationLabel =
            locationParts.length > 0
              ? locationParts.join(", ")
              : "Location not set";

          const statusColor =
            req.status === "PENDING"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : req.status === "ACCEPTED"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200";

          return (
            <Card
              key={req.id}
              className="flex flex-col gap-3 border p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  {athlete.profileImage && (
                    <AvatarImage src={athlete.profileImage} alt={fullName} />
                  )}
                  <AvatarFallback>
                    {fullName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{fullName}</p>
                    {athlete.username && (
                      <span className="text-xs text-muted-foreground">
                        @{athlete.username}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    Class {athlete.class} · Rank {athlete.rank}
                  </p>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locationLabel}
                  </p>

                  {req.message && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Athlete message: {req.message}
                    </p>
                  )}

                  {req.status !== "PENDING" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status: {req.status}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-col items-stretch gap-2 md:mt-0 md:items-end">
                <Badge
                  className={`self-start text-[10px] font-medium ${statusColor}`}
                  variant="outline"
                >
                  {req.status === "PENDING"
                    ? "Pending"
                    : req.status === "ACCEPTED"
                    ? "Accepted"
                    : "Rejected"}
                </Badge>

                <div className="flex gap-2">
                  {req.status === "PENDING" && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={rejectMutation.isPending}
                        onClick={() => handleRejectClick(req.id)}
                      >
                        {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApproveClick(req.id)}
                      >
                        Schedule & accept
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {req.status === "ACCEPTED" && (
                <div className="mt-2 space-y-1">
                  {req.scheduledDate && (
                    <p className="text-xs text-muted-foreground">
                      Date:{" "}
                      {new Date(req.scheduledDate).toLocaleDateString(
                        undefined,
                        {
                          dateStyle: "medium",
                        }
                      )}
                    </p>
                  )}
                  {req.scheduledTime && (
                    <p className="text-xs text-muted-foreground">
                      Time: {req.scheduledTime}
                    </p>
                  )}
                  {req.location && (
                    <p className="text-xs text-muted-foreground">
                      Location: {req.location}
                    </p>
                  )}
                  {req.otp && (
                    <p className="text-xs font-semibold text-gray-900">
                      OTP: {req.otp}
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <GuideScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        requestId={selectedRequestId}
      />
    </>
  );
}
