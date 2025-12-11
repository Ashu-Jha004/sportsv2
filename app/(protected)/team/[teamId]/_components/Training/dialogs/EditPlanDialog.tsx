"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { updateTrainingPlan } from "@/app/(protected)/team/actions/training/trainingPlanActions";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import { toast } from "sonner";

interface FormData {
  name: string;
  description: string;
  goal: string;
}

export default function EditPlanDialog() {
  const { activePlan, isEditPlanOpen, closeEditPlan } = useTrainingStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      goal: "",
    },
  });

  const goalValue = watch("goal");

  // Populate form when plan changes
  useEffect(() => {
    if (activePlan) {
      reset({
        name: activePlan.name,
        description: activePlan.description || "",
        goal: activePlan.goal || "",
      });
    }
  }, [activePlan, reset]);

  // Update plan mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!activePlan) throw new Error("No active plan");

      console.log("[EditPlanDialog] Updating plan:", activePlan.id, data);

      return await updateTrainingPlan(activePlan.id, {
        name: data.name,
        description: data.description || undefined,
        goal: data.goal || undefined,
        teamId: activePlan.teamId,
        totalWeeks: activePlan.totalWeeks,
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        console.log("[EditPlanDialog] Plan updated successfully");
        toast("Plan updated!");
        setError(null);
        closeEditPlan();
        // Plan will be refetched automatically by React Query
      } else {
        console.error(
          "[EditPlanDialog] Failed to update plan:",
          response.error
        );
        setError(response.error || "Failed to update training plan");
      }
    },
    onError: (err) => {
      console.error("[EditPlanDialog] Mutation error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    },
  });

  const onSubmit = useCallback(
    (data: FormData) => {
      setError(null);
      updateMutation.mutate(data);
    },
    [updateMutation]
  );

  const handleClose = useCallback(() => {
    if (!updateMutation.isPending) {
      setError(null);
      closeEditPlan();
    }
  }, [updateMutation.isPending, closeEditPlan]);

  if (!activePlan) return null;

  return (
    <Dialog open={isEditPlanOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Training Plan</DialogTitle>
          <DialogDescription>
            Update the details of your training plan. Changes will be saved
            immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-medium">
              Plan Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="e.g., Pre-Season Strength Program"
              {...register("name", {
                required: "Plan name is required",
                minLength: {
                  value: 3,
                  message: "Plan name must be at least 3 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Plan name must be less than 100 characters",
                },
              })}
              className={errors.name ? "border-red-500" : ""}
              disabled={updateMutation.isPending}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Describe the goals and focus of this training plan..."
              rows={3}
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must be less than 500 characters",
                },
              })}
              className={errors.description ? "border-red-500" : ""}
              disabled={updateMutation.isPending}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="edit-goal" className="text-sm font-medium">
              Training Goal
            </Label>
            <Select
              value={goalValue}
              onValueChange={(value) => setValue("goal", value)}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a goal (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Strength">Strength</SelectItem>
                <SelectItem value="Conditioning">Conditioning</SelectItem>
                <SelectItem value="Skills">Skills</SelectItem>
                <SelectItem value="Speed">Speed</SelectItem>
                <SelectItem value="Endurance">Endurance</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              To change the plan duration, you'll need to create a new plan.
            </AlertDescription>
          </Alert>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{error}</AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
