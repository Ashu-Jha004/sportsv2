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
import { cn } from "@/lib/utils";

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
          className={cn(
            "relative h-9 w-9 rounded-lg transition-all duration-200",
            showBadge
              ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
          aria-label="Open notifications"
        >
          <Bell
            size={20}
            strokeWidth={2}
            className={cn(
              "transition-transform duration-200",
              isOpen && "scale-110"
            )}
          />

          {/* Unread Badge */}
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30 animate-in zoom-in-50 duration-200">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          {/* Loading Pulse */}
          {isLoading && !showBadge && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-[420px] p-0 border-slate-200 shadow-2xl rounded-xl overflow-hidden"
      >
        <NotificationsPanel onClose={close} />
      </PopoverContent>
    </Popover>
  );
}
