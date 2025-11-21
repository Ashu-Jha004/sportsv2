"use client";

import React from "react";
import { Menu, Bell, MessageCircle } from "lucide-react";
import AthleteSearch from "./fetchAthleteSearchResults"; // ✅ correct import
import { Button } from "@/components/ui/button";

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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-4">
          {/* ✅ Search Component integrated here */}
          <div className="flex-1 flex justify-center">
            <AthleteSearch />
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="p-2">
              <Bell size={16} />
            </Button>
            <Button variant="ghost" className="p-2">
              <MessageCircle size={16} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
