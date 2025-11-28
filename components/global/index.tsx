"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar/Sidebar";
import Navbar from "./navbar/Navbar";
import type { MenuItem } from "./types/types";

export default function LayoutShell({
  children,
  menus,
  brandName = "Brand",
  userName,
}: {
  children: React.ReactNode;
  menus: MenuItem[];
  brandName?: string;
  userName?: any;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 text-slate-900">
      <aside className="h-full shrink-0 overflow-y-auto">
        <Sidebar brandName={brandName} userName={userName} menus={menus} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          brandName={brandName}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
