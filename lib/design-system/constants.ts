export type SportType =
  | "CRICKET"
  | "FOOTBALL"
  | "BASKETBALL"
  | "TENNIS"
  | "SWIMMING"
  | "ATHLETICS"
  | "BOXING"
  | "GYMNASTICS"
  | "VOLLEYBALL"
  | "BADMINTON"
  | "DEFAULT";

export const SPORT_BANNERS: Record<SportType, string> = {
  DEFAULT:
    "https://images.unsplash.com/photo-1552673594-d927e0104a1f?w=1200&h=400&fit=crop",
  CRICKET:
    "https://images.unsplash.com/photo-1579952363873-27d3bfad9c3e?w=1200&h=400&fit=crop",
  FOOTBALL:
    "https://images.unsplash.com/photo-1543351611-52d869e24785?w=1200&h=400&fit=crop",
  BASKETBALL:
    "https://images.unsplash.com/photo-1573100545079-03e9af6d88a3?w=1200&h=400&fit=crop",
  TENNIS:
    "https://images.unsplash.com/photo-1578675598825-0ececcaf3a21?w=1200&h=400&fit=crop",
  SWIMMING:
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=400&fit=crop",
  ATHLETICS:
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop",
  BOXING:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop",
  GYMNASTICS:
    "https://images.unsplash.com/photo-1598343753447-8b0f622e79f9?w=1200&h=400&fit=crop",
  VOLLEYBALL:
    "https://images.unsplash.com/photo-1611066379212-8a118bc546b2?w=1200&h=400&fit=crop",
  BADMINTON:
    "https://images.unsplash.com/photo-1603398937936-fd4a2d933b42?w=1200&h=400&fit=crop",
};

export const SPORT_COLORS: Record<SportType, string> = {
  DEFAULT: "#3b82f6",
  CRICKET: "#059669",
  FOOTBALL: "#ef4444",
  BASKETBALL: "#f59e0b",
  TENNIS: "#8b5cf6",
  SWIMMING: "#06b6d4",
  ATHLETICS: "#10b981",
  BOXING: "#dc2626",
  GYMNASTICS: "#ec4899",
  VOLLEYBALL: "#f97316",
  BADMINTON: "#6366f1",
};
