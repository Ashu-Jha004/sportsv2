"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Dumbbell, Video, Plus } from "lucide-react";
import CreatePlanDialog from "./dialogs/CreatePlanDialog";

interface EmptyTrainingStateProps {
  teamId: string;
  onPlanCreated: () => void;
}

export default function EmptyTrainingState({
  teamId,
  onPlanCreated,
}: EmptyTrainingStateProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOpenDialog = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  const handlePlanCreated = useCallback(() => {
    setIsCreateDialogOpen(false);
    onPlanCreated();
  }, [onPlanCreated]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6">
                <Dumbbell className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">
              Start Your Training Journey
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Create a structured training plan to help your team achieve their
              goals. Track progress, share footage, and stay organized.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card className="border-slate-200 hover:border-blue-300 transition-colors">
              <CardContent className="pt-6 pb-6 space-y-2">
                <div className="flex justify-center">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Weekly Plans</h3>
                <p className="text-sm text-slate-600">
                  Organize training sessions across multiple weeks
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:border-purple-300 transition-colors">
              <CardContent className="pt-6 pb-6 space-y-2">
                <div className="flex justify-center">
                  <Dumbbell className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900">
                  Exercise Library
                </h3>
                <p className="text-sm text-slate-600">
                  Add detailed exercises with sets, reps, and notes
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:border-emerald-300 transition-colors">
              <CardContent className="pt-6 pb-6 space-y-2">
                <div className="flex justify-center">
                  <Video className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Video Footage</h3>
                <p className="text-sm text-slate-600">
                  Upload and share training footage with the team
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Button */}
          <div>
            <Button
              size="lg"
              onClick={handleOpenDialog}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Training Plan
            </Button>
          </div>

          {/* Help text */}
          <p className="text-sm text-slate-500">
            Team captains and owners can create and manage training plans
          </p>
        </div>
      </div>

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseDialog}
        teamId={teamId}
        onSuccess={handlePlanCreated}
      />
    </>
  );
}
