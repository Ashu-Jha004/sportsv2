"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Video, Calendar, List } from "lucide-react";
import { useTrainingStore } from "@/stores/team/training/trainingStore";

interface QuickActionsProps {
  teamId: string;
  planId: string;
  currentWeek: number;
}

export default function QuickActions({
  teamId,
  planId,
  currentWeek,
}: QuickActionsProps) {
  const { openCreateSession, openUploadFootage, setViewMode } =
    useTrainingStore();

  const actions = [
    {
      label: "Add Session",
      description: "Create new training session",
      icon: Plus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      onClick: () => openCreateSession(currentWeek),
    },
    {
      label: "Upload Footage",
      description: "Share training video",
      icon: Video,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      onClick: openUploadFootage,
    },
    {
      label: "View Calendar",
      description: "See full schedule",
      icon: Calendar,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      hoverColor: "hover:bg-emerald-100",
      onClick: () => setViewMode("calendar"),
    },
    {
      label: "All Sessions",
      description: "List view",
      icon: List,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      onClick: () => setViewMode("list"),
    },
  ];

  return (
    <Card className="border-slate-200">
      <CardContent className="pt-6 pb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                onClick={action.onClick}
                className={`h-auto flex flex-col items-center gap-2 p-4 ${action.bgColor} border-slate-200 ${action.hoverColor} transition-colors`}
              >
                <div className={`${action.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-900 text-sm">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
