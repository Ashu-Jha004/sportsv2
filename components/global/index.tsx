"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar/Sidebar";
import Navbar from "./navbar/Navbar";
import type { MenuItem } from "./types/types";

export default function LayoutShell({
  children,
  menus,
  brandName = "Brand",
  userName = "User",
}: {
  children: React.ReactNode;
  menus: MenuItem[];
  brandName?: string;
  userName?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="h-screen sticky top-0">
        <Sidebar brandName={brandName} userName={userName} menus={menus} />
      </aside>

      <div className="flex-1 flex flex-col">
        <Navbar
          brandName={brandName}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className="p-6 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
