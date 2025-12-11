"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Trash2, X } from "lucide-react";
import {
  deleteTrainingSession,
  deleteExercise,
} from "@/app/(protected)/team/actions/training/trainingSessionActions";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteSessionDialogProps {
  sessionId: string;
  sessionTitle: string;
}

interface DeleteExerciseDialogProps {
  exerciseId: string;
  exerciseName: string;
}

export function DeleteSessionDialog({
  sessionId,
  sessionTitle,
}: DeleteSessionDialogProps) {
  const queryClient = useQueryClient();
  const { closeDeleteSession, isDeleteSessionOpen } = useTrainingStore();
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => deleteTrainingSession(sessionId),
    onSuccess: () => {
      toast.success("Session deleted successfully!");
      setError(null);
      closeDeleteSession();
      queryClient.invalidateQueries({ queryKey: ["training-plan"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to delete session");
    },
  });

  const handleDelete = useCallback(() => {
    deleteMutation.mutate();
  }, [deleteMutation]);

  const handleClose = useCallback(() => {
    if (!deleteMutation.isPending) {
      setError(null);
      closeDeleteSession();
    }
  }, [deleteMutation.isPending, closeDeleteSession]);

  return (
    <Dialog open={isDeleteSessionOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Delete Session
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will delete the entire session
            including all exercises and footage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900">"{sessionTitle}"</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Session
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteExerciseDialog({
  exerciseId,
  exerciseName,
}: DeleteExerciseDialogProps) {
  const queryClient = useQueryClient();
  const { closeDeleteExercise, isDeleteExerciseOpen } = useTrainingStore();
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => deleteExercise(exerciseId),
    onSuccess: () => {
      toast.success("Exercise deleted successfully!");
      setError(null);
      closeDeleteExercise();
      queryClient.invalidateQueries({ queryKey: ["training-plan"] });
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "Failed to delete exercise"
      );
    },
  });

  const handleDelete = useCallback(() => {
    deleteMutation.mutate();
  }, [deleteMutation]);

  const handleClose = useCallback(() => {
    if (!deleteMutation.isPending) {
      setError(null);
      closeDeleteExercise();
    }
  }, [deleteMutation.isPending, closeDeleteExercise]);

  return (
    <Dialog open={isDeleteExerciseOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Delete Exercise
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will delete the exercise from the
            session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900">"{exerciseName}"</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Exercise
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
