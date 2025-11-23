// app/(guide)/dashboard/components/GuideDashboardHeader.tsx
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, Settings, MapPin } from "lucide-react";
import { updateGuideLocation } from "../actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader as ShadDialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuideRequestsDialogBody } from "./GuideRequestsDialogBody";

type GuideDashboardHeaderProps = {
  guide: {
    id: string;
    name: string | null;
    email: string;
    status: "pending_review" | "approved" | "rejected";
    location: {
      city: string | null;
      state: string | null;
      country: string | null;
      lat: number | null;
      lon: number | null;
    };
    primarySport: string | null;
  };
};

export default function GuideDashboardHeader({
  guide,
}: GuideDashboardHeaderProps) {
  const router = useRouter();
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleUpdateLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Location Can not be updated!", {
        description: "Geolocation is not supported by this browser.",
      });
      console.warn("[GuideDashboardHeader] Geolocation not available");
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsUpdatingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.info("[GuideDashboardHeader] Fetched current location", {
          latitude,
          longitude,
        });

        try {
          const result = await updateGuideLocation({ latitude, longitude });

          if (!result.success) {
            console.error(
              "[GuideDashboardHeader] Failed to update location",
              result
            );
            alert(
              process.env.NODE_ENV === "development"
                ? `Location update failed: ${result.message}`
                : "Location update failed. Please try again."
            );
            toast.error("We have database error!", {
              description: result.message,
            });
          } else {
            toast.success("Location Updated!", {
              description: "Your current location has been saved.",
            });
            router.refresh();
          }
        } catch (error) {
          console.error(
            "[GuideDashboardHeader] updateGuideLocation error",
            error
          );
          toast.error("Location update failed", {
            description:
              process.env.NODE_ENV === "development"
                ? String(error)
                : "Unexpected error while updating location.",
          });
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      (err) => {
        console.error("[GuideDashboardHeader] Browser geolocation error", err);
        alert("Unable to get your location. Please check browser settings.");
        setIsUpdatingLocation(false);
      }
    );
  }, [router]);

  const statusLabel =
    guide.status === "approved"
      ? "Approved"
      : guide.status === "pending_review"
      ? "Pending review"
      : "Rejected";

  const statusClasses =
    guide.status === "approved"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : guide.status === "pending_review"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-red-50 text-red-700 ring-red-200";

  return (
    <>
      <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Guide dashboard
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusClasses}`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            {guide.name} • {guide.primarySport ?? "No primary sport set"}
          </p>
          <p className="text-xs text-gray-500">
            {guide.location.city && guide.location.country
              ? `${guide.location.city}, ${guide.location.country}`
              : "Location not set"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* New: mail opens dialog */}
          <Dialog open={requestsOpen} onOpenChange={setRequestsOpen}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Open physical evaluation requests"
              onClick={() => setRequestsOpen(true)}
            >
              <Mail className="h-4 w-4" />
            </Button>

            <DialogContent className="max-w-3xl">
              <ShadDialogHeader>
                <DialogTitle>Physical evaluation requests</DialogTitle>
              </ShadDialogHeader>
              <GuideRequestsDialogBody guideId={guide.id} />
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="default"
            disabled={isUpdatingLocation}
            onClick={handleUpdateLocation}
            className="flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            <span>{isUpdatingLocation ? "Updating…" : "Update location"}</span>
          </Button>
        </div>
      </header>
    </>
  );
}
