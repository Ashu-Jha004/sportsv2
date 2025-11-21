// src/features/notifications/components/NotificationBell.tsx
"use client";

import { Bell } from "lucide-react";
import { useNotificationUIStore } from "@/stores/notifications/store";
import { useUnreadCountQuery } from "@/hooks/useUnreadCountQuery";
import { NotificationsPanel } from "./NotificationsPanel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function NotificationBell() {
  const { isOpen, toggle, close } = useNotificationUIStore();
  const { unreadCount, isLoading } = useUnreadCountQuery({
    enabled: true,
  });

  const showBadge = unreadCount > 0;

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open: any) => (open ? toggle() : close())}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell
            size={18}
            className={showBadge ? "text-slate-900" : "text-slate-500"}
          />
          {/* Badge */}
          {showBadge && (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          {/* Optional loading dot when fetching unread count */}
          {isLoading && !showBadge && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-slate-300" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" className="w-80 sm:w-96 p-0">
        <NotificationsPanel onClose={close} />
      </PopoverContent>
    </Popover>
  );
}
