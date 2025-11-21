// types/notification.ts

/**
 * =============================================================================
 * NOTIFICATION TYPE SYSTEM
 * =============================================================================
 */

/**
 * Social interaction notification types
 */
export type SocialNotificationType = "FOLLOW" 

/**
 * Statistics and performance notification types
 */
export type StatsNotificationType =
  | "STAT_UPDATE_REQUEST"
  | "STAT_UPDATE_APPROVED"
  | "STAT_UPDATE_DENIED"
  | "STAT_UPDATE_PERMISSION";

/**
 * System and communication notification types
 */
export type SystemNotificationType = "MESSAGE";

/**
 * Complete union of all notification types
 * Matches your Prisma schema enum values
 */
export type NotificationType =
  | SocialNotificationType
  | StatsNotificationType
  | SystemNotificationType;

/**
 * Notification priority levels for UI rendering
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Notification read status
 */
export type NotificationStatus = "unread" | "read" | "archived";

/**
 * =============================================================================
 * ACTOR INFORMATION
 * =============================================================================
 */

/**
 * User information for notification actors
 * Represents the user who triggered the notification
 */
export interface NotificationActor {
  /** Unique user identifier */
  readonly id: string;
  /** User's chosen username */
  readonly username: string | null;
  /** User's first name */
  readonly firstName: string | null;
  /** User's last name */
  readonly lastName: string | null;
  /** URL to user's profile image */
  readonly profileImageUrl: string | null;
}

/**
 * =============================================================================
 * DATABASE NOTIFICATION INTERFACE
 * =============================================================================
 */

/**
 * Generic constraint for notification data payload
 * Ensures type safety while allowing flexibility
 */
