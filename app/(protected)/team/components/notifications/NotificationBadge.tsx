"use client";

import { Bell, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "../../hooks/useNotifications";
import Link from "next/link";

export default function NotificationBadge() {
  const { unreadCount, isLoading } = useNotifications();

  return (
    <div className="relative">
      <Link
        href="/notifications"
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
        ) : unreadCount > 0 ? (
          <>
            <Bell className="w-5 h-5 text-slate-700" />
            <Badge className="absolute -top-1 -right-1 text-xs bg-red-500 border-red-600 h-5 px-1.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          </>
        ) : (
          <BellOff className="w-5 h-5 text-slate-400" />
        )}
      </Link>
    </div>
  );
}
