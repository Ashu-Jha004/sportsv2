import { create } from "zustand";
import { TeamDiscoveryFilters } from "@/types/discovery/team-discovery";

interface DiscoverStore {
  filters: TeamDiscoveryFilters;
  tempFilters: TeamDiscoveryFilters; // For controlled inputs before search
  setTempFilter: (key: keyof TeamDiscoveryFilters, value: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  initializeFromURL: (searchParams: URLSearchParams) => void;
}

export const useDiscoverStore = create<DiscoverStore>((set, get) => ({
  filters: {},
  tempFilters: {},

  setTempFilter: (key, value) => {
    set((state) => ({
      tempFilters: {
        ...state.tempFilters,
        [key]: value || undefined,
      },
    }));
  },

  applyFilters: () => {
    const { tempFilters } = get();
    set({ filters: { ...tempFilters } });
  },

  clearFilters: () => {
    set({ filters: {}, tempFilters: {} });
  },

  initializeFromURL: (searchParams) => {
    const schoolName = searchParams.get("school") || undefined;
    const teamName = searchParams.get("team") || undefined;
    const sport = searchParams.get("sport") || undefined;

    const urlFilters: any = {
      schoolName,
      teamName,
      sport,
    };

    set({
      filters: urlFilters,
      tempFilters: urlFilters,
    });
  },
}));
