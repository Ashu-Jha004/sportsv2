// lib/utils/notifications.ts

/**
 * =============================================================================
 * NOTIFICATION UTILITIES & HELPERS
 * =============================================================================
 */

import type { DatabaseNotification } from "@/types/notification";

/**
 * API Response validation interface
 */
interface NotificationApiResponse {
  success: boolean;
  data: {
    notifications: DatabaseNotification[];
    unreadCount: number;
  };
  error?: string;
}

/**
 * Validates notification API response structure
 */
// lib/utils/notifications.ts (FIXED response validation)

/**
 * Validates notification API response structure (FIXED)
 */
export const validateNotificationResponse = (
  data: any
): data is NotificationApiResponse => {
  console.log("🔍 Validating notification response:", {
    success: data?.success,
    hasData: !!data?.data,
    hasNotifications: Array.isArray(data?.data?.notifications),
    hasUnreadCount: typeof data?.data?.unreadCount === "number",
  });

  const isValid =
    data &&
    typeof data === "object" &&
    typeof data.success === "boolean" &&
    data.success === true &&
    data.data &&
    typeof data.data === "object" &&
    Array.isArray(data.data.notifications) &&
    typeof data.data.unreadCount === "number";

  if (!isValid) {
    console.error("❌ Invalid notification response structure:", data);
  }

  return isValid;
};

/**
 * Formats error messages for user display
 */
export const formatNotificationError = (error: unknown): string => {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("HTTP 401")) {
      return "Please log in to view notifications";
    }
    if (error.message.includes("HTTP 403")) {
      return "You don't have permission to access notifications";
    }
    if (error.message.includes("HTTP 429")) {
      return "Too many requests. Please wait a moment";
    }
    if (error.message.includes("Failed to fetch")) {
      return "Network error. Please check your connection";
    }
    return error.message;
  }

  return "An unexpected error occurred";
};

/**
 * Determines if error should show toast notification
 */
export const shouldShowNotificationToast = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Don't show toast for network errors (user likely knows)
    if (error.message.includes("Failed to fetch")) {
      return false;
    }
    // Don't show toast for permission errors (handled in UI)
    if (
      error.message.includes("HTTP 401") ||
      error.message.includes("HTTP 403")
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Groups notifications by date for UI display
 */
export const groupNotificationsByDate = (
  notifications: DatabaseNotification[]
) => {
  const groups: Record<string, DatabaseNotification[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.createdAt);
    let groupKey: string;

    if (notificationDate.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (notificationDate.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    } else {
      groupKey = notificationDate.toLocaleDateString();
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  return groups;
};

/**
 * Formats notification time for display
 */
export const formatNotificationTime = (createdAt: string): string => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};
