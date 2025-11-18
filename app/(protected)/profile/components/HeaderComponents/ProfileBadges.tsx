// components/profile/ProfileBadges.tsx

import { RankType, ClassType } from "../../types/profile.types";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Award } from "lucide-react";

interface ProfileBadgesProps {
  rank: RankType;
  class: ClassType;
}

const rankConfig: Record<RankType, { color: string; icon: React.ReactNode }> = {
  Pawn: {
    color: "bg-slate-500 text-white hover:bg-slate-600",
    icon: <Shield className="w-3 h-3" />,
  },
  Knight: {
    color: "bg-blue-500 text-white hover:bg-blue-600",
    icon: <Shield className="w-3 h-3" />,
  },
  Bishop: {
    color: "bg-purple-500 text-white hover:bg-purple-600",
    icon: <Award className="w-3 h-3" />,
  },
  Rook: {
    color: "bg-orange-500 text-white hover:bg-orange-600",
    icon: <Award className="w-3 h-3" />,
  },
  Queen: {
    color: "bg-pink-500 text-white hover:bg-pink-600",
    icon: <Crown className="w-3 h-3" />,
  },
  King: {
    color: "bg-yellow-500 text-white hover:bg-yellow-600",
    icon: <Crown className="w-3 h-3" />,
  },
};

const classConfig: Record<ClassType, { color: string }> = {
  A: { color: "bg-emerald-500 text-white hover:bg-emerald-600" },
  B: { color: "bg-blue-500 text-white hover:bg-blue-600" },
  C: { color: "bg-amber-500 text-white hover:bg-amber-600" },
  D: { color: "bg-red-500 text-white hover:bg-red-600" },
};

export function ProfileBadges({
  rank,
  class: athleteClass,
}: ProfileBadgesProps) {
  const rankStyle = rankConfig[rank];
  const classStyle = classConfig[athleteClass];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge
        className={`${rankStyle.color} font-semibold text-xs px-3 py-1 flex items-center gap-1`}
      >
        {rankStyle.icon}
        {rank}
      </Badge>
      <Badge className={`${classStyle.color} font-semibold text-xs px-3 py-1`}>
        Class {athleteClass}
      </Badge>
    </div>
  );
}
