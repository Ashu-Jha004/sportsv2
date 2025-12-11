"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { createExercise } from "@/app/(protected)/team/actions/training/trainingSessionActions";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import { toast } from "sonner";

interface CreateExerciseDialogProps {
  sessionId: string;
}

interface FormData {
  name: string;
  category?: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restPeriod?: number;
  tempo?: string;
  weight?: string;
  intensity?: string;
  notes?: string;
  videoUrl?: string;
}

export default function CreateExerciseDialog({
  sessionId,
}: CreateExerciseDialogProps) {
  const queryClient = useQueryClient();
  const { isCreateExerciseOpen, closeCreateExercise, activeSession } =
    useTrainingStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control, // ✅ ADD THIS
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      category: "",
      sets: undefined,
      reps: undefined,
      duration: undefined,
      restPeriod: undefined,
      tempo: "",
      weight: "",
      intensity: "",
      notes: "",
      videoUrl: "",
    },
  });

  // Watch select fields
  const category = watch("category");
  const intensity = watch("intensity");

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await createExercise({
        sessionId,
        name: data.name,
        category: data.category as any,
        sets: data.sets,
        reps: data.reps,
        duration: data.duration,
        restPeriod: data.restPeriod,
        tempo: data.tempo,
        weight: data.weight,
        intensity: data.intensity as any,
        notes: data.notes,
        videoUrl: data.videoUrl,
        orderIndex: 0, // Server auto-calculates
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        toast("Exercise created successfully!");
        setError(null);
        reset();
        closeCreateExercise();
        // Invalidate training plan queries
        queryClient.invalidateQueries({ queryKey: ["training-plan"] });
        queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
      } else {
        setError(response.error || "Failed to create exercise");
      }
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "Failed to create exercise"
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
      closeCreateExercise();
    }
  }, [createMutation.isPending, reset, closeCreateExercise]);

  return (
    <Dialog open={isCreateExerciseOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>
            Add a new exercise to{" "}
            <strong>"{activeSession?.title || "this session"}"</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Exercise Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Exercise Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Bench Press, Squats, 400m Sprint"
              {...register("name", {
                required: "Exercise name is required",
                minLength: { value: 2, message: "At least 2 characters" },
              })}
              className={errors.name ? "border-red-500" : ""}
              disabled={createMutation.isPending}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category || ""}
              onValueChange={(value) => setValue("category", value)}
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRENGTH">Strength</SelectItem>
                <SelectItem value="POWER">Power</SelectItem>
                <SelectItem value="CARDIO">Cardio</SelectItem>
                <SelectItem value="FLEXIBILITY">Flexibility</SelectItem>
                <SelectItem value="SKILLS">Skills</SelectItem>
                <SelectItem value="RECOVERY">Recovery</SelectItem>
                <SelectItem value="WARM_UP">Warm Up</SelectItem>
                <SelectItem value="COOL_DOWN">Cool Down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sets & Reps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                min={1}
                max={20}
                {...register("sets", { valueAsNumber: true })}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                min={1}
                max={50}
                {...register("reps", { valueAsNumber: true })}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          {/* Prescription Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight/Load</Label>
              <Input
                id="weight"
                placeholder="70% 1RM, 135lbs, Bodyweight"
                {...register("weight")}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restPeriod">Rest (sec)</Label>
              <Input
                id="restPeriod"
                type="number"
                min={10}
                max={300}
                {...register("restPeriod", { valueAsNumber: true })}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          {/* Advanced Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tempo">Tempo</Label>
              <Input
                id="tempo"
                placeholder="3-0-1-0"
                {...register("tempo")}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (sec)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={600}
                {...register("duration", { valueAsNumber: true })}
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <Label htmlFor="intensity">Intensity</Label>
            <Select
              value={intensity || ""}
              onValueChange={(value) => setValue("intensity", value)}
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select intensity (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERY_LOW">Very Low</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MODERATE">Moderate</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="VERY_HIGH">Very High</SelectItem>
                <SelectItem value="MAX_EFFORT">Max Effort</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes & Video */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Coach notes, technique cues..."
              rows={2}
              {...register("notes")}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Demo Video URL (optional)</Label>
            <Input
              id="videoUrl"
              placeholder="https://youtube.com/watch?v=..."
              {...register("videoUrl")}
              disabled={createMutation.isPending}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
