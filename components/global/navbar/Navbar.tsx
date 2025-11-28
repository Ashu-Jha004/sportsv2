"use client";

import React from "react";
import { Menu, Bell, MessageCircle } from "lucide-react";
import AthleteSearch from "./fetchAthleteSearchResults"; // ✅ correct import
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/components/NotificationBell";
import { SeedNotificationButton } from "@/components/notifications/components/SeedNotificationButton";

export default function Navbar({
  brandName = "Brand",
  collapsed = false,
  setCollapsed,
}: {
  brandName?: string;
  collapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
}) {
  return (
    <header className=" shrink-0 sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* ✅ Search Component integrated here */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <AthleteSearch />
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell />
          <Button variant="ghost" size="sm" className="p-2">
            <MessageCircle size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}
