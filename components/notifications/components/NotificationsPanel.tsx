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
    <div className="flex h-[500px] flex-col bg-white">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-linear-to-r from-slate-50 to-white shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">Notifications</h3>
          <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-xs font-semibold">
            {filter === "all" ? "All" : "Unread"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-slate-100 rounded-lg"
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            title="Toggle filter"
          >
            <Filter className="h-4 w-4 text-slate-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-slate-100 rounded-lg"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 text-slate-600",
                isFetching && "animate-spin"
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-green-50 rounded-lg"
            onClick={() => markAllReadMutation.mutate()}
            disabled={isMutating}
            title="Mark all as read"
          >
            <CheckCheck className="h-4 w-4 text-green-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-red-50 rounded-lg"
            onClick={() => clearAllMutation.mutate()}
            disabled={isMutating}
            title="Clear all notifications"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Body - Scrollable */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="font-medium">Loading notifications…</span>
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-red-500 text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600">
                {devErrorMessage}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-3xl">🔔</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              No notifications yet
            </p>
            <p className="text-xs text-slate-500">You're all caught up!</p>
          </div>
        ) : (
          <>
            {/* Scrollable List */}
            <ScrollArea className="h-full">
              <div className="flex flex-col p-2 gap-1.5">
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
                        "group flex w-full items-start gap-3 rounded-lg border p-3 text-left text-xs transition-all cursor-pointer",
                        notification.isRead
                          ? "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                          : "border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300"
                      )}
                      onClick={() => handleCardClick(notification)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCardClick(notification);
                        }
                      }}
                    >
                      {/* Read/unread indicator */}
                      <div className="shrink-0 pt-1">
                        <span
                          className={cn(
                            "block h-2 w-2 rounded-full",
                            notification.isRead
                              ? "bg-slate-300"
                              : "bg-blue-500 shadow-sm shadow-blue-500/50"
                          )}
                        />
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-8 w-8 border-2 border-white shadow-sm shrink-0">
                            {actor?.profileImage && (
                              <AvatarImage
                                src={actor.profileImage}
                                alt={fullName ?? "User"}
                              />
                            )}
                            <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                              {(fullName ?? actor?.username ?? "?")
                                .split(" ")
                                .map((p) => p[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                                {notification.title}
                              </p>
                              {createdAtLabel && (
                                <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                                  {createdAtLabel}
                                </span>
                              )}
                            </div>

                            {fullName && (
                              <p className="text-xs text-slate-600 mt-0.5">
                                {fullName}
                                {actor?.username && (
                                  <span className="text-slate-400">
                                    {" "}
                                    · @{actor.username}
                                  </span>
                                )}
                              </p>
                            )}

                            <p className="mt-1 text-xs text-slate-700 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {notification.type.type}
                          </span>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-medium hover:bg-white"
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
                              className="h-6 px-2 text-[10px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
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

            {/* Load More Button - Fixed at bottom */}
            {hasMore && (
              <div className="border-t border-slate-200 px-3 py-2 bg-slate-50/50 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => loadMore()}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading more…
                    </span>
                  ) : (
                    "Load more notifications"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Evaluation details dialog */}
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
