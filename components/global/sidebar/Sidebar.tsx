"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  User,
  Users,
  Briefcase,
  Video,
  BadgeCheck,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarProps, MenuItem, SIDEBAR_STORAGE_KEY } from "../types/types";

// -------------------------------- Icon Registry --------------------------------
const iconMap: Record<string, React.ReactNode> = {
  team: <Users size={16} />,
  profile: <User size={16} />,
  business: <Briefcase size={16} />,
  gametube: <Video size={16} />,
  verified: <BadgeCheck size={16} />,
  match: <PlayCircle size={16} />,
};

// -------------------------------- Sidebar Header --------------------------------
const SidebarHeader = ({ brandName, userName, collapsed, toggle }: any) => {
  return (
    <div className="flex items-center gap-3 px-3 py-4 relative">
      {/* Burger Icon */}
      <Button variant="ghost" size="icon" onClick={toggle}>
        <Menu size={18} />
      </Button>

      {/* Brand Logo — hides when collapsed */}
      {!collapsed && (
        <div className="bg-indigo-500 text-white rounded-md flex items-center justify-center font-semibold w-10 h-10">
          {brandName?.charAt(0)}
        </div>
      )}

      {/* Brand Name + Welcome */}
      {!collapsed && (
        <div className="flex flex-col truncate">
          <span className="text-sm font-semibold">{brandName}</span>
          <span className="text-xs text-slate-500 truncate">
            Welcome, {userName}
          </span>
        </div>
      )}
    </div>
  );
};

// -------------------------------- Menu Item --------------------------------
const SidebarMenuItem = ({ item, collapsed, active }: any) => {
  const router = useRouter();

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full flex items-center justify-start gap-3 px-3 py-2 text-sm",
        active && "bg-slate-200 text-slate-900"
      )}
      onClick={() => {
        if (item.href) router.push(item.href);
        if (item.onClick) item.onClick();
      }}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        {item.iconName ? (
          iconMap[item.iconName.toLowerCase()]
        ) : (
          <Menu size={14} />
        )}
      </div>

      {!collapsed && <span className="truncate">{item.label}</span>}

      {item.badge && !collapsed && (
        <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
          {item.badge}
        </span>
      )}
    </Button>
  );
};

// -------------------------------- Sidebar Body --------------------------------
const SidebarBody = ({
  menus,
  collapsed,
}: {
  menus: MenuItem[];
  collapsed: boolean;
}) => {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-2 overflow-auto">
      {menus.map((m) => (
        <SidebarMenuItem
          key={m.key}
          item={m}
          collapsed={collapsed}
          active={pathname === m.href}
        />
      ))}
    </nav>
  );
};

// -------------------------------- Sidebar Footer --------------------------------
const SidebarFooter = ({ collapsed, onToggle }: any) => {
  return (
    <div className="px-3 py-3 border-t border-slate-200">
      <div className="w-full flex items-center justify-start gap-2">
        <span>Footer</span>
      </div>
    </div>
  );
};

// -------------------------------- Main Component --------------------------------
export const Sidebar = ({
  brandName = "brand",
  userName = "Ashu",
  menus,
  initialCollapsed = false,
  onToggle,
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mounted, setMounted] = useState(false);

  // Hydration-safe loading + restore collapse state
  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved) setCollapsed(saved === "1");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  // Before hydration, avoid mismatch
  if (!mounted) {
    return (
      <aside
        className="h-full border-r border-slate-200 bg-white"
        style={{ width: initialCollapsed ? 72 : 260 }}
      />
    );
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="bg-white border-r border-slate-200 h-full flex flex-col"
    >
      <SidebarHeader
        brandName={brandName}
        userName={userName}
        collapsed={collapsed}
        toggle={onToggle ?? toggle}
      />

      <Separator />

      <SidebarBody menus={menus} collapsed={collapsed} />

      <Separator />

      <SidebarFooter collapsed={collapsed} onToggle={onToggle ?? toggle} />
    </motion.aside>
  );
};
