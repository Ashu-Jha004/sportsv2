// types.ts
// Shared TypeScript types for the Sidebar, Navbar, and Layout components
// Designed for Next.js 13+ (App Router) with React + TypeScript
import { Users, User, Briefcase, Crosshair, PlayCircle } from "lucide-react";

export type MenuItem = {
  key: string; // unique key for the menu
  label: string;
  icon?: any;
  href?: string; // Next.js route path
  onClick?: () => void; // optional callback for SPA behavior
  iconName?: string; // lightweight representation of an icon; mapping to actual icon is done in components
  children?: MenuItem[]; // reserved for nested menus in future
  badge?: string | number; // optional badge text/number
};

export type SidebarProps = {
  brandName?: string;
  userName?: string;
  menus: MenuItem[];
  initialCollapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: (item: MenuItem) => void; // optional central navigation handler
};

export type NavbarProps = {
  brandName?: string;
  onBurgerClick?: () => void;
  collapsed?: boolean;
};

export const MENU_ITEMS: MenuItem[] = [
  { key: "team", label: "Team", href: "/team", iconName: "team" },
  { key: "profile", label: "Profile", href: "/profile", iconName: "profile" },
  {
    key: "business",
    label: "Business",
    href: "/business",
    iconName: "business",
  },
  { key: "match", label: "Match", href: "/match", iconName: "match" },
  {
    key: "gametube",
    label: "GameTube",
    href: "/gametube",
    iconName: "gametube",
  },
];

// Utility: keys used by localStorage to persist sidebar collapsed state (optional)
export const SIDEBAR_STORAGE_KEY = "app.sidebar.collapsed";
