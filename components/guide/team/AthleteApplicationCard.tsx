// components/team/AthleteApplicationCard.tsx
"use client";

import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, User2 } from "lucide-react";

export default function AthleteApplicationCard({ athlete }: any) {
  const router = useRouter();

  const fullName =
    athlete.firstName || athlete.lastName
      ? `${athlete.firstName ?? ""} ${athlete.lastName ?? ""}`.trim()
      : "Unknown";

  const handleClick = () => {
    if (athlete.username) {
      router.push(`/profile/${athlete.username}`);
    }
  };

  return (
    <div
      className="group cursor-pointer p-4 rounded-xl border border-border hover:border-primary hover:shadow-md transition-all bg-gradient-to-r from-muted/50 to-transparent"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 flex-shrink-0">
          <AvatarImage src={athlete.profileImage || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <User2 className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {fullName}
            </h3>
            {athlete.username && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-mono">
                @{athlete.username}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {athlete.primarySport && (
              <Badge variant="secondary" className="text-xs">
                {athlete.primarySport}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Rank: {athlete.rank}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Class: {athlete.class}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {athlete.city && athlete.country
                ? `${athlete.city}${
                    athlete.state ? `, ${athlete.state}` : ""
                  }, ${athlete.country}`
                : athlete.country || "Location not set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
