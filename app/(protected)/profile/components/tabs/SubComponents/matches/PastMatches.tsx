// components/profile/matches/PastMatches.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

interface PastMatch {
  id: number;
  opponent: string;
  result: "Win" | "Loss";
  score: string;
  date: string;
}

interface PastMatchesProps {
  matches: PastMatch[];
}

export function PastMatches({ matches }: PastMatchesProps) {
  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {/* Match Info */}
              <div className="flex items-center gap-4 flex-1">
                <Badge
                  className={`${
                    match.result === "Win"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white font-semibold px-4 py-1.5`}
                >
                  {match.result}
                </Badge>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-slate-600" />
                    <h4 className="font-bold text-slate-900">
                      vs {match.opponent}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Final Score: {match.score}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{format(parseISO(match.date), "MMM dd, yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
