// src/features/notifications/hooks/useNotificationMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/server/notifications/server/queryKeys";
import type { NotificationDto } from "@/types/notifications/types";
import {
  markNotificationReadAction,
  markNotificationUnreadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
  clearAllNotificationsAction,
} from "../server/notifications/server/actions";

function withDevErrorToast(message: string, error: any) {
  if (process.env.NODE_ENV === "development") {
    // Replace with shadcn toast later
    console.error("[notifications:mutationError]", {
      message,
      error,
    });
  }
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await markNotificationReadAction({ id });
      if (!res.ok) {
        throw Object.assign(new Error(res.errorMessage), {
          code: res.errorCode,
        });
      }
      return res.data;
    },
    onSuccess: () => {
      // Refetch list + unread count
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    onError: (error) => {
      withDevErrorToast("Failed to mark notification as read", error);
    },
  });
}

export function useMarkNotificationUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await markNotificationUnreadAction({ id });
      if (!res.ok) {
        throw Object.assign(new Error(res.errorMessage), {
          code: res.errorCode,
        });
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    onError: (error) => {
      withDevErrorToast("Failed to mark notification as unread", error);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await markAllNotificationsReadAction();
      if (!res.ok) {
        throw Object.assign(new Error(res.errorMessage), {
          code: res.errorCode,
        });
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    onError: (error) => {
      withDevErrorToast("Failed to mark all notifications as read", error);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteNotificationAction({ id });
      if (!res.ok) {
        throw Object.assign(new Error(res.errorMessage), {
          code: res.errorCode,
        });
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    onError: (error) => {
      withDevErrorToast("Failed to delete notification", error);
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await clearAllNotificationsAction();
      if (!res.ok) {
        throw Object.assign(new Error(res.errorMessage), {
          code: res.errorCode,
        });
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    onError: (error) => {
      withDevErrorToast("Failed to clear all notifications", error);
    },
  });
}
