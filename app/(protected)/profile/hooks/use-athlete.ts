"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useAthleteStore } from "@/stores/athlete/athlete-store";

// Types

export interface AthleteData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profileImage: string | undefined;
  dateOfBirth: string;
  gender: string;
  bio: string | undefined;
  primarySport: string;
  secondarySport: string | undefined;
  rank: string;
  class: string;
  roles: string[];
  location: {
    country: string;
    state: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAthleteData {
  firstName?: string;
  lastName?: string;
  bio?: string | undefined;
  gender?: string;
  primarySport?: string;
  secondarySport?: string | undefined;
  rank?: string;
  class?: string;
  country?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

interface ApiResponse<T> {
  success: boolean;
  athlete?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: any;
}

/**
 * Fetch athlete profile by username
 */
export function useAthlete(
  username: string | null,
  options?: Omit<
    UseQueryOptions<AthleteData, AxiosError>,
    "queryKey" | "queryFn"
  >
) {
  const setCurrentAthlete = useAthleteStore((state) => state.setCurrentAthlete);

  return useQuery<AthleteData, AxiosError>({
    queryKey: ["athlete", username],
    queryFn: async () => {
      if (!username) {
        throw new Error("Username is required");
      }

      console.log(`🔍 [useAthlete] Fetching athlete: ${username}`);

      const response = await axios.get<ApiResponse<AthleteData>>(
        `/api/profile/${username}`
      );

      if (!response.data.success || !response.data.athlete) {
        throw new Error("Invalid response format");
      }

      const athlete = response.data.athlete;

      setCurrentAthlete(athlete);

      console.log(`✅ [useAthlete] Athlete fetched:`, { username });

      return athlete;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}

/**
 * Update athlete profile mutation
 */
export function useUpdateAthlete() {
  const queryClient = useQueryClient();
  const currentAthlete = useAthleteStore((state) => state.currentAthlete);
  const updateCurrentAthlete = useAthleteStore(
    (state) => state.updateCurrentAthlete
  );

  return useMutation<
    ApiResponse<AthleteData>,
    AxiosError<ApiResponse<never>>,
    UpdateAthleteData
  >({
    mutationFn: async (data: UpdateAthleteData) => {
      console.log(`📝 [useUpdateAthlete] Updating athlete:`, {
        fields: Object.keys(data),
      });

      const response = await axios.patch<ApiResponse<AthleteData>>(
        "/api/profile/update",
        data
      );

      console.log(`✅ [useUpdateAthlete] Athlete updated successfully`);

      return response.data;
    },
    onMutate: async (newData) => {
      if (currentAthlete) {
        const optimisticAthlete = { ...currentAthlete, ...newData };
        updateCurrentAthlete(optimisticAthlete);
        console.log(`⚡ [useUpdateAthlete] Optimistic update applied`);
      }

      return { previousAthlete: currentAthlete };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["athlete"] });

      if (data.athlete) {
        updateCurrentAthlete(data.athlete);
      }

      toast.success("Profile updated successfully!");
      console.log(`🔄 [useUpdateAthlete] Cache invalidated`);
    },
  });
}

/**
 * Prefetch athlete profile
 */
export function usePrefetchAthlete() {
  const queryClient = useQueryClient();

  return (username: string) => {
    if (!username) {
      console.warn(`⚠️  [usePrefetchAthlete] Invalid username provided`);
      return;
    }

    queryClient.prefetchQuery({
      queryKey: ["athlete", username],
      queryFn: async () => {
        const response = await axios.get<ApiResponse<AthleteData>>(
          `/api/profile/${username}`
        );

        if (!response.data.success || !response.data.athlete) {
          throw new Error("Invalid response format");
        }

        return response.data.athlete;
      },
      staleTime: 1000 * 60 * 5,
    });

    console.log(`⚡ [usePrefetchAthlete] Prefetched: ${username}`);
  };
}

/**
 * Get current user's athlete profile (favor Zustand, fallback to React Query)
 */
export function useCurrentAthlete(username: string | null) {
  const currentAthlete = useAthleteStore((state) => state.currentAthlete);
  const athleteQuery = useAthlete(username);

  return {
    ...athleteQuery,
    data: currentAthlete || athleteQuery.data,
  };
}
