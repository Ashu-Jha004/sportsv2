"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import {
  Users,
  User,
  Play,
  Briefcase,
  ShieldCheck,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ------------------------------------------------------------------
// Types and constants
// ------------------------------------------------------------------

type SidebarVariant = "desktop" | "mobile";

type SidebarProps = {
  variant: SidebarVariant;
  // desktop
  collapsed?: boolean;
  onToggleCollapsed?: (collapsed: boolean) => void;
  // mobile
  open?: boolean;
  onClose?: () => void;
};

type MenuItem = {
  key: string;
  label: string;
  href: string;
  iconName: "profile" | "team" | "video" | "business" | "verified";
  badge?: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: "profile",
    label: "Profile",
    href: "/profile",
    iconName: "profile",
  },
  {
    key: "team",
    label: "Team",
    href: "/team",
    iconName: "team",
  },
  {
    key: "game-tube",
    label: "Game Tube",
    href: "/game-tube",
    iconName: "video",
  },
  {
    key: "business",
    label: "Business",
    href: "/business",
    iconName: "business",
  },
  {
    key: "verified",
    label: "Get Verified",
    href: "/verified",
    iconName: "verified",
  },
];

const iconMap: Record<MenuItem["iconName"], React.ReactNode> = {
  profile: <User className="w-5 h-5" />,
  team: <Users className="w-5 h-5" />,
  video: <Play className="w-5 h-5" />,
  business: <Briefcase className="w-5 h-5" />,
  verified: <ShieldCheck className="w-5 h-5" />,
};

// ------------------------------------------------------------------
// Menu item
// ------------------------------------------------------------------

type SidebarMenuItemProps = {
  item: MenuItem;
  collapsed: boolean;
  active: boolean;
  variant: SidebarVariant;
  onClick?: () => void;
};

const SidebarMenuItem = ({
  item,
  collapsed,
  active,
  variant,
  onClick,
}: SidebarMenuItemProps) => {
  const router = useRouter();
  const isMobile = variant === "mobile";
  const showLabel = isMobile || !collapsed;

  const handleClick = () => {
    router.push(item.href);
    onClick?.(); // in mobile, this will close the drawer
  };

  const buttonContent = (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={cn(
        "w-full justify-start gap-2.5 px-3 py-2.5 h-11 font-medium text-sm transition-all duration-200 group relative overflow-hidden rounded-xl",
        active
          ? "bg-linear-to-r from-blue-600 to-emerald-600 text-white shadow-md shadow-blue-500/25"
          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900",
        collapsed && !isMobile && "justify-center px-2"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-glow"
          className="absolute inset-0 bg-linear-to-r from-blue-500/20 via-emerald-500/20 to-transparent -z-10"
          transition={{ duration: 0.25 }}
        />
      )}

      <div
        className={cn(
          "flex items-center justify-center w-5 h-5 transition-transform duration-200 shrink-0",
          active
            ? "text-white scale-110"
            : "text-slate-500 group-hover:text-slate-900 group-hover:scale-110"
        )}
      >
        {iconMap[item.iconName]}
      </div>

      {showLabel && (
        <span className="truncate flex-1 text-left">{item.label}</span>
      )}

      {item.badge && showLabel && (
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">
          {item.badge}
        </span>
      )}
    </Button>
  );

  // tooltips only for desktop collapsed
  if (collapsed && !isMobile) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
};

// ------------------------------------------------------------------
// Sidebar header (desktop only)
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Footer (user info)
// ------------------------------------------------------------------

type SidebarFooterProps = {
  collapsed: boolean;
};

const SidebarFooter = ({ collapsed }: SidebarFooterProps) => {
  const { user } = useUser();

  return (
    <div className="border-t border-slate-200/70 px-3 py-3 bg-white/80 backdrop-blur-sm">
      <SignedIn>
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="relative">
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-9 h-9 rounded-xl shadow-md ring-2 ring-white/70",
                },
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
          </div>
          {!collapsed && user && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {user.fullName || "Athlete"}
              </span>
              <span className="text-xs text-slate-500 truncate">
                @
                {user.username ||
                  user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
                  "athlete"}
              </span>
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  );
};

// ------------------------------------------------------------------
// Desktop sidebar
// ------------------------------------------------------------------

type DesktopSidebarProps = {
  collapsed?: boolean;
  onToggleCollapsed?: (collapsed: boolean) => void;
};

const DesktopSidebar = ({
  collapsed = false,
  onToggleCollapsed,
}: DesktopSidebarProps) => {
  const pathname = usePathname();

  const width = collapsed ? 72 : 260;

  return (
    <aside
      className="h-full bg-white/95 backdrop-blur-sm border-r border-slate-200/70 shadow-sm hidden lg:flex"
      style={{ width }}
    >
      <div className="flex flex-col w-full">
        <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300/60 scrollbar-track-transparent">
          <div className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <SidebarMenuItem
                  key={item.key}
                  item={item}
                  collapsed={collapsed}
                  active={active}
                  variant="desktop"
                />
              );
            })}
          </div>
        </nav>

        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  );
};

// ------------------------------------------------------------------
// Mobile sidebar (drawer)
// ------------------------------------------------------------------

type MobileSidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

const MobileSidebar = ({ open, onClose }: MobileSidebarProps) => {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    // Prevent body scroll when drawer open
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-0 top-0 h-full w-80 max-w-[88vw] bg-white/95 backdrop-blur-xl border-r border-slate-200/70 shadow-2xl z-50 lg:hidden flex flex-col rounded-r-2xl"
          >
            {/* Top bar with brand + close */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 via-blue-700 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/40">
                  <span className="text-white font-extrabold text-lg">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-slate-900">
                    Sparta
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Athlete Hub
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-xl text-slate-600 hover:bg-slate-100/90"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300/60 scrollbar-track-transparent">
              <div className="space-y-1.5">
                {MENU_ITEMS.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem
                      key={item.key}
                      item={item}
                      collapsed={false}
                      active={active}
                      variant="mobile"
                      onClick={onClose}
                    />
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <SidebarFooter collapsed={false} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ------------------------------------------------------------------
// Root Sidebar component (public API)
// ------------------------------------------------------------------

export const Sidebar = ({
  variant,
  collapsed = false,
  onToggleCollapsed,
  open,
  onClose,
}: SidebarProps) => {
  if (variant === "desktop") {
    return (
      <DesktopSidebar
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
      />
    );
  }

  // mobile
  return <MobileSidebar open={open} onClose={onClose} />;
};
