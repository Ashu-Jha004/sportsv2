// src/features/notifications/types.ts

export type NotificationActorDto = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
};

export type NotificationType = {
  type:
    | "STAT_UPDATE_REQUEST"
    | "STAT_UPDATE_APPROVED"
    | "APPLICATION_SUBMITTED"
    | "APPLICATION_APPROVED"
    | "APPLICATION_REJECTED"
    | "APPLICATION_UNDER_REVIEW"
    | "SYSTEM_ANNOUNCEMENT"
    | "ACCOUNT_UPDATE"
    | "SECURITY_ALERT"
    | "NEW_FOLLOWER"
    | "NEW_MESSAGE"
    | "ROLE_UPDATED"
    | "STAT_UPDATE_DENIED"
    | "JOIN_REQUEST"
    | "TEAM_INVITE"
    | "TEAM_EXPIRING"
    | "MEMBER_JOINED"
    | "MEMBER_LEFT"
    | "ROLE_CHANGED"
    | "MESSAGE"
    | "MENTION"
    | "STAT_UPDATE_PERMISSION"
    | "FOLLOW"; // Deep-link built from type + data on server
};

export type NotificationDto = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string; // or Date
  actor?: {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  } | null;
  data?: {
    requestId?: string;
    guideId?: string;
    otp?: number;
    scheduledDate?: string;
    scheduledTime?: string;
    location?: string;
    equipment?: string[];
  };
};

export type NotificationsPageDto = {
  notifications: NotificationDto[];
  unreadCount: number;
  hasMore: boolean;
};

export type NotificationsFilter = "all" | "unread";

export type GetNotificationsParams = {
  cursor?: string | null; // id of last notification in current page
  limit?: number; // default 20
  filter?: NotificationsFilter;
};
