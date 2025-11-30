// components/team/TeamApplicationList.tsx
"use client";

import { GuideTeamApplication } from "../../../app/(business)/business/features/guide/hooks/useGuideTeamApplications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  applications: GuideTeamApplication[];
  onSelect: (app: GuideTeamApplication) => void;
}

export default function TeamApplicationList({ applications, onSelect }: any) {
  return (
    <div className="space-y-3">
      {applications.map((app: any) => (
        <Card
          key={app.id}
          className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary/50 p-1"
          onClick={() => onSelect(app)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={app.logoUrl || undefined} />
                  <AvatarFallback>
                    {app.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg leading-tight">
                    {app.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary">{app.sport}</Badge>
                    <Badge variant="outline">{app.rank}</Badge>
                    {app.class && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {app.class}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <Badge variant="destructive">PENDING</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {app.applicant.city ||
                  app.applicant.country ||
                  "Location not set"}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
