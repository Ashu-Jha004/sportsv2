// components/GuideFinderDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGuideFinderStore } from "@/stores/guide/Finder/guideFinder.store";
import { useNearestGuides } from "../hooks/profile/useNearestGuides";
import { useCreateEvaluationRequest } from "../hooks/profile/useCreateEvaluationRequest";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useGuideEvaluationStatuses } from "../hooks/profile/useGuideEvaluationStatuses";
import { Link } from "lucide-react";
import { redirect } from "next/navigation";
export function GuideFinderDialog() {
  const {
    open,
    closeDialog,
    username,
    sportFilter,
    setUsername,
    setSportFilter,
  } = useGuideFinderStore();
  const { user } = useUser();
  const createRequest = useCreateEvaluationRequest();
  const [feedback, setFeedback] = useState<string | null>(null);

  const [guides, setGuides] = useState<GuideSummary[]>([]);
  const guideIds = guides.map((g) => g.id);
  const { statuses } = useGuideEvaluationStatuses(guideIds);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [requestedGuideIds, setRequestedGuideIds] = useState<Set<string>>(
    new Set()
  );

  const nearestMutation = useNearestGuides();

  const handleUseMyLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        nearestMutation.mutate(
          {
            athleteLat: latitude,
            athleteLon: longitude,
            sportFilter,
            username: username || undefined,
            maxDistanceKm: 50,
            limit: 20,
          },
          {
            onSuccess: (data) => {
              setGuides(data.guides);
            },
            onError: () => {
              setGeoError("Failed to load nearby guides. Please try again.");
            },
          }
        );
      },
      () => {
        setGeoError(
          "Unable to get your location. Check permissions and try again."
        );
      }
    );
  };
  const handleRequestEvaluation = async (guideId: string) => {
    setFeedback(null);
    try {
      await createRequest.mutateAsync({ guideId });
      setRequestedGuideIds((prev) => new Set(prev).add(guideId));
      setFeedback("Evaluation request sent successfully.");
    } catch (err) {
      setFeedback(
        "Could not send request. You may already have an active request with this guide."
      );
    }
  };

  const isLoading = nearestMutation.isPending;

  console.log(guides);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Find a nearby guide</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search + filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search by username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter guide username..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Sport filter
              </p>
              <div className="inline-flex rounded-full bg-muted p-1 text-xs">
                {["primary", "secondary", "all"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSportFilter(option as any)}
                    className={`px-3 py-1 rounded-full transition ${
                      sportFilter === option
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {option === "primary"
                      ? "Primary sport"
                      : option === "secondary"
                      ? "Secondary sport"
                      : "All sports"}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              className="ml-auto"
              onClick={handleUseMyLocation}
              disabled={isLoading}
            >
              {isLoading ? "Finding guides..." : "Use my location"}
            </Button>

              <Button
                type="button"
                size="sm"
                className="ml-auto"
                disabled={isLoading}
                onClick={()=>redirect("/profile/Evaluation")}
              >
                {isLoading ? "Opening..." : "Open"}
              </Button>
          
          </div>

          {geoError && <p className="text-xs text-red-500">{geoError}</p>}

          {/* Results list placeholder; Step 3.2 will flesh out cards + evaluation button */}
          <div className="mt-2 max-h-80 overflow-y-auto space-y-2">
            {guides.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground">
                No guides loaded yet. Use your location to find guides near you.
              </p>
            )}

            {guides.map((guide) => {
              const status = statuses[guide.id]; // e.g. "PENDING" | "ACCEPTED" | "REJECTED" | undefined
              const isRequested =
                status === "PENDING" || status === "UNDER_REVIEW";
              const isAccepted = status === "ACCEPTED";

              return (
                <div
                  key={guide.id}
                  className="border rounded-lg p-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {guide.fullName || guide.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{guide.username} • {guide.primarySport ?? "Multi-sport"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {guide.city && guide.country
                        ? `${guide.city}, ${guide.country}`
                        : null}
                      {guide.distanceKm != null &&
                        ` • ${guide.distanceKm.toFixed(1)} km away`}
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-0 flex items-center gap-2">
                    {status && (
                      <span className="text-xs rounded-full bg-muted px-2 py-0.5">
                        {status === "PENDING" && "Request pending"}
                        {status === "UNDER_REVIEW" && "Under review"}
                        {status === "ACCEPTED" && "Accepted"}
                        {status === "REJECTED" && "Rejected"}
                      </span>
                    )}
                    <span className="text-xs rounded-full bg-muted px-2 py-0.5">
                      Rank {guide.rank} · Class {guide.class}
                    </span>
                    {/* Step 4 will wire this button to createEvaluationRequestAction */}
                    <Button
                      size="sm"
                      variant={
                        isRequested || isAccepted ? "secondary" : "outline"
                      }
                      disabled={
                        createRequest.isPending || isRequested || isAccepted
                      }
                      onClick={() => handleRequestEvaluation(guide.id)}
                    >
                      {isRequested
                        ? "Request sent"
                        : isAccepted
                        ? "Already accepted"
                        : createRequest.isPending
                        ? "Sending..."
                        : "Request Evaluation"}
                    </Button>
                  </div>
                </div>
              );
            })}
            {feedback && (
              <p className="mt-2 text-xs text-muted-foreground">{feedback}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
