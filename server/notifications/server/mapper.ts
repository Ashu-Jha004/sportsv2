// src/features/notifications/server/mapper.ts
import type { Notification, Athlete } from "@prisma/client";
import type { NotificationActorDto, NotificationDto } from "../../../types/notifications/types";

function mapActorToDto(actor: Athlete | null): NotificationActorDto | null {
  if (!actor) return null;

  return {
    id: actor.id,
    username: actor.username,
    firstName: actor.firstName,
    lastName: actor.lastName,
    profileImage: actor.profileImage,
  };
}

// Build deep link based on type + data payload
function buildNotificationLink(
  notification: Notification & { data: any }
): string | null {
  const { type, data } = notification;

  try {
    // Defensive: ensure data is an object
    const payload = data && typeof data === "object" ? data : {};

    switch (type) {
      case "NEW_MESSAGE":
      case "MESSAGE":
      case "MENTION": {
        const conversationId = payload.conversationId as string | undefined;
        return conversationId ? `/messages/${conversationId}` : null;
      }
      case "NEW_FOLLOWER":
      case "FOLLOW": {
        const username = payload.username as string | undefined;
        return username ? `/profile/${username}` : null;
      }
      case "STAT_UPDATE_REQUEST":
      case "STAT_UPDATE_APPROVED":
      case "STAT_UPDATE_DENIED":
      case "STAT_UPDATE_PERMISSION": {
        const athleteId = payload.athleteId as string | undefined;
        return athleteId ? `/athletes/${athleteId}/stats` : null;
      }
      case "APPLICATION_SUBMITTED":
      case "APPLICATION_UNDER_REVIEW":
      case "APPLICATION_APPROVED":
      case "APPLICATION_REJECTED": {
        const applicationId = payload.applicationId as string | undefined;
        return applicationId
          ? `/associate/applications/${applicationId}`
          : null;
      }
      case "TEAM_INVITE":
      case "TEAM_EXPIRING":
      case "MEMBER_JOINED":
      case "MEMBER_LEFT":
      case "ROLE_CHANGED": {
        const teamId = payload.teamId as string | undefined;
        return teamId ? `/teams/${teamId}` : null;
      }
      case "ACCOUNT_UPDATE":
      case "SECURITY_ALERT":
      case "SYSTEM_ANNOUNCEMENT": {
        return "/settings/security";
      }
      default:
        return null;
    }
  } catch (error) {
    console.error("[notifications:buildLink] Failed to build link", {
      error,
      notificationId: notification.id,
      type: notification.type,
    });
    return null;
  }
}

export function mapNotificationToDto(
  notification: Notification & { actor: Athlete | null }
): NotificationDto {
  const link = buildNotificationLink(notification as any);

  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    actor: mapActorToDto(notification.actor),
    data: notification.data as Record<string, unknown> | null,
    link,
  };
}
