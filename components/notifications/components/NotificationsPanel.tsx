// src/features/notifications/components/NotificationsPanel.tsx
"use client";

import { useMemo } from "react";
import { Loader2, Trash2, CheckCheck, RefreshCw, Filter } from "lucide-react";
import { useNotificationUIStore } from "@/stores/notifications/store";
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery";
import {
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "../../../hooks/useNotificationMutations";
import type { NotificationDto } from "@/types/notifications/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type NotificationsPanelProps = {
  onClose?: () => void;
};

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const { filter, setFilter } = useNotificationUIStore();

  const {
    items,
    hasMore,
    isLoading,
    isFetching,
    isError,
    error,
    loadMore,
    refetch,
  } = useNotificationsQuery({
    filter,
    enabled: true,
  });

  const markReadMutation = useMarkNotificationRead();
  const markUnreadMutation = useMarkNotificationUnread();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();

  const isMutating = useMemo(
    () =>
      markReadMutation.isPending ||
      markUnreadMutation.isPending ||
      markAllReadMutation.isPending ||
      deleteMutation.isPending ||
      clearAllMutation.isPending,
    [
      markReadMutation.isPending,
      markUnreadMutation.isPending,
      markAllReadMutation.isPending,
      deleteMutation.isPending,
      clearAllMutation.isPending,
    ]
  );

  const handleCardClick = async (notification: NotificationDto) => {
    // Navigate to deep link if present
    if (notification.link) {
      // Prefer Next.js router in real code
      window.location.href = notification.link;
    }

    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }

    if (onClose) onClose();
  };

  const handleToggleRead = (notification: NotificationDto) => {
    if (notification.isRead) {
      markUnreadMutation.mutate(notification.id);
    } else {
      markReadMutation.mutate(notification.id);
    }
  };

  const devErrorMessage =
    process.env.NODE_ENV === "development" && error
      ? error.message
      : "Unable to load notifications.";

  return (
    <div className="flex h-96 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Notifications</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {filter === "all" ? "All" : "Unread"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            title="Toggle filter"
          >
            <Filter className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw
              className={cn("h-3 w-3", isFetching && "animate-spin")}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => markAllReadMutation.mutate()}
            disabled={isMutating}
            title="Mark all as read"
          >
            <CheckCheck className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:text-red-600"
            onClick={() => clearAllMutation.mutate()}
            disabled={isMutating}
            title="Clear all notifications"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading notifications…</span>
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-xs text-red-500">
            <span>{devErrorMessage}</span>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4 text-center text-xs text-slate-500">
            <span>No notifications yet.</span>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-1 p-2">
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "group flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                      notification.isRead
                        ? "border-slate-200 bg-white hover:bg-slate-50"
                        : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                    )}
                    onClick={() => handleCardClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCardClick(notification);
                      }
                    }}
                  >
                    {/* Read/unread dot */}
                    <span
                      className={cn(
                        "mt-1 h-2 w-2 rounded-full",
                        notification.isRead ? "bg-slate-300" : "bg-blue-500"
                      )}
                    />

                    <div className="flex-1 space-y-0.5">
                      {/* ...title, actor, message... */}

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                          {notification.type.replace(/_/g, " ")}
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleRead(notification);
                            }}
                          >
                            {notification.isRead ? "Mark unread" : "Mark read"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1 text-[10px] text-red-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(notification.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {hasMore && (
              <div className="border-t px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => loadMore()}
                  disabled={isFetching}
                >
                  {isFetching ? "Loading more…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
