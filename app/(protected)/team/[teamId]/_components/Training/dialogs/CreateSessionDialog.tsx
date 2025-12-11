"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { createTrainingSession } from "@/app/(protected)/team/actions/training/trainingSessionActions";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import { DAY_NAMES } from "@/types/Training/types/training";
import { toast } from "sonner";

interface CreateSessionDialogProps {
  teamId: string;
}

interface FormData {
  title: string;
  description: string;
  dayOfWeek: number;
  timeOfDay?: "MORNING" | "AFTERNOON" | "EVENING";
  durationMinutes?: number;
  location?: string;
}

export default function CreateSessionDialog({
  teamId,
}: CreateSessionDialogProps) {
  const queryClient = useQueryClient();
  const { isCreateSessionOpen, closeCreateSession, selectedWeek, activePlan } =
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
      dayOfWeek: 0, // Will be set to today automatically
      timeOfDay: undefined,
      durationMinutes: undefined,
      location: "",
    },
  });

  const dayOfWeek = watch("dayOfWeek");
  const timeOfDay = watch("timeOfDay");

  // ✅ AUTO-SET DAY TO TODAY when dialog opens
  useEffect(() => {
    if (isCreateSessionOpen) {
      const today = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      setValue("dayOfWeek", today);
    }
  }, [isCreateSessionOpen, setValue]);

  // Get the weekId for the selected week
  const weekId = useMemo(() => {
    if (!activePlan || !selectedWeek) return null;
    const week = activePlan.weeks.find((w) => w.weekNumber === selectedWeek);
    return week?.id || null;
  }, [activePlan, selectedWeek]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!weekId) throw new Error("Week not found");

      return await createTrainingSession({
        weekId,
        dayOfWeek: data.dayOfWeek,
        timeOfDay: data.timeOfDay,
        title: data.title,
        description: data.description || undefined,
        durationMinutes: data.durationMinutes || undefined,
        location: data.location || undefined,
        equipment: [],
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        toast("Training session created!");
        setError(null);
        reset();
        closeCreateSession();
        // Refetch the training plan
        queryClient.invalidateQueries({ queryKey: ["training-plan", teamId] });
      } else {
        setError(response.error || "Failed to create training session");
      }
    },
    onError: (err) => {
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
      closeCreateSession();
    }
  }, [createMutation.isPending, reset, closeCreateSession]);

  if (!weekId) return null;

  return (
    <Dialog open={isCreateSessionOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Training Session</DialogTitle>
          <DialogDescription>
            Add a new training session to Week {selectedWeek}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Session Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
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
              disabled={createMutation.isPending}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the session goals and focus..."
              rows={3}
              {...register("description")}
              disabled={createMutation.isPending}
            />
          </div>

          {/* Day of Week */}
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">
              Day <span className="text-red-500">*</span>
            </Label>
            <Select
              value={String(dayOfWeek)}
              onValueChange={(value) => setValue("dayOfWeek", parseInt(value))}
              disabled={createMutation.isPending}
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
            <Label htmlFor="timeOfDay">Time of Day</Label>
            <Select
              value={timeOfDay || ""}
              onValueChange={(value) =>
                setValue(
                  "timeOfDay",
                  value as "MORNING" | "AFTERNOON" | "EVENING"
                )
              }
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                <SelectItem value="EVENING">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                min={1}
                placeholder="60"
                {...register("durationMinutes", { valueAsNumber: true })}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Gym, Field, etc."
                {...register("location")}
                disabled={createMutation.isPending}
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
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
