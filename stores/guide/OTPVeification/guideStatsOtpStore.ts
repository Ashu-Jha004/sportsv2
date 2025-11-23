// src/stores/guideStatsOtpStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type VerifiedAthleteForStats = {
  id: string;
  clerkUserId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  primarySport: string | null;
  gender: string | null;
  rank: string;
  class: string;
  city: string | null;
  state: string | null;
  country: string | null;
  verifiedAt: string; // ISO timestamp
  otpMasked: string; // e.g. "***1234"
};

type GuideStatsOtpState = {
  lastVerifiedAthlete: VerifiedAthleteForStats | null;
  setVerifiedAthlete: (
    athlete: Omit<VerifiedAthleteForStats, "verifiedAt" | "otpMasked">,
    otp: string
  ) => void;
  clear: () => void;
};

export const useGuideStatsOtpStore = create<GuideStatsOtpState>()(
  persist(
    (set) => ({
      lastVerifiedAthlete: null,
      setVerifiedAthlete: (athlete, otp) => {
        // Mask OTP so we never store the real code in plain text
        const otpMasked =
          otp.length <= 4 ? otp.replace(/\d/g, "*") : `***${otp.slice(-4)}`;

        const payload: VerifiedAthleteForStats = {
          ...athlete,
          verifiedAt: new Date().toISOString(),
          otpMasked,
        };

        if (process.env.NODE_ENV === "development") {
          // Dev-only debugging helper
          // eslint-disable-next-line no-console
          console.debug("[useGuideStatsOtpStore] setVerifiedAthlete", payload);
        }

        set({ lastVerifiedAthlete: payload });
      },
      clear: () => {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.debug("[useGuideStatsOtpStore] clear");
        }
        set({ lastVerifiedAthlete: null });
      },
    }),
    {
      name: "guide-stats-otp-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastVerifiedAthlete: state.lastVerifiedAthlete,
      }),
      version: 1,
    }
  )
);
