import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // shadcn components

import { Badge } from "@/components/ui/badge";
import { useAthlete } from "../hooks/use-athlete";

const BANNER_URL =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.4&auto=format&fit=crop&w=1600&q=80"; // static URL
interface Athlete {
  id: string | undefined;
  username?: string | undefined;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  fullName: string | undefined;
  profileImage?: string | undefined | undefined;
  dateOfBirth: string | undefined;
  gender: string | undefined;
  bio: string | undefined;
  primarySport: string | undefined;
  secondarySport: string | undefined;
  rank: string | undefined;
  class: string | undefined;
  roles: string | undefined[];
  location: Location;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  isOwnProfile?: boolean;
}
export default function AthleteHeader({
  athlete,
}: {
  athlete: any;
  isOwnProfile: boolean;
}) {
  return (
    <div className="relative">
      {/* Banner Image */}
      <div
        className="h-48 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${BANNER_URL})` }}
      />
    </div>
  );
}
