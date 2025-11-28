// stores/athlete/athleteStats.store.ts
"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// ============================================
// TYPES
// ============================================

export type InjuryRecord = {
  id: string;
  type: string;
  description: string;
  date: string;
  recoveryStatus: string;
  severity?: string;
  affectedArea?: string;
};

export type StrengthScores = {
  muscleMass: number;
  enduranceStrength: number;
  explosivePower: number;
};

export type SpeedScores = {
  sprintSpeed: number;
  acceleration: number;
  agility: number;
  reactionTime: number;
};

export type StaminaScores = {
  cardiovascularFitness: number;
  recoveryEfficiency: number;
  overallFlexibility: number;
  vo2MaxScore: number;
};

export type StrengthAndPower = {
  Countermovement_Jump?: any;
  Loaded_Squat_Jump?: any;
  Depth_Jump?: any;
  Ballistic_Bench_Press?: any;
  Push_Up?: any;
  Ballistic_Push_Up?: any;
  Deadlift_Velocity?: any;
  Barbell_Hip_Thrust?: any;
  Weighted_Pull_up?: any;
  Barbell_Row?: any;
  Plank_Hold?: any;
  pullUps?: number;
  Pushups?: number;
  scores?: StrengthScores;
};

export type SpeedAndAgility = {
  Ten_Meter_Sprint?: any;
  Fourty_Meter_Dash?: any;
  Repeated_Sprint_Ability?: any;
  Illinois_Agility_Test?: any;
  Visual_Reaction_Speed_Drill?: any;
  Reactive_Agility_T_Test?: any;
  Standing_Long_Jump?: any;
  scores?: SpeedScores;
};

export type StaminaAndRecovery = {
  Beep_Test?: any;
  Yo_Yo_Test?: any;
  Cooper_Test?: any;
  Sit_and_Reach_Test?: any;
  scores?: StaminaScores;
};

export type BasicMeasurements = {
  height?: number;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  age?: number;
  bmi?: number;
};

export type AthleteStats = {
  id: string;
  athleteId: string;

  // Basic Measurements
  basicMeasurements?: BasicMeasurements;

  // Strength & Power
  strength?: StrengthAndPower;

  // Speed & Agility
  speed?: SpeedAndAgility;

  // Stamina & Recovery
  stamina?: StaminaAndRecovery;

  // Injuries
  injuries?: InjuryRecord[];

  // Metadata
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
  lastUpdatedAt?: string;
  createdAt?: string;
  evaluationDate?: string;
};

export type RadarChartData = {
  "Strength & Power": number;
  Speed: number;
  Agility: number;
  Recovery: number;
  Flexibility: number;
};

export type FetchResult = {
  success: boolean;
  data?: AthleteStats;
  hasStats?: boolean;
  error?: string;
};

// ============================================
// STORE STATE TYPE
// ============================================

interface AthleteStatsState {
  // Data storage - keyed by athleteId, username, or "current:user"
  statsCache: Map<string, AthleteStats>;

  // Loading states per key
  loadingStates: Map<string, boolean>;

  // Error states per key
  errorStates: Map<string, string | null>;

  // Current viewing athlete
  currentAthleteId: string | null;

  // Has stats flag per key
  hasStatsFlags: Map<string, boolean>;

  // Last fetch timestamps for cache invalidation
  fetchTimestamps: Map<string, number>;

  // Cache TTL in milliseconds (default: 5 minutes)
  cacheTTL: number;

  // ============================================
  // FETCH ACTIONS
  // ============================================

  fetchStatsByAthleteId: (
    athleteId: string,
    forceRefresh?: boolean
  ) => Promise<AthleteStats | null>;
  fetchStatsByUsername: (
    username: string,
    forceRefresh?: boolean
  ) => Promise<AthleteStats | null>;
  fetchCurrentUserStats: (
    forceRefresh?: boolean
  ) => Promise<AthleteStats | null>;

