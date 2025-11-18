// components/profile/about/PersonalInfoCard.tsx

"use client";

import { ProfileData } from "../../../types/profile.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Calendar, UserCircle, Clock, AtSign } from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";

interface PersonalInfoCardProps {
  profile: ProfileData;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="shrink-0 mt-0.5 text-slate-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-base font-semibold text-slate-900 wrap-break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

export function PersonalInfoCard({ profile }: PersonalInfoCardProps) {
  const { personalInfo } = profile;

  // Calculate age from date of birth
  const age = differenceInYears(new Date(), parseISO(personalInfo.dateOfBirth));

  // Format dates
  const formattedDOB = format(
    parseISO(personalInfo.dateOfBirth),
    "MMMM dd, yyyy"
  );
  const formattedJoinDate = format(
    parseISO(personalInfo.joinedDate),
    "MMMM dd, yyyy"
  );
  const formattedLastUpdate = format(
    parseISO(personalInfo.lastUpdated),
    "MMMM dd, yyyy"
  );

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-blue-600" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <InfoRow
          icon={<User className="w-5 h-5" />}
          label="Full Name"
          value={personalInfo.fullName}
        />

        <InfoRow
          icon={<AtSign className="w-5 h-5" />}
          label="Username"
          value={`@${personalInfo.username}`}
        />

        <InfoRow
          icon={<Mail className="w-5 h-5" />}
          label="Email"
          value={personalInfo.email}
        />

        <InfoRow
          icon={<User className="w-5 h-5" />}
          label="Gender"
          value={personalInfo.gender}
        />

        <InfoRow
          icon={<Calendar className="w-5 h-5" />}
          label="Date of Birth"
          value={`${formattedDOB} (${age} years old)`}
        />

        <InfoRow
          icon={<Calendar className="w-5 h-5" />}
          label="Joined Sparta"
          value={formattedJoinDate}
        />

        <InfoRow
          icon={<Clock className="w-5 h-5" />}
          label="Last Updated"
          value={formattedLastUpdate}
        />
      </CardContent>
    </Card>
  );
}
