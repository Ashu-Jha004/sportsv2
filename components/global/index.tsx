"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./sidebar/Sidebar";
import Navbar from "./navbar/Navbar";

type LayoutShellProps = {
  children: React.ReactNode;
  brandName?: string;
};

export default function LayoutShell({
  children,
  brandName = "Sparta",
}: LayoutShellProps) {
  const [mounted, setMounted] = useState(false);

  // Desktop sidebar collapse state
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Mobile sidebar drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleMobileMenuClick = () => {
    setMobileSidebarOpen(true);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter:blur(20px)]:bg-white/80 shadow-sm">
        <Navbar brandName={brandName} onMenuClick={handleMobileMenuClick} />
      </header>

      {/* Desktop layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (lg and up) */}
        <aside className="hidden lg:flex h-full shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur-sm">
          <Sidebar
            variant="desktop"
            collapsed={desktopCollapsed}
            onToggleCollapsed={setDesktopCollapsed}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Drawer (under lg) */}
      <Sidebar
        variant="mobile"
        open={mobileSidebarOpen}
        onClose={handleMobileSidebarClose}
      />
    </div>
  );
}
