// components/profile/stats/RecentMatchesList.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Match {
  id: number;
  opponent: string;
  result: "Win" | "Loss";
  score: string;
  date: string;
}

interface RecentMatchesListProps {
  matches: Match[];
}

export function RecentMatchesList({ matches }: RecentMatchesListProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Recent Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              {/* Match Info */}
              <div className="flex items-center gap-4 flex-1">
                {/* Result Badge */}
                <Badge
                  className={`${
                    match.result === "Win"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white font-semibold px-3 py-1`}
                >
                  {match.result}
                </Badge>

                {/* Opponent & Score */}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {match.opponent}
                  </p>
                  <p className="text-sm text-slate-600">Score: {match.score}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{format(parseISO(match.date), "MMM dd, yyyy")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
          View All Matches
        </button>
      </CardContent>
    </Card>
  );
}
