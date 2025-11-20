import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { AthleteData } from "@/app/(protected)/profile/hooks/use-athlete";

interface AthleteState {
  // Current athlete profile data (null if none)
  currentAthlete: AthleteData | null;

  // UI state to manage edit mode and current editing section
  isEditing: boolean;
  editSection: string | null;

  // Actions to update athlete profile data in store
  setCurrentAthlete: (athlete: AthleteData | null) => void;
  updateCurrentAthlete: (updates: Partial<AthleteData>) => void;
  clearCurrentAthlete: () => void;

  // Actions to update UI state
  setIsEditing: (isEditing: boolean) => void;
  setEditSection: (section: string | null) => void;
}

export const useAthleteStore = create<AthleteState>()(
  devtools(
    persist(
      (set, get) => ({
        currentAthlete: null,
        isEditing: false,
        editSection: null,

        setCurrentAthlete: (athlete) => {
          console.log(
            "📦 [Zustand] Setting current athlete:",
            athlete?.username
          );
          set({ currentAthlete: athlete }, false, "setCurrentAthlete");
        },

        updateCurrentAthlete: (updates) => {
          const current = get().currentAthlete;
          if (!current) {
            console.warn("⚠️  [Zustand] No current athlete to update");
            return;
          }

          const updated = { ...current, ...updates };
          console.log("📦 [Zustand] Updating current athlete:", {
            username: current.username,
            fields: Object.keys(updates),
          });

          set({ currentAthlete: updated }, false, "updateCurrentAthlete");
        },

        clearCurrentAthlete: () => {
          console.log("📦 [Zustand] Clearing current athlete");
          set({ currentAthlete: null }, false, "clearCurrentAthlete");
        },

        setIsEditing: (isEditing) => {
          console.log("📦 [Zustand] Set editing mode:", isEditing);
          set({ isEditing }, false, "setIsEditing");
        },

        setEditSection: (section) => {
          console.log("📦 [Zustand] Set edit section:", section);
          set({ editSection: section }, false, "setEditSection");
        },
      }),
      {
        name: "athlete-store",
        partialize: (state) => ({
          currentAthlete: state.currentAthlete,
        }),
      }
    ),
    { name: "AthleteStore" }
  )
);

// Common selectors for convenience

export const useCurrentAthleteUsername = () =>
  useAthleteStore((state) => state.currentAthlete?.username);

export const useAthleteLocation = () =>
  useAthleteStore((state) => state.currentAthlete?.location);

export const useAthleteRoles = () =>
  useAthleteStore((state) => state.currentAthlete?.roles ?? []);
