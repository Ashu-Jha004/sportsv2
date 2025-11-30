"use client";

import React, { useState } from "react";
import { Menu, Bell, MessageCircle, Search } from "lucide-react";
import AthleteSearch from "./fetchAthleteSearchResults";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/components/NotificationBell";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

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
          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
            title="Messages"
          >
            <MessageCircle size={20} strokeWidth={2} />
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg group-hover:scale-110 transition-transform">
              3
            </span>
          </Button>

          {/* Notifications */}
          <NotificationBell />

          {/* User Avatar - Always visible, responsive text */}
        </div>
      </div>
    </header>
  );
}