export interface NotificationDataPayload {
  /** Resource ID if applicable (post, team, etc.) */
  readonly resourceId?: string;
  /** Resource type for navigation */
  readonly resourceType?:  "athlete" | "stat" | "message";
  /** Additional metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Complete database notification interface
 * Represents notifications stored in your database
 */
export interface DatabaseNotification<
  TData extends NotificationDataPayload = NotificationDataPayload
> {
  /** Unique notification identifier */
  readonly id: string;
  /** ID of the user receiving the notification */
  readonly userId: string;
  /** ID of the user who triggered the notification (if applicable) */
  readonly actorId: string | null;
  /** Type of notification - matches Prisma enum */
  readonly type: NotificationType;
  /** Notification title/heading */
  readonly title: string;
  /** Detailed notification message */
  readonly message: string;
  /** Structured data payload for the notification */
  readonly data?: TData;
  /** Whether the notification has been read */
  readonly isRead: boolean;
  /** ISO timestamp when notification was created */
  readonly createdAt: string;
  /** ISO timestamp when notification was last updated */
  readonly updatedAt: string;
  /** Information about the user who triggered this notification */
  readonly actor?: NotificationActor | null;
}

/**
 * =============================================================================
 * TOAST NOTIFICATION SYSTEM
 * =============================================================================
 */

/**
 * Toast notification display types
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Action button configuration for toast notifications
 */
export interface ToastAction {
  /** Button label text */
  readonly label: string;
  /** Click handler function */
  readonly onClick: () => void;
  /** Optional button styling variant */
  readonly variant?: "primary" | "secondary" | "danger";
}

/**
 * Toast notification interface for UI feedback
 * Used for temporary user notifications (react-hot-toast, etc.)
 */
export interface ToastNotification {
  /** Unique toast identifier */
  readonly id: string;
  /** Visual type/theme of the toast */
  readonly type: ToastType;
  /** Toast title/heading */
  readonly title: string;
  /** Optional detailed message */
  readonly message?: string;
  /** Auto-dismiss duration in milliseconds */
  readonly duration?: number;
  /** Whether user can manually dismiss */
  readonly dismissible?: boolean;
  /** Optional action button */
  readonly action?: ToastAction;
  /** When the toast was created */
  readonly createdAt: Date;
  /** Optional priority for display ordering */
  readonly priority?: NotificationPriority;
}

/**
 * =============================================================================
 * NOTIFICATION CONFIGURATION & UTILITIES
 * =============================================================================
 */

/**
 * Notification type categories for filtering and organization
 */
export const NOTIFICATION_CATEGORIES = {
  SOCIAL: ["FOLLOW"] as const,
  STATS: [
    "STAT_UPDATE_REQUEST",
    "STAT_UPDATE_APPROVED",
    "STAT_UPDATE_DENIED",
    "STAT_UPDATE_PERMISSION",
  ] as const,
  SYSTEM: ["MESSAGE"] as const,
} as const;

/**
 * Default notification priorities by type
 */
export const NOTIFICATION_PRIORITY_MAP: Record<
  NotificationType,
  NotificationPriority
> = {
  // High priority notifications
  MESSAGE: "high",

  // Normal priority notifications
  FOLLOW: "normal",

  // Low priority notifications
  STAT_UPDATE_APPROVED: "low",
  STAT_UPDATE_DENIED: "low",
  STAT_UPDATE_REQUEST: "low",
  STAT_UPDATE_PERMISSION: "low",
} as const;

/**
 * =============================================================================
 * TYPE GUARDS & UTILITIES
 * =============================================================================
 */

/**
 * Type guard to check if notification type is social-related
 */
export const isSocialNotification = (
  type: NotificationType
): type is SocialNotificationType => {
  return NOTIFICATION_CATEGORIES.SOCIAL.includes(
    type as SocialNotificationType
  );
};



/**
 * Type guard to check if notification type is stats-related
 */
export const isStatsNotification = (
  type: NotificationType
): type is StatsNotificationType => {
  return NOTIFICATION_CATEGORIES.STATS.includes(type as StatsNotificationType);
};

/**
 * Type guard to check if notification type is system-related
 */
export const isSystemNotification = (
  type: NotificationType
): type is SystemNotificationType => {
  return NOTIFICATION_CATEGORIES.SYSTEM.includes(
    type as SystemNotificationType
  );
};

/**
 * Get notification priority for a given type
 */
export const getNotificationPriority = (
  type: NotificationType
): NotificationPriority => {
  return NOTIFICATION_PRIORITY_MAP[type];
};

/**
 * Check if a notification is high priority
 */
export const isHighPriorityNotification = (type: NotificationType): boolean => {
  return getNotificationPriority(type) === "high";
};

/**
 * =============================================================================
 * SPECIALIZED NOTIFICATION TYPES
 * =============================================================================
 */

/**
 * Team invitation notification data
 */


/**
 * Social interaction notification data
 */
export interface SocialNotificationData extends NotificationDataPayload {
  readonly resourceType: "athlete";
  readonly resourceId: string;
  readonly interactionType?: "follow";
}

/**
 * Stats update notification data
 */
export interface StatsNotificationData extends NotificationDataPayload {
  readonly resourceType: "stat";
  readonly resourceId: string;
  readonly statType: string;
  readonly oldValue?: number;
  readonly newValue?: number;
}

/**
 * =============================================================================
 * UTILITY TYPES
 * =============================================================================
 */

/**
 * Utility type for creating typed notifications
 */
export type TypedDatabaseNotification<T extends NotificationType> =
     T extends SocialNotificationType
    ? DatabaseNotification<SocialNotificationData>
    : T extends StatsNotificationType
    ? DatabaseNotification<StatsNotificationData>
    : DatabaseNotification<NotificationDataPayload>;

/**
 * Utility type for notification filters
 */
export interface NotificationFilters {
  readonly types?: NotificationType[];
  readonly isRead?: boolean;
  readonly priority?: NotificationPriority;
  readonly dateRange?: {
    readonly from: Date;
    readonly to: Date;
  };
}

/**
 * Utility type for notification summary/counts
 */
export interface NotificationSummary {
  readonly total: number;
  readonly unread: number;
  readonly byType: Record<NotificationType, number>;
  readonly byPriority: Record<NotificationPriority, number>;
}
