// components/profile/about/SportsInfoCard.tsx

"use client";

import { SportsInfo } from "../../../types/profile.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SportsInfoCardProps {
  sportsInfo: SportsInfo;
}

export function SportsInfoCard({ sportsInfo }: SportsInfoCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Sports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Sport */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-slate-600" />
            <p className="text-sm font-medium text-slate-600">Primary Sport</p>
          </div>
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5">
            {sportsInfo.primarySport}
          </Badge>
        </div>

        {/* Secondary Sports */}
        {sportsInfo.secondarySports.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-medium text-slate-600">
                Secondary Sports ({sportsInfo.secondarySports.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sportsInfo.secondarySports.map((sport, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 text-sm px-3 py-1"
                >
                  {sport}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
