// hooks/useNotifications.ts (ENHANCED WITH BELL INDICATOR LOGIC)
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import type { DatabaseNotification } from "@/types/notification";
import {
  validateNotificationResponse,
  formatNotificationError,
  shouldShowNotificationToast,
} from "@/lib/utils/notifications";

// Local storage key for tracking seen notifications
const SEEN_NOTIFICATIONS_KEY = "sparta_seen_notifications";

// Interface for notification state management
interface NotificationState {
  notifications: DatabaseNotification[];
  unreadCount: number;
  hasNewNotifications: boolean; // NEW: Bell indicator state
  newNotificationIds: Set<string>; // NEW: Track which notifications are "new"
}

export const useNotifications = () => {
  // Enhanced state management
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    hasNewNotifications: false,
    newNotificationIds: new Set(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // CRITICAL: Use ref to prevent infinite loops
  const fetchInProgressRef = useRef(false);
  const hasFetchedInitialRef = useRef(false);

  /**
   * NEW: Load seen notifications from localStorage
   */
  const loadSeenNotifications = useCallback((): Set<string> => {
    try {
      const stored = localStorage.getItem(SEEN_NOTIFICATIONS_KEY);
      if (stored) {
        const seenIds = JSON.parse(stored);
        return new Set(Array.isArray(seenIds) ? seenIds : []);
      }
    } catch (error) {
      console.warn(
        "Failed to load seen notifications from localStorage:",
        error
      );
    }
    return new Set();
  }, []);

  /**
   * NEW: Save seen notifications to localStorage
   */
  const saveSeenNotifications = useCallback((seenIds: Set<string>) => {
    try {
      localStorage.setItem(
        SEEN_NOTIFICATIONS_KEY,
        JSON.stringify(Array.from(seenIds))
      );
    } catch (error) {
      console.warn("Failed to save seen notifications to localStorage:", error);
    }
  }, []);

  /**
   * NEW: Determine which notifications are "new" (unread + not seen)
   */
  const calculateNewNotifications = useCallback(
    (notifications: DatabaseNotification[], seenIds: Set<string>) => {
      const newIds = new Set<string>();
      let hasNew = false;

      notifications.forEach((notification) => {
        // Notification is "new" if it's unread AND not previously seen
        if (!notification.isRead && !seenIds.has(notification.id)) {
          newIds.add(notification.id);
          hasNew = true;
        }
      });

      return { newNotificationIds: newIds, hasNewNotifications: hasNew };
    },
    []
  );

  /**
   * ENHANCED: Stable fetchNotifications function with new notification tracking
   */
  const fetchNotifications = useCallback(
    async (options = {}) => {
      const { limit = 20, offset = 0, append = false }: any = options;

      // CRITICAL: Prevent concurrent/duplicate requests
      if (fetchInProgressRef.current) {
        return;
      }

      // CRITICAL: Prevent initial fetch if already done
      if (!append && hasFetchedInitialRef.current && offset === 0) {
        return;
      }

      fetchInProgressRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const url = new URL("/api/notifications", window.location.origin);
        url.searchParams.set("limit", limit.toString());
        if (offset > 0) url.searchParams.set("offset", offset.toString());

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!validateNotificationResponse(data)) {
          throw new Error("Invalid response format from server");
        }

        // NEW: Load seen notifications and calculate new ones
        const seenIds = loadSeenNotifications();
        const { newNotificationIds, hasNewNotifications } =
          calculateNewNotifications(data.data.notifications, seenIds);

        // Update state based on append mode
        setState((prev) => {
          const updatedNotifications = append
            ? [...prev.notifications, ...data.data.notifications]
            : data.data.notifications;

          // Recalculate new notifications for the complete list
          const allNewData = append
            ? calculateNewNotifications(updatedNotifications, seenIds)
            : { newNotificationIds, hasNewNotifications };

          return {
            notifications: updatedNotifications,
            unreadCount: data.data.unreadCount,
            hasNewNotifications: allNewData.hasNewNotifications,
            newNotificationIds: allNewData.newNotificationIds,
          };
        });

        setHasMore(data.data.notifications.length === limit);

        if (!append) {
          hasFetchedInitialRef.current = true;
        }
      } catch (error) {
        console.error("❌ fetchNotifications error:", error);

        const errorMessage = formatNotificationError(error);
        setError(errorMessage);

        if (shouldShowNotificationToast(error)) {
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
        fetchInProgressRef.current = false;
      }
    },
    [loadSeenNotifications, calculateNewNotifications]
  );

  /**
   * NEW: Mark notification as seen (removes from "new" list)
   */
  const markNotificationAsSeen = useCallback(
    (notificationId: string) => {
      const seenIds = loadSeenNotifications();
      seenIds.add(notificationId);
      saveSeenNotifications(seenIds);

      // Update state to remove from new notifications
      setState((prev) => {
        const newIds = new Set(prev.newNotificationIds);
        newIds.delete(notificationId);

        return {
          ...prev,
          newNotificationIds: newIds,
          hasNewNotifications: newIds.size > 0,
        };
      });
    },
    [loadSeenNotifications, saveSeenNotifications]
  );

  /**
   * ENHANCED: Mark as read with seen tracking
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        // First mark as seen (for bell indicator)
        markNotificationAsSeen(notificationId);

        // Then mark as read in database
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        // Optimistic update
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        toast.error("Failed to mark notification as read");
      }
    },
    [markNotificationAsSeen]
  );

  /**
   * ENHANCED: Mark all as read with seen tracking
   */
  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all current notifications as seen
      const seenIds = loadSeenNotifications();
      state.notifications.forEach((notification) => {
        seenIds.add(notification.id);
      });
      saveSeenNotifications(seenIds);

      // Clear new notifications state
      setState((prev) => ({
        ...prev,
        hasNewNotifications: false,
        newNotificationIds: new Set(),
      }));

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Optimistic update
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }));

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  }, [state.notifications, loadSeenNotifications, saveSeenNotifications]);

  /**
   * Delete notification (unchanged but using new state structure)
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }

        // Remove from state and update counts
        setState((prev) => {
          const notification = prev.notifications.find(
            (n) => n.id === notificationId
          );
          const newIds = new Set(prev.newNotificationIds);
          newIds.delete(notificationId);

          return {
            ...prev,
            notifications: prev.notifications.filter(
              (n) => n.id !== notificationId
            ),
            unreadCount:
              notification && !notification.isRead
                ? Math.max(0, prev.unreadCount - 1)
                : prev.unreadCount,
            newNotificationIds: newIds,
            hasNewNotifications: newIds.size > 0,
          };
        });

        // Also remove from seen notifications in localStorage
        const seenIds = loadSeenNotifications();
        seenIds.delete(notificationId);
        saveSeenNotifications(seenIds);

        toast.success("Notification deleted");
      } catch (error) {
        console.error("Failed to delete notification:", error);
        toast.error("Failed to delete notification");
      }
    },
    [loadSeenNotifications, saveSeenNotifications]
  );

  /**
   * Refresh notifications (enhanced)
   */
  const refreshNotifications = useCallback(() => {
    hasFetchedInitialRef.current = false;
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
    setHasMore(true);
    fetchNotifications({ limit: 20, offset: 0 });
  }, [fetchNotifications]);

  /**
   * NEW: Clear all new notification indicators
   */
  const clearNewNotificationIndicators = useCallback(() => {
    const seenIds = loadSeenNotifications();
    state.notifications.forEach((notification) => {
      seenIds.add(notification.id);
    });
    saveSeenNotifications(seenIds);

    setState((prev) => ({
      ...prev,
      hasNewNotifications: false,
      newNotificationIds: new Set(),
    }));
  }, [state.notifications, loadSeenNotifications, saveSeenNotifications]);

  // CRITICAL: Memoized return value to prevent object recreation
  return useMemo(
    () => ({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      hasNewNotifications: state.hasNewNotifications, // NEW: Bell indicator state
      newNotificationIds: state.newNotificationIds, // NEW: Track new notifications
      isLoading,
      error,
      hasMore,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications,
      markNotificationAsSeen, // NEW: Mark single notification as seen
      clearNewNotificationIndicators, // NEW: Clear all indicators
    }),
    [
      state,
      isLoading,
      error,
      hasMore,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications,
      markNotificationAsSeen,
      clearNewNotificationIndicators,
    ]
  );
};
