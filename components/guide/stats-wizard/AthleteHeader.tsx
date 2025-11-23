"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  MapPin,
  Trophy,
  Calendar,
  Shield,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AthleteInfo,
  EvaluationMetadata,
} from "@/stores/statsWizard/statsWizardStore";
import { format } from "date-fns";

type AthleteHeaderProps = {
  athlete: any;
  evaluation: EvaluationMetadata;
  className?: string;
};

// Rank color mapping
const getRankColor = (rank: string): string => {
  const rankColors: Record<string, string> = {
    KING: "bg-amber-500 text-white",
    QUEEN: "bg-purple-500 text-white",
    ROOK: "bg-blue-500 text-white",
    BISHOP: "bg-green-500 text-white",
    KNIGHT: "bg-orange-500 text-white",
    PAWN: "bg-gray-500 text-white",
  };
  return rankColors[rank] || "bg-gray-500 text-white";
};

// Class color mapping
const getClassColor = (classType: string): string => {
  const classColors: Record<string, string> = {
    A: "bg-emerald-500 text-white",
    B: "bg-blue-500 text-white",
    C: "bg-yellow-500 text-white",
    D: "bg-orange-500 text-white",
    E: "bg-red-500 text-white",
  };
  return classColors[classType] || "bg-gray-500 text-white";
};

// Format sport name for display
const formatSport = (sport: string | null): string => {
  if (!sport) return "No Sport";
  return sport
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export function AthleteHeader({
  athlete,
  evaluation,
  className,
}: AthleteHeaderProps) {
  // Generate display name
  const displayName =
    athlete.firstName || athlete.lastName
      ? `${athlete.firstName ?? ""} ${athlete.lastName ?? ""}`.trim()
      : athlete.username ?? "Unknown Athlete";

  // Generate initials for avatar fallback
  const initials =
    athlete.firstName && athlete.lastName
      ? `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase()
      : athlete.username
      ? athlete.username.slice(0, 2).toUpperCase()
      : "??";

  // Format location
  const location = [athlete.city, athlete.state, athlete.country]
    .filter(Boolean)
    .join(", ");

  // Format evaluation date
  const evaluationDate = evaluation.scheduledDate
    ? format(new Date(evaluation.scheduledDate), "MMM dd, yyyy")
    : format(new Date(evaluation.evaluationDate), "MMM dd, yyyy");

  return (
    <Card className={cn("border-none shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Section - Profile */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <Avatar className="h-20 w-20 border-4 border-primary/10 ring-2 ring-primary/5 sm:h-24 sm:w-24">
              <AvatarImage
                src={athlete.profileImage || undefined}
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary sm:text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name and Details */}
            <div className="flex flex-col gap-2">
              {/* Name and Username */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {displayName}
                </h2>
                {athlete.username && (
                  <p className="text-sm text-muted-foreground">
                    @{athlete.username}
                  </p>
                )}
              </div>

              {/* Rank and Class Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold",
                    getRankColor(athlete.rank)
                  )}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  {athlete.rank}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold",
                    getClassColor(athlete.class)
                  )}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Class {athlete.class}
                </Badge>
              </div>

              {/* Sport and Location */}
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                {athlete.primarySport && (
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="h-4 w-4 text-primary/70" />
                    <span className="font-medium">
                      {formatSport(athlete.primarySport)}
                    </span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Evaluation Info */}
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 lg:min-w-[280px]">
            <h3 className="text-sm font-semibold text-foreground">
              Evaluation Details
            </h3>

            {/* Evaluation Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary/70" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Scheduled Date
                </span>
                <span className="font-medium text-foreground">
                  {evaluationDate}
                </span>
              </div>
            </div>

            {/* OTP Verification Status */}
            <div className="flex items-center gap-2">
              {evaluation.otpVerified ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      OTP Verified
                    </span>
                    {evaluation.otpVerifiedAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(evaluation.otpVerifiedAt),
                          "MMM dd, hh:mm a"
                        )}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                    <CheckCircle2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      Pending Verification
                    </span>
                    <span className="text-xs text-muted-foreground">
                      OTP not yet verified
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Scheduled Time (if available) */}
            {evaluation.scheduledTime && (
              <div className="mt-1 rounded-md bg-primary/5 px-3 py-2">
                <p className="text-xs text-muted-foreground">Scheduled Time</p>
                <p className="text-sm font-semibold text-primary">
                  {evaluation.scheduledTime}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Age Badge (if available) */}
        {athlete.age && (
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Age: {athlete.age} years
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
