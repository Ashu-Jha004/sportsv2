/**
 * Design Tokens - Single Source of Truth for Design System
 * No dark mode support yet - will be added in Phase 4
 */

export const tokens = {
  // Spacing scale (Tailwind default + custom)
  spacing: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // Border radius - consistent across all components
  radius: {
    sm: "0.5rem", // 8px - small elements (badges, pills)
    md: "0.75rem", // 12px - buttons, inputs
    lg: "1rem", // 16px - cards, dialogs
    xl: "1.5rem", // 24px - feature cards
    full: "9999px", // rounded-full
  },

  // Colors - semantic naming
  colors: {
    // Primary brand color (emerald/green for sports/growth)
    primary: {
      50: "#ecfdf5",
      100: "#d1fae5",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      900: "#064e3b",
    },

    // Accent color (blue for trust/professionalism)
    accent: {
      50: "#eff6ff",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
    },

    // Semantic colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",

    // Team role colors (minimal gradients, solid fallbacks)
    role: {
      owner: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        badge: "bg-gradient-to-r from-amber-400 to-orange-500",
        icon: "text-amber-600",
      },
      captain: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        badge: "bg-gradient-to-r from-blue-500 to-cyan-500",
        icon: "text-blue-600",
      },
      player: {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        badge: "bg-slate-600",
        icon: "text-slate-600",
      },
      manager: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        badge: "bg-gradient-to-r from-purple-500 to-violet-500",
        icon: "text-purple-600",
      },
    },
  },

  // Typography
  typography: {
    h1: "text-4xl lg:text-5xl font-bold text-slate-900",
    h2: "text-3xl lg:text-4xl font-bold text-slate-900",
    h3: "text-2xl lg:text-3xl font-bold text-slate-900",
    h4: "text-xl font-semibold text-slate-900",
    body: "text-base text-slate-700",
    small: "text-sm text-slate-600",
    tiny: "text-xs text-slate-500",
  },

  // Shadows - subtle and consistent
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    card: "shadow-sm hover:shadow-md",
  },

  // Component-specific tokens
  components: {
    card: {
      base: "bg-white border border-slate-200 rounded-lg",
      hover:
        "transition-all duration-200 hover:shadow-md hover:border-slate-300",
      interactive: "hover:border-emerald-300 hover:-translate-y-0.5",
    },

    input: {
      base: "border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
    },

    badge: {
      sm: "px-2 py-0.5 text-xs rounded-md font-medium",
      md: "px-3 py-1 text-sm rounded-md font-semibold",
      lg: "px-4 py-1.5 text-base rounded-lg font-semibold",
    },
  },
} as const;

// Helper function to get role colors
export const getRoleColors = (
  role: "OWNER" | "CAPTAIN" | "PLAYER" | "MANAGER"
) => {
  return tokens.colors.role[
    role.toLowerCase() as keyof typeof tokens.colors.role
  ];
};
