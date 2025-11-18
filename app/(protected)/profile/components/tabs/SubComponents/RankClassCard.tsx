// components/profile/about/RankClassCard.tsx

"use client";

import { RankType, ClassType } from "../../../types/profile.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Award, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RankClassCardProps {
  rank: RankType;
  class: ClassType;
}

const rankConfig: Record<
  RankType,
  {
    color: string;
    icon: React.ReactNode;
    description: string;
  }
> = {
  Pawn: {
    color: "bg-slate-500 text-white hover:bg-slate-600",
    icon: <Shield className="w-4 h-4" />,
    description: "Beginner level athlete",
  },
  Knight: {
    color: "bg-blue-500 text-white hover:bg-blue-600",
    icon: <Shield className="w-4 h-4" />,
    description: "Intermediate level athlete",
  },
  Bishop: {
    color: "bg-purple-500 text-white hover:bg-purple-600",
    icon: <Award className="w-4 h-4" />,
    description: "Advanced level athlete",
  },
  Rook: {
    color: "bg-orange-500 text-white hover:bg-orange-600",
    icon: <Award className="w-4 h-4" />,
    description: "Expert level athlete",
  },
  Queen: {
    color: "bg-pink-500 text-white hover:bg-pink-600",
    icon: <Crown className="w-4 h-4" />,
    description: "Elite level athlete",
  },
  King: {
    color: "bg-yellow-500 text-white hover:bg-yellow-600",
    icon: <Crown className="w-4 h-4" />,
    description: "Champion level athlete",
  },
};

const classConfig: Record<
  ClassType,
  {
    color: string;
    description: string;
  }
> = {
  A: {
    color: "bg-emerald-500 text-white hover:bg-emerald-600",
    description: "Top tier performance class",
  },
  B: {
    color: "bg-blue-500 text-white hover:bg-blue-600",
    description: "High performance class",
  },
  C: {
    color: "bg-amber-500 text-white hover:bg-amber-600",
    description: "Mid-level performance class",
  },
  D: {
    color: "bg-red-500 text-white hover:bg-red-600",
    description: "Entry-level performance class",
  },
};

export function RankClassCard({
  rank,
  class: athleteClass,
}: RankClassCardProps) {
  const rankStyle = rankConfig[rank];
  const classStyle = classConfig[athleteClass];

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Performance Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rank Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-medium text-slate-600">Rank</p>
            </div>
            <Badge
              className={`${rankStyle.color} font-semibold text-base px-4 py-2 flex items-center gap-2 w-fit`}
            >
              {rankStyle.icon}
              {rank}
            </Badge>
            <p className="text-sm text-slate-600">{rankStyle.description}</p>
          </div>

          {/* Class Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-medium text-slate-600">Class</p>
            </div>
            <Badge
              className={`${classStyle.color} font-semibold text-base px-4 py-2 w-fit`}
            >
              Class {athleteClass}
            </Badge>
            <p className="text-sm text-slate-600">{classStyle.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
