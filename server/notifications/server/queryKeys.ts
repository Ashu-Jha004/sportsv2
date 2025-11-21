// src/features/notifications/queryKeys.ts
export const notificationKeys = {
  all: ["notifications"] as const,
  list: (filter: "all" | "unread") =>
    [...notificationKeys.all, "list", filter] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};
