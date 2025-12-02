"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotifications } from "../../hooks/useNotifications";
import Image from "next/image";
import { Clock, Check, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const notificationTypes: Record<string, { icon: string; color: string }> = {
  TEAM_JOIN_REQUEST: { icon: "👥", color: "text-emerald-600" },
  TEAM_INVITE: { icon: "📨", color: "text-blue-600" },
  MEMBER_JOINED: { icon: "➕", color: "text-green-600" },
  MEMBER_LEFT: { icon: "➖", color: "text-red-600" },
  ROLE_CHANGED: { icon: "👑", color: "text-amber-600" },
  MESSAGE: { icon: "💬", color: "text-purple-600" },
};

export default function NotificationsDropdown() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const recentNotifications = notifications.slice(0, 8);

  const handleNotificationClick = (notification: any) => {
    markAsRead.mutate([notification.id]);

    // Deep link based on notification type
    if (notification.data?.teamId) {
      router.push(`/team/${notification.data.teamId}`);
    } else if (notification.type === "MESSAGE") {
      router.push("/messages");
    } else {
      router.push("/notifications");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 p-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 border-2 border-white rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <DropdownMenuLabel>
            Notifications ({unreadCount} unread)
          </DropdownMenuLabel>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto p-2">
            {recentNotifications.map((notification: any) => {
              const typeInfo = notificationTypes[notification.type] || {
                icon: "📢",
                color: "text-slate-600",
              };

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex gap-3 p-3 cursor-pointer border-l-4 border-transparent hover:border-emerald-400 hover:bg-emerald-50 ${
                    !notification.isRead ? "bg-slate-50 border-slate-200" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold ${typeInfo.color}`}
                  >
                    {typeInfo.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-sm text-slate-600 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-9 px-2 text-sm"
            onClick={() => alert("all notification have been read!")}
          >
            Mark all as read
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-9 px-2 text-sm mt-1"
            asChild
          >
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
