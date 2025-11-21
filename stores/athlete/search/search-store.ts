// stores/athlete/search/search-store.ts

import { create } from "zustand";
import type { AthleteSummary } from "@/app/api/user/athlete.types";

interface SearchStore {
  searchResults: AthleteSummary[];
  setSearchResults: (results: AthleteSummary[]) => void;
  clearSearchResults: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
  clearSearchResults: () => set({ searchResults: [] }),
}));
