"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { updateTrainingSession } from "@/app/(protected)/team/actions/training/trainingSessionActions";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import { DAY_NAMES } from "@/types/Training/types/training";
import { toast } from "sonner";

interface FormData {
  title: string;
  description: string;
  dayOfWeek: number;
  timeOfDay?: "EARLY_MORNING" | "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  durationMinutes?: number;
  location?: string;
}

export default function EditSessionDialog() {
  const queryClient = useQueryClient();
  const { isEditSessionOpen, closeEditSession, activeSession } =
    useTrainingStore();
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
      title: "",
      description: "",
      dayOfWeek: 0,
      timeOfDay: undefined,
      durationMinutes: undefined,
      location: "",
    },
  });

  const dayOfWeek = watch("dayOfWeek");
  const timeOfDay = watch("timeOfDay");

  // Populate form when session changes
  useEffect(() => {
    if (activeSession && isEditSessionOpen) {
      reset({
        title: activeSession.title,
        description: activeSession.description || "",
        dayOfWeek: activeSession.dayOfWeek,
        timeOfDay: activeSession.timeOfDay as any,
        durationMinutes: activeSession.durationMinutes || undefined,
        location: activeSession.location || "",
      });
    }
  }, [activeSession, isEditSessionOpen, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!activeSession) throw new Error("No active session");

      return await updateTrainingSession(activeSession.id, {
        title: data.title,
        description: data.description || undefined,
        dayOfWeek: data.dayOfWeek,
        timeOfDay: data.timeOfDay,
        durationMinutes: data.durationMinutes,
        location: data.location || undefined,
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        toast("Session updated successfully!");
        setError(null);
        reset();
        closeEditSession();
        queryClient.invalidateQueries({ queryKey: ["training-plan"] });
      } else {
        setError(response.error || "Failed to update session");
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to update session");
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
      reset();
      setError(null);
      closeEditSession();
    }
  }, [updateMutation.isPending, reset, closeEditSession]);

  if (!activeSession) return null;

  return (
    <Dialog open={isEditSessionOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Training Session</DialogTitle>
          <DialogDescription>
            Update session details. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">
              Session Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-title"
              placeholder="e.g., Upper Body Strength"
              {...register("title", {
                required: "Session title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Title must be less than 100 characters",
                },
              })}
              className={errors.title ? "border-red-500" : ""}
              disabled={updateMutation.isPending}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe the session goals and focus..."
              rows={3}
              {...register("description")}
              disabled={updateMutation.isPending}
            />
          </div>

          {/* Day of Week */}
          <div className="space-y-2">
            <Label htmlFor="edit-dayOfWeek">
              Day <span className="text-red-500">*</span>
            </Label>
            <Select
              value={String(dayOfWeek)}
              onValueChange={(value) => setValue("dayOfWeek", parseInt(value))}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DAY_NAMES).map(([day, name]) => (
                  <SelectItem key={day} value={day}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time of Day */}
          <div className="space-y-2">
            <Label htmlFor="edit-timeOfDay">Time of Day</Label>
            <Select
              value={timeOfDay || ""}
              onValueChange={(value) => setValue("timeOfDay", value as any)}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EARLY_MORNING">Early Morning</SelectItem>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                <SelectItem value="EVENING">Evening</SelectItem>
                <SelectItem value="NIGHT">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-durationMinutes">Duration (minutes)</Label>
              <Input
                id="edit-durationMinutes"
                type="number"
                min={1}
                placeholder="60"
                {...register("durationMinutes", { valueAsNumber: true })}
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="Gym, Field, etc."
                {...register("location")}
                disabled={updateMutation.isPending}
              />
            </div>
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
