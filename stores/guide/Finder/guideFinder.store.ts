// stores/guideFinder.store.ts
import { create } from "zustand";

type SportFilter = "primary" | "secondary" | "all";

type GuideFinderState = {
  open: boolean;
  initialSportFilter: SportFilter;
  username: string;
  sportFilter: SportFilter;
  setUsername: (username: string) => void;
  setSportFilter: (filter: SportFilter) => void;
  openDialog: (opts?: { sportFilter?: SportFilter }) => void;
  closeDialog: () => void;
};

export const useGuideFinderStore = create<GuideFinderState>((set) => ({
  open: false,
  initialSportFilter: "primary",
  username: "",
  sportFilter: "primary",
  setUsername: (username) => set({ username }),
  setSportFilter: (filter) => set({ sportFilter: filter }),
  openDialog: (opts) =>
    set({
      open: true,
      initialSportFilter: opts?.sportFilter ?? "primary",
      sportFilter: opts?.sportFilter ?? "primary",
      username: "",
    }),
  closeDialog: () =>
    set({
      open: false,
      username: "",
    }),
}));
