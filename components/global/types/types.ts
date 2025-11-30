export interface MenuItem {
  key: string;
  label: string;
  href?: string;
  iconName?: string;
  onClick?: () => void;
  badge?: string | number;
}

export interface SidebarProps {
  brandName?: string;
  userName?: string;
  menus: MenuItem[];
  initialCollapsed?: boolean;
  onToggle?: () => void;
}

export const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

// Example menu items
export const MENU_ITEMS: MenuItem[] = [
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
    badge: 3,
  },
  {
    key: "gametube",
    label: "GameTube",
    href: "/gametube",
    iconName: "video",
  },
  {
    key: "match",
    label: "Matches",
    href: "/matches",
    iconName: "match",
  },
  {
    key: "business",
    label: "Business",
    href: "/business",
    iconName: "suitcase",
  },
  {
    key: "verified",
    label: "Get Verified",
    href: "/verification",
    iconName: "tick",
    badge: "New",
  },
];
