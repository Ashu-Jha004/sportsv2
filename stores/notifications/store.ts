// src/features/notifications/store.ts
"use client";

import { create } from "zustand";

export type NotificationsFilter = "all" | "unread";

type NotificationUIState = {
  isOpen: boolean;
  filter: NotificationsFilter;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setFilter: (filter: NotificationsFilter) => void;
};

export const useNotificationUIStore = create<NotificationUIState>((set) => ({
  isOpen: false,
  filter: "all",
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setFilter: (filter) => set({ filter }),
}));
