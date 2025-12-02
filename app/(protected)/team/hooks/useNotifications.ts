"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { pollingConfig } from "../lib/api/teams";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profileImage: string;
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    refetch,
    error,
  } = useQuery<Notification[]>({
    queryKey: ["user-notifications"],
    queryFn: async () => {
      const response = await fetch(
        "/api/user/notifications?limit=20&includeRead=true"
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const json = await response.json();
      if (!json.success)
        throw new Error(json.error || "Failed to fetch notifications");

      return json.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: pollingConfig.notifications, // 2 min polling
    refetchOnWindowFocus: true,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useMutation({
    mutationFn: async (ids?: string[]) => {
      const body = ids ? { ids } : { all: true };
      const response = await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark as read");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });

  // Auto-refetch when window focuses
  useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
  };
}
