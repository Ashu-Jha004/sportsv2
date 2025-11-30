import { useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { AlertCircle, MapPin, Activity, User2 } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react"; // add useMemo
import { useVerifyStatsOtp } from "../../hooks/useVerifyStatsOtp";
import { useGuideStatsOtpStore } from "@/stores/guide/OTPVeification/guideStatsOtpStore";
import { useRouter } from "next/navigation";
import TeamApplicationDialog from "@/components/guide/team/TeamApplicationDialog";
export function GuideActionsCard() {
  const router = useRouter();
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { verify, isLoading, isError, error, data, reset } =
    useVerifyStatsOtp();
  const lastVerifiedAthlete = useGuideStatsOtpStore(
    (s) => s.lastVerifiedAthlete
  );

  const athleteForCard = useMemo(() => {
    // Prefer latest from mutation, fall back to persisted store
    if (data) {
      return {
        ...data,
        source: "live" as const,
      };
    }
    if (lastVerifiedAthlete) {
      const { verifiedAt, otpMasked, ...rest } = lastVerifiedAthlete;
      return {
        ...rest,
        source: "persisted" as const,
      };
    }
    return null;
  }, [data, lastVerifiedAthlete]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOtpDialogOpen(open);
      if (!open) {
        // Reset state when closing
        setOtpInput("");
        setFormError(null);
        reset();
      }
    },
    [reset]
  );

  const handleVerifyClick = useCallback(() => {
    setFormError(null);

    // Simple client-side guard before hitting server
    const trimmed = otpInput.trim();
    if (!trimmed) {
      setFormError("OTP is required.");
      return;
    }
    if (!/^\d+$/.test(trimmed) || trimmed.length > 10) {
      setFormError("OTP must be numeric and at most 10 digits.");
      return;
    }

    verify(trimmed);
  }, [otpInput, verify]);

  const handleInitiateStatsUpdate = useCallback(() => {
    if (!athleteForCard) return;

    const targetId = athleteForCard.clerkUserId;
    if (!targetId) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error(
          "[GuideActionsCard] Missing clerkUserId for athlete",
          athleteForCard
        );
      }
      toast.error("Unable to open stats update.", {
        description:
          "This athlete is missing a linked account. Please contact support.",
      });
      return;
    }

    const url = `/business/features/guide/stats/${targetId}/update`;

    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[GuideActionsCard] Navigating to stats update", { url });
    }

    router.push(url);
  }, [athleteForCard, router]);

  const genericErrorMessage = useMemo(() => {
    if (!isError || !error) return null;

    const base = error.message || "Failed to verify OTP.";
    if (process.env.NODE_ENV === "development" && error.traceId) {
      return `${base} (trace: ${error.traceId})`;
    }
    return base;
  }, [isError, error]);

  return (
    <Card className="flex flex-col gap-4 p-4 md:p-6">
      <h2 className="text-base font-semibold text-gray-900">Guide actions</h2>
      <p className="text-xs text-gray-500">
        Quick actions for managing your work as a guide.
      </p>

      {/* Stats update entry point */}
      <Dialog open={otpDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-start"
          >
            Stats Update
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Initiate stats update</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Enter the evaluation OTP shared with the athlete to verify their
              request and start a stats update session.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={10}
                placeholder="Enter OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="sm:max-w-[200px]"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleVerifyClick}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </div>

            {/* Field-level error */}
            {formError && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <p>{formError}</p>
              </div>
            )}

            {/* Server-side generic error */}
            {genericErrorMessage && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <p>{genericErrorMessage}</p>
              </div>
            )}

            {/* Athlete details card, when available */}
            {athleteForCard && (
              <div className="mt-2 rounded-lg border bg-muted/40 p-3 text-xs sm:text-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                      <User2 className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {athleteForCard.firstName || athleteForCard.lastName
                          ? `${athleteForCard.firstName ?? ""} ${
                              athleteForCard.lastName ?? ""
                            }`.trim()
                          : "Unknown name"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        @{athleteForCard.username || "unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                    {athleteForCard.primarySport && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {athleteForCard.primarySport}
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      {athleteForCard.gender || "Gender N/A"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      Rank: {athleteForCard.rank}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      Class: {athleteForCard.class}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {athleteForCard.city && athleteForCard.country
                      ? `${athleteForCard.city}, ${
                          athleteForCard.state
                            ? `${athleteForCard.state}, `
                            : ""
                        }${athleteForCard.country}`
                      : "Location not set"}
                  </span>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className="inline-flex items-center gap-1"
                    onClick={handleInitiateStatsUpdate}
                  >
                    <Activity className="h-3 w-3" />
                    <span>Initiate Stat Update</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing placeholder can remain or be removed */}
      <TeamApplicationDialog />
    </Card>
  );
}
