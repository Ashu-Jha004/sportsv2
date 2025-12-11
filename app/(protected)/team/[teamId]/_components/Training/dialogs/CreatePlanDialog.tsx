"use client";

import { useState, useCallback } from "react";
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
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createTrainingPlan } from "@/app/(protected)/team/actions/training/trainingPlanActions";
import { CreateTrainingPlanInput } from "@/types/Training/types/training";
import { toast } from "sonner";

interface CreatePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  goal: string;
  totalWeeks: number;
}

export default function CreatePlanDialog({
  isOpen,
  onClose,
  teamId,
  onSuccess,
}: CreatePlanDialogProps) {
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
      totalWeeks: 4,
    },
  });

  const goalValue = watch("goal");

  // Create plan mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("[CreatePlanDialog] Creating plan with data:", data);

      const input: CreateTrainingPlanInput = {
        teamId,
        name: data.name,
        description: data.description || undefined,
        goal: data.goal || undefined,
        totalWeeks: data.totalWeeks,
      };

      return await createTrainingPlan(input);
    },
    onSuccess: (response) => {
      if (response.success) {
        console.log(
          "[CreatePlanDialog] Plan created successfully:",
          response.data
        );
        toast("Training plan created!");
        reset();
        setError(null);
        onSuccess();
        onClose();
      } else {
        console.error(
          "[CreatePlanDialog] Failed to create plan:",
          response.error
        );
        setError(response.error || "Failed to create training plan");
      }
    },
    onError: (err) => {
      console.error("[CreatePlanDialog] Mutation error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    },
  });

  const onSubmit = useCallback(
    (data: FormData) => {
      setError(null);
      createMutation.mutate(data);
    },
    [createMutation]
  );

  const handleClose = useCallback(() => {
    if (!createMutation.isPending) {
      reset();
      setError(null);
      onClose();
    }
  }, [createMutation.isPending, reset, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Training Plan</DialogTitle>
          <DialogDescription>
            Set up a new training plan for your team. You can add sessions and
            exercises after creating the plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Plan Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
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
              disabled={createMutation.isPending}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the goals and focus of this training plan..."
              rows={3}
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must be less than 500 characters",
                },
              })}
              className={errors.description ? "border-red-500" : ""}
              disabled={createMutation.isPending}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-sm font-medium">
              Training Goal
            </Label>
            <Select
              value={goalValue}
              onValueChange={(value) => setValue("goal", value)}
              disabled={createMutation.isPending}
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

          {/* Total Weeks */}
          <div className="space-y-2">
            <Label htmlFor="totalWeeks" className="text-sm font-medium">
              Duration (Weeks) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="totalWeeks"
              type="number"
              min={1}
              max={52}
              {...register("totalWeeks", {
                required: "Duration is required",
                min: {
                  value: 1,
                  message: "Plan must be at least 1 week",
                },
                max: {
                  value: 52,
                  message: "Plan cannot exceed 52 weeks",
                },
                valueAsNumber: true,
              })}
              className={errors.totalWeeks ? "border-red-500" : ""}
              disabled={createMutation.isPending}
            />
            {errors.totalWeeks && (
              <p className="text-sm text-red-500">
                {errors.totalWeeks.message}
              </p>
            )}
            <p className="text-xs text-slate-500">
              Number of weeks in this training plan (1-52)
            </p>
          </div>

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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
