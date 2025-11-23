// src/features/notifications/components/NotificationsPanel.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchEvaluationRequestDetails } from "@/server/notifications/client/api";
import type { PhysicalEvaluationRequestDetailsDto } from "@/types/notifications/evaluations/types";

type NotificationsPanelProps = {
  onClose?: () => void;
};

type EvalDetailsState = {
  open: boolean;
  loading: boolean;
  error: string | null;
  data: PhysicalEvaluationRequestDetailsDto | null | undefined;
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

  const [evalDetails, setEvalDetails] = useState<EvalDetailsState>({
    open: false,
    loading: false,
    error: null,
    data: null,
  });

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

  const devErrorMessage =
    process.env.NODE_ENV === "development" && error
      ? error.message
      : "Unable to load notifications.";

  const openEvalDialog = useCallback(async (requestId: string) => {
    setEvalDetails({
      open: true,
      loading: true,
      error: null,
      data: null,
    });

    try {
      const res = await fetchEvaluationRequestDetails(requestId);

      if (!res.ok) {
        throw new Error(res.errorMessage ?? "Failed to load evaluation.");
      }

      setEvalDetails({
        open: true,
        loading: false,
        error: null,
        data: res.data,
      });
    } catch (err) {
      console.error("[NotificationsPanel] eval details load error", err);
      setEvalDetails({
        open: true,
        loading: false,
        error:
          process.env.NODE_ENV === "development"
            ? String(err)
            : "Unable to load evaluation details.",
        data: null,
      });
    }
  }, []);

  const closeEvalDialog = useCallback(() => {
    setEvalDetails({
      open: false,
      loading: false,
      error: null,
      data: null,
    });
  }, []);

  const handleCardClick = async (notification: NotificationDto) => {
    const requestId = notification.data?.requestId;

    if (requestId) {
      if (!notification.isRead) {
        markReadMutation.mutate(notification.id);
      }
      await openEvalDialog(requestId);
      return;
    }

    if (notification.link) {
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
                {items.map((notification) => {
                  const actor = notification.actor;
                  const fullName =
                    actor &&
                    (actor.firstName || actor.lastName
                      ? `${actor.firstName ?? ""} ${
                          actor.lastName ?? ""
                        }`.trim()
                      : actor.username ?? null);

                  const createdAtLabel = notification.createdAt
                    ? new Date(notification.createdAt as any).toLocaleString(
                        undefined,
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )
                    : "";

                  return (
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
                        <div className="flex items-start gap-2">
                          <Avatar className="h-7 w-7">
                            {actor?.profileImage && (
                              <AvatarImage
                                src={actor.profileImage}
                                alt={fullName ?? "User"}
                              />
                            )}
                            <AvatarFallback>
                              {(fullName ?? actor?.username ?? "?")
                                .split(" ")
                                .map((p) => p[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium">
                                {notification.title}
                              </p>
                              {createdAtLabel && (
                                <span className="text-[10px] text-slate-400">
                                  {createdAtLabel}
                                </span>
                              )}
                            </div>

                            {fullName && (
                              <p className="text-[11px] text-slate-500">
                                {fullName}
                                {actor?.username && ` · @${actor.username}`}
                              </p>
                            )}

                            <p className="mt-0.5 text-[11px] text-slate-600">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                            {notification.type.type}
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
                              {notification.isRead
                                ? "Mark unread"
                                : "Mark read"}
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
                  );
                })}
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

      {/* Evaluation details dialog for STAT_UPDATE_* notifications */}
      <Dialog
        open={evalDetails.open}
        onOpenChange={(open) => {
          if (!open) closeEvalDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Physical evaluation details</DialogTitle>
          </DialogHeader>

          {evalDetails.loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading evaluation details…</span>
            </div>
          ) : evalDetails.error ? (
            <p className="text-sm text-red-500">{evalDetails.error}</p>
          ) : evalDetails.data ? (
            <EvaluationDetailsContent data={evalDetails.data} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EvaluationDetailsContent({
  data,
}: {
  data: PhysicalEvaluationRequestDetailsDto;
}) {
  const guide = data.guide;

  const evalDate =
    data.scheduledDate &&
    new Date(data.scheduledDate as any).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-medium">Guide</p>
        <p className="text-xs text-muted-foreground">
          {guide.fullName} · @{guide.username}
        </p>
      </div>

      <div>
        <p className="font-medium">Schedule</p>
        <p className="text-xs text-muted-foreground">
          {evalDate && data.scheduledTime
            ? `${evalDate} at ${data.scheduledTime}`
            : "Schedule not set."}
        </p>
      </div>

      {data.location && (
        <div>
          <p className="font-medium">Location</p>
          <p className="text-xs text-muted-foreground">{data.location}</p>
        </div>
      )}

      {data.otp && (
        <div>
          <p className="font-medium">Verification OTP</p>
          <p className="text-xs font-semibold text-gray-900">{data.otp}</p>
        </div>
      )}

      {data.equipment?.length ? (
        <div>
          <p className="font-medium">Equipment to bring</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
            {data.equipment.map((item: any) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.messageFromGuide && (
        <div>
          <p className="font-medium">Message from guide</p>
          <p className="text-xs text-muted-foreground">
            {data.messageFromGuide}
          </p>
        </div>
      )}
    </div>
  );
}
