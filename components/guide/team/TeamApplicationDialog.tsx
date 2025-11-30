// components/team/TeamApplicationDialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useGuideTeamApplications,
  GuideTeamApplication,
} from "../../../app/(business)/business/features/guide/hooks/useGuideTeamApplications";
import TeamApplicationList from "./TeamApplicationList";
import TeamApplicationDetail from "./TeamApplicationDetail";
import { Button } from "@/components/ui/button";

export default function TeamApplicationDialog() {
  const [open, setOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<GuideTeamApplication | null>(
    null
  );

  const { data, isLoading, error } = useGuideTeamApplications();

  const onSelect = (app: GuideTeamApplication) => {
    setSelectedApp(app);
  };

  const onClose = () => {
    setSelectedApp(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="justify-start">
          Initiate team application update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Review Team Applications</DialogTitle>
        </DialogHeader>

        {!selectedApp && (
          <>
            {isLoading && <p>Loading applications...</p>}
            {error && (
              <p>
                Error loading:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            )}
            {data && data.applications.length === 0 && (
              <p>No pending applications.</p>
            )}
            {data && data.applications.length > 0 && (
              <TeamApplicationList
                applications={data.applications}
                onSelect={onSelect}
              />
            )}
          </>
        )}

        {selectedApp && (
          <TeamApplicationDetail application={selectedApp} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
