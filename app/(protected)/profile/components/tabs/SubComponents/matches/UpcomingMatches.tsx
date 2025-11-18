// components/profile/matches/UpcomingMatches.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";

interface UpcomingMatch {
  id: number;
  opponent: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

interface UpcomingMatchesProps {
  matches: UpcomingMatch[];
}

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  const matchTypeColors: Record<string, string> = {
    League: "bg-blue-500 hover:bg-blue-600",
    Friendly: "bg-green-500 hover:bg-green-600",
    Tournament: "bg-purple-500 hover:bg-purple-600",
  };

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Match Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <h4 className="text-lg font-bold text-slate-900">
                    vs {match.opponent}
                  </h4>
                  <Badge
                    className={`${matchTypeColors[match.type]} text-white`}
                  >
                    {match.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(parseISO(match.date), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{match.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{match.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                View Details
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
