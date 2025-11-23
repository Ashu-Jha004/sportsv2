"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGuideStatsOtpStore } from "@/stores/guide/OTPVeification/guideStatsOtpStore";
import { verifyStatsUpdateOtpAction } from "../../guide/dashboard/actions"; // adjust import if path differs

type VerifyStatsOtpInput = {
  otp: string;
};

type VerifyStatsOtpError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  traceId?: string;
};

export function useVerifyStatsOtp() {
  const setVerifiedAthlete = useGuideStatsOtpStore((s) => s.setVerifiedAthlete);

  const mutation = useMutation<
    Awaited<ReturnType<typeof verifyStatsUpdateOtpAction>>,
    VerifyStatsOtpError,
    VerifyStatsOtpInput
  >({
    mutationFn: async (input) => {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.debug("[useVerifyStatsOtp] mutationFn called", { input });
      }

      const result = await verifyStatsUpdateOtpAction({ otp: input.otp });

      if (!result.success) {
        const error: VerifyStatsOtpError = {
          code: result.code,
          message: result.message,
          fieldErrors: result.fieldErrors,
          traceId: result.traceId,
        };

        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("[useVerifyStatsOtp] verification failed", error);
        }

        throw error;
      }

      // On success, store athlete snapshot for later use
      setVerifiedAthlete(result.athlete, input.otp);

      return result;
    },
    onError: (error) => {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("[useVerifyStatsOtp] onError", error);
      }
    },
  });

  const verify = useCallback(
    (otp: string) => {
      mutation.mutate({ otp });
    },
    [mutation]
  );

  return {
    verify,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data?.success ? mutation.data.athlete : undefined,
    reset: mutation.reset,
  };
}