  // ============================================
  // GETTERS
  // ============================================

  getStats: (key: string) => AthleteStats | null;
  getRadarChartData: (key: string) => RadarChartData | null;
  isLoading: (key: string) => boolean;
  getError: (key: string) => string | null;
  hasStats: (key: string) => boolean;
  isCacheValid: (key: string) => boolean;

  // ============================================
  // SETTERS & UTILITIES
  // ============================================

  setCurrentAthleteId: (athleteId: string | null) => void;
  clearError: (key: string) => void;
  invalidateCache: (key: string) => void;
  clearAllCache: () => void;
  setCacheTTL: (ttl: number) => void;

  // ============================================
  // OPTIMISTIC UPDATES
  // ============================================

  updateStatsOptimistically: (
    key: string,
    updates: Partial<AthleteStats>
  ) => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate radar chart data from raw stats
 */
function calculateRadarChartData(stats: AthleteStats): RadarChartData {
  // Extract scores with fallback to 0
  const strengthScore = stats.strength?.scores?.explosivePower ?? 0;
  const speedScore = stats.speed?.scores?.sprintSpeed ?? 0;
  const agilityScore = stats.speed?.scores?.agility ?? 0;
  const recoveryScore = stats.stamina?.scores?.recoveryEfficiency ?? 0;
  const flexibilityScore = stats.stamina?.scores?.overallFlexibility ?? 0;

  return {
    "Strength & Power": strengthScore,
    Speed: speedScore,
    Agility: agilityScore,
    Recovery: recoveryScore,
    Flexibility: flexibilityScore,
  };
}

/**
 * Fetch stats from API endpoint
 */
async function fetchStatsFromAPI(endpoint: string): Promise<FetchResult> {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Prevent Next.js caching
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `HTTP ${response.status}: Failed to fetch stats`
      );
    }

    return result;
  } catch (error) {
    console.error("[AthleteStatsStore] Fetch error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ============================================
// ZUSTAND STORE
// ============================================

export const useAthleteStatsStore = create<AthleteStatsState>()(
  devtools(
    (set, get) => ({
      // ============================================
      // INITIAL STATE
      // ============================================

      statsCache: new Map(),
      loadingStates: new Map(),
      errorStates: new Map(),
      hasStatsFlags: new Map(),
      fetchTimestamps: new Map(),
      currentAthleteId: null,
      cacheTTL: 5 * 60 * 1000, // 5 minutes default

      // ============================================
      // FETCH ACTIONS
      // ============================================

      fetchStatsByAthleteId: async (
        athleteId: string,
        forceRefresh = false
      ) => {
        const cacheKey = `athlete:${athleteId}`;

        // Check if cache is valid and not forcing refresh
        if (!forceRefresh && get().isCacheValid(cacheKey)) {
          const cached = get().statsCache.get(cacheKey);
          if (cached) {
            if (process.env.NODE_ENV === "development") {
              console.debug(
                `[AthleteStatsStore] Using cached stats for ${cacheKey}`
              );
            }
            return cached;
          }
        }

        // Set loading state
        set((state) => ({
          loadingStates: new Map(state.loadingStates).set(cacheKey, true),
          errorStates: new Map(state.errorStates).set(cacheKey, null),
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug(`[AthleteStatsStore] Fetching stats for ${cacheKey}`);
        }

        try {
          const result = await fetchStatsFromAPI(
            `/api/athletes/${athleteId}/stats`
          );

          if (result.hasStats === false) {
            // No stats available for this athlete
            set((state) => ({
              loadingStates: new Map(state.loadingStates).set(cacheKey, false),
              hasStatsFlags: new Map(state.hasStatsFlags).set(cacheKey, false),
              fetchTimestamps: new Map(state.fetchTimestamps).set(
                cacheKey,
                Date.now()
              ),
            }));

            if (process.env.NODE_ENV === "development") {
              console.debug(
                `[AthleteStatsStore] No stats available for ${cacheKey}`
              );
            }

            return null;
          }

          if (!result.success || !result.data) {
            throw new Error(result.error || "Failed to fetch stats");
          }

          // Cache the stats
          set((state) => ({
            statsCache: new Map(state.statsCache).set(cacheKey, result.data!),
            loadingStates: new Map(state.loadingStates).set(cacheKey, false),
            hasStatsFlags: new Map(state.hasStatsFlags).set(cacheKey, true),
            fetchTimestamps: new Map(state.fetchTimestamps).set(
              cacheKey,
              Date.now()
            ),
          }));

          if (process.env.NODE_ENV === "development") {
            console.debug(
              `[AthleteStatsStore] ✅ Cached stats for ${cacheKey}`
            );
          }

          return result.data!;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          set((state) => ({
            loadingStates: new Map(state.loadingStates).set(cacheKey, false),
            errorStates: new Map(state.errorStates).set(cacheKey, errorMessage),
          }));

          console.error(
            `[AthleteStatsStore] ❌ Error fetching ${cacheKey}:`,
            error
          );
          return null;
        }
      },

      fetchStatsByUsername: async (username: string, forceRefresh = false) => {
        const cacheKey = `username:${username}`;

        // Check if cache is valid and not forcing refresh
        if (!forceRefresh && get().isCacheValid(cacheKey)) {
          const cached = get().statsCache.get(cacheKey);
          if (cached) {
            if (process.env.NODE_ENV === "development") {
              console.debug(
                `[AthleteStatsStore] Using cached stats for ${cacheKey}`
              );
            }
            return cached;
          }
        }

        // Set loading state
        set((state) => ({
          loadingStates: new Map(state.loadingStates).set(cacheKey, true),
          errorStates: new Map(state.errorStates).set(cacheKey, null),
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug(`[AthleteStatsStore] Fetching stats for ${cacheKey}`);
        }

        try {
          // First get the athlete profile to get the athleteId
          const profileResponse = await fetch(
            `/api/user/${encodeURIComponent(username)}`
          );
          const profileData = await profileResponse.json();

          if (!profileResponse.ok || !profileData.success) {
            throw new Error(profileData.error || "Athlete profile not found");
          }

          const athleteId = profileData.data.clerkUserId;

          if (!athleteId) {
            throw new Error("Athlete ID not found in profile");
          }

          // Now fetch stats using athleteId
          const result = await fetchStatsFromAPI(
            `/api/athletes/${athleteId}/stats`
          );

          if (result.hasStats === false) {
            // No stats available
            set((state) => ({
              loadingStates: new Map(state.loadingStates).set(cacheKey, false),
              hasStatsFlags: new Map(state.hasStatsFlags).set(cacheKey, false),
              fetchTimestamps: new Map(state.fetchTimestamps).set(
                cacheKey,
                Date.now()
              ),
            }));

            if (process.env.NODE_ENV === "development") {
              console.debug(
                `[AthleteStatsStore] No stats available for ${cacheKey}`
              );
            }

            return null;
          }

          if (!result.success || !result.data) {
            throw new Error(result.error || "Failed to fetch stats");
          }

          // Cache the stats with both username and athleteId keys
          set((state) => {
            const newCache = new Map(state.statsCache);
            const newTimestamps = new Map(state.fetchTimestamps);
            const newHasStats = new Map(state.hasStatsFlags);
            const timestamp = Date.now();

            newCache.set(cacheKey, result.data!);
            newCache.set(`athlete:${athleteId}`, result.data!);

            newTimestamps.set(cacheKey, timestamp);
            newTimestamps.set(`athlete:${athleteId}`, timestamp);

            newHasStats.set(cacheKey, true);
            newHasStats.set(`athlete:${athleteId}`, true);

            return {
              statsCache: newCache,
              loadingStates: new Map(state.loadingStates).set(cacheKey, false),
              hasStatsFlags: newHasStats,
              fetchTimestamps: newTimestamps,
            };
          });

          if (process.env.NODE_ENV === "development") {
            console.debug(
              `[AthleteStatsStore] ✅ Cached stats for ${cacheKey} and athlete:${athleteId}`
            );
          }

          return result.data!;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          set((state) => ({
            loadingStates: new Map(state.loadingStates).set(cacheKey, false),
            errorStates: new Map(state.errorStates).set(cacheKey, errorMessage),
          }));

          console.error(
            `[AthleteStatsStore] ❌ Error fetching ${cacheKey}:`,
            error
          );
          return null;
        }
      },

      fetchCurrentUserStats: async (forceRefresh = false) => {
        const cacheKey = "current:user";

        // Check if cache is valid and not forcing refresh
        if (!forceRefresh && get().isCacheValid(cacheKey)) {
          const cached = get().statsCache.get(cacheKey);
          if (cached) {
            if (process.env.NODE_ENV === "development") {
              console.debug(
                `[AthleteStatsStore] Using cached stats for current user`
              );
            }
            return cached;
          }
        }

        // Set loading state
        set((state) => ({
          loadingStates: new Map(state.loadingStates).set(cacheKey, true),
          errorStates: new Map(state.errorStates).set(cacheKey, null),
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug(`[AthleteStatsStore] Fetching stats for current user`);
        }

        try {
          // First get current user profile
          const profileResponse = await fetch("/api/user/current");
          const profileData = await profileResponse.json();

          if (!profileResponse.ok || !profileData.success) {
            throw new Error(
              profileData.error || "Failed to fetch current user profile"
            );
          }

          const athleteId = profileData.data.clerkUserId;
          const username = profileData.data.username;

          if (!athleteId) {
            throw new Error("Athlete ID not found in current user profile");
          }

          // Now fetch stats using athleteId
          const result = await fetchStatsFromAPI(
            `/api/athletes/${athleteId}/stats`
          );

          if (result.hasStats === false) {
            // No stats available
            set((state) => ({
              loadingStates: new Map(state.loadingStates).set(cacheKey, false),
              hasStatsFlags: new Map(state.hasStatsFlags).set(cacheKey, false),
              fetchTimestamps: new Map(state.fetchTimestamps).set(
                cacheKey,
                Date.now()
              ),
              currentAthleteId: athleteId,
            }));

            if (process.env.NODE_ENV === "development") {
              console.debug(
                `[AthleteStatsStore] No stats available for current user`
              );
            }

            return null;
          }

          if (!result.success || !result.data) {
            throw new Error(result.error || "Failed to fetch stats");
          }

          // Cache the stats with multiple keys
          set((state) => {
            const newCache = new Map(state.statsCache);
            const newTimestamps = new Map(state.fetchTimestamps);
            const newHasStats = new Map(state.hasStatsFlags);
            const timestamp = Date.now();

            newCache.set(cacheKey, result.data!);
            newCache.set(`athlete:${athleteId}`, result.data!);
            if (username) {
              newCache.set(`username:${username}`, result.data!);
            }

            newTimestamps.set(cacheKey, timestamp);
            newTimestamps.set(`athlete:${athleteId}`, timestamp);
            if (username) {
              newTimestamps.set(`username:${username}`, timestamp);
            }

            newHasStats.set(cacheKey, true);
            newHasStats.set(`athlete:${athleteId}`, true);
            if (username) {
              newHasStats.set(`username:${username}`, true);
            }

            return {
              statsCache: newCache,
              loadingStates: new Map(state.loadingStates).set(cacheKey, false),
              hasStatsFlags: newHasStats,
              fetchTimestamps: newTimestamps,
              currentAthleteId: athleteId,
            };
          });

          if (process.env.NODE_ENV === "development") {
            console.debug(
              `[AthleteStatsStore] ✅ Cached stats for current user (multiple keys)`
            );
          }

          return result.data!;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          set((state) => ({
            loadingStates: new Map(state.loadingStates).set(cacheKey, false),
            errorStates: new Map(state.errorStates).set(cacheKey, errorMessage),
          }));

          console.error(
            `[AthleteStatsStore] ❌ Error fetching current user stats:`,
            error
          );
          return null;
        }
      },

      // ============================================
      // GETTERS
      // ============================================

      getStats: (key: string) => {
        return get().statsCache.get(key) || null;
      },

      getRadarChartData: (key: string) => {
        const stats = get().statsCache.get(key);
        if (!stats) return null;
        return calculateRadarChartData(stats);
      },

      isLoading: (key: string) => {
        return get().loadingStates.get(key) || false;
      },

      getError: (key: string) => {
        return get().errorStates.get(key) || null;
      },

      hasStats: (key: string) => {
        return get().hasStatsFlags.get(key) || false;
      },

      isCacheValid: (key: string) => {
        const timestamp = get().fetchTimestamps.get(key);
        if (!timestamp) return false;

        const now = Date.now();
        const ttl = get().cacheTTL;

        return now - timestamp < ttl;
      },

      // ============================================
      // SETTERS & UTILITIES
      // ============================================

      setCurrentAthleteId: (athleteId: string | null) => {
        set({ currentAthleteId: athleteId });

        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[AthleteStatsStore] Current athlete ID set to: ${athleteId}`
          );
        }
      },

      clearError: (key: string) => {
        set((state) => ({
          errorStates: new Map(state.errorStates).set(key, null),
        }));
      },

      invalidateCache: (key: string) => {
        set((state) => {
          const newCache = new Map(state.statsCache);
          const newTimestamps = new Map(state.fetchTimestamps);
          const newHasStats = new Map(state.hasStatsFlags);

          newCache.delete(key);
          newTimestamps.delete(key);
          newHasStats.delete(key);

          return {
            statsCache: newCache,
            fetchTimestamps: newTimestamps,
            hasStatsFlags: newHasStats,
          };
        });

        if (process.env.NODE_ENV === "development") {
          console.debug(`[AthleteStatsStore] Invalidated cache for ${key}`);
        }
      },

      clearAllCache: () => {
        set({
          statsCache: new Map(),
          loadingStates: new Map(),
          errorStates: new Map(),
          hasStatsFlags: new Map(),
          fetchTimestamps: new Map(),
        });

        if (process.env.NODE_ENV === "development") {
          console.info("[AthleteStatsStore] Cleared all cache");
        }
      },

      setCacheTTL: (ttl: number) => {
        set({ cacheTTL: ttl });

        if (process.env.NODE_ENV === "development") {
          console.debug(`[AthleteStatsStore] Cache TTL set to ${ttl}ms`);
        }
      },

      // ============================================
      // OPTIMISTIC UPDATES
      // ============================================

      updateStatsOptimistically: (
        key: string,
        updates: Partial<AthleteStats>
      ) => {
        const currentStats = get().statsCache.get(key);

        if (!currentStats) {
          console.warn(
            `[AthleteStatsStore] Cannot update ${key}: no cached data found`
          );
          return;
        }

        const updatedStats: AthleteStats = {
          ...currentStats,
          ...updates,
          // Deep merge for nested objects
          strength: updates.strength
            ? { ...currentStats.strength, ...updates.strength }
            : currentStats.strength,
          speed: updates.speed
            ? { ...currentStats.speed, ...updates.speed }
            : currentStats.speed,
          stamina: updates.stamina
            ? { ...currentStats.stamina, ...updates.stamina }
            : currentStats.stamina,
        };

        set((state) => ({
          statsCache: new Map(state.statsCache).set(key, updatedStats),
        }));

        if (process.env.NODE_ENV === "development") {
          console.debug(`[AthleteStatsStore] Optimistically updated ${key}`);
        }
      },
    }),
    { name: "AthleteStatsStore" }
  )
);
