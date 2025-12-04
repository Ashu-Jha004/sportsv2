"use client";

import React, { useState } from "react";
import { Menu, Bell, MessageCircle, Search } from "lucide-react";
import AthleteSearch from "./fetchAthleteSearchResults";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/components/NotificationBell";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

// Add this component BEFORE the Navbar component
function UnreadBadge() {
  const { data: unreadCount } = useQuery({
    queryKey: ["totalUnreadCount"],
    queryFn: async () => {
      // Placeholder - will implement real count in Phase 5
      return Math.floor(Math.random() * 5); // Random 0-4 for demo
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 10,
  });

  return unreadCount && unreadCount > 0 ? (
    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-lg group-hover:scale-110 transition-transform">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  ) : null;
}

export default function Navbar({
  brandName = "Sparta",
  onMenuClick,
}: {
  brandName?: string;
  onMenuClick?: () => void;
}) {
  const { user } = useUser();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter:blur(20px)]:bg-white/80 shadow-sm">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu + Logo (Desktop: Logo Only) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-10 w-10 p-0 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <Menu size={20} strokeWidth={2.5} />
          </Button>

          {/* Logo - Always visible */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <span className="text-white font-bold text-lg">
                {brandName?.charAt(0)}
              </span>
            </div>
            <span className="text-xl font-black text-slate-900 hidden sm:block lg:inline">
              {brandName}
            </span>
          </div>
        </div>

        {/* Center: Search Bar - Responsive */}
        <div
          className={cn(
            "flex-1 mx-4 lg:mx-6 transition-all duration-300",
            searchFocused ? "max-w-3xl" : "max-w-2xl lg:max-w-4xl"
          )}
        >
          <AthleteSearch
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Right: Actions - Perfect spacing */}
        <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
          {/* Messages - Fully Integrated */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative h-10 w-10 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
              title="Messages"
            >
              <Link href="/messages" className="flex items-center">
                <MessageCircle size={20} strokeWidth={2} />
              </Link>
            </Button>

            {/* Dynamic Unread Badge */}
            <UnreadBadge />
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User Avatar - Always visible, responsive text */}
        </div>
      </div>
    </header>
  );
}
