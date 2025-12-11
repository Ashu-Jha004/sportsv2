"use client";

import { useState, useCallback, useMemo } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  AlertCircle,
  Upload,
  Calendar as CalendarIcon,
  CheckCircle2,
} from "lucide-react";
import { uploadTrainingFootage } from "@/app/(protected)/team/actions/training/trainingFootageActions";
import { CreateTrainingFootageInput } from "@/types/Training/types/training";
import { useTrainingStore } from "@/stores/team/training/trainingStore";
import { isValidYouTubeUrl } from "@/lib/utils/trainingHelpers";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadFootageDialogProps {
  teamId: string;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  youtubeUrl: string;
  recordedDate: Date;
}

export default function UploadFootageDialog({
  teamId,
  onSuccess,
}: UploadFootageDialogProps) {
  const { isUploadFootageOpen, closeUploadFootage, activePlan } =
    useTrainingStore();
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      youtubeUrl: "",
      recordedDate: new Date(),
    },
  });

  const youtubeUrl = watch("youtubeUrl");

  // Validate YouTube URL in real-time
  const urlValidation = useMemo(() => {
    if (!youtubeUrl || youtubeUrl.trim().length === 0) return null;
    return isValidYouTubeUrl(youtubeUrl)
      ? { valid: true, message: "Valid YouTube URL ✓" }
      : { valid: false, message: "Invalid YouTube URL format" };
  }, [youtubeUrl]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("[UploadFootageDialog] Uploading footage:", data);

      const input: CreateTrainingFootageInput = {
        teamId,
        planId: activePlan?.id,
        title: data.title,
        description: data.description || undefined,
        youtubeUrl: data.youtubeUrl,
        recordedDate: selectedDate,
      };

      return await uploadTrainingFootage(input);
    },
    onSuccess: (response) => {
      if (response.success) {
        console.log(
          "[UploadFootageDialog] Footage uploaded successfully:",
          response.data
        );
        toast("Footage uploaded!");
        reset();
        setSelectedDate(new Date());
        setError(null);
        onSuccess();
        closeUploadFootage();
      } else {
        console.error(
          "[UploadFootageDialog] Failed to upload footage:",
          response.error
        );
        setError(response.error || "Failed to upload footage");
      }
    },
    onError: (err) => {
      console.error("[UploadFootageDialog] Mutation error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    },
  });

  const onSubmit = useCallback(
    (data: FormData) => {
      setError(null);

      // Final validation
      if (!isValidYouTubeUrl(data.youtubeUrl)) {
        setError("Please enter a valid YouTube URL");
        return;
      }

      uploadMutation.mutate(data);
    },
    [uploadMutation]
  );

  const handleClose = useCallback(() => {
    if (!uploadMutation.isPending) {
      reset();
      setSelectedDate(new Date());
      setError(null);
      closeUploadFootage();
    }
  }, [uploadMutation.isPending, reset, closeUploadFootage]);

  return (
    <Dialog open={isUploadFootageOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Upload Training Footage
          </DialogTitle>
          <DialogDescription>
            Share training videos with your team by uploading YouTube links.
            Make sure the video is set to public or unlisted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* YouTube URL */}
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl" className="text-sm font-medium">
              YouTube URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="youtubeUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              {...register("youtubeUrl", {
                required: "YouTube URL is required",
                validate: (value) =>
                  isValidYouTubeUrl(value) ||
                  "Please enter a valid YouTube URL",
              })}
              className={
                errors.youtubeUrl || (urlValidation && !urlValidation.valid)
                  ? "border-red-500"
                  : urlValidation?.valid
                  ? "border-emerald-500"
                  : ""
              }
              disabled={uploadMutation.isPending}
            />
            {errors.youtubeUrl && (
              <p className="text-sm text-red-500">
                {errors.youtubeUrl.message}
              </p>
            )}
            {urlValidation && !errors.youtubeUrl && (
              <p
                className={`text-sm flex items-center gap-1 ${
                  urlValidation.valid ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {urlValidation.valid && (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {urlValidation.message}
              </p>
            )}
            <p className="text-xs text-slate-500">
              Supported formats: youtube.com/watch?v=..., youtu.be/...
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Morning Practice Session - Conditioning Drills"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
                maxLength: {
                  value: 200,
                  message: "Title must be less than 200 characters",
                },
              })}
              className={errors.title ? "border-red-500" : ""}
              disabled={uploadMutation.isPending}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add details about this training footage..."
              rows={4}
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message: "Description must be less than 1000 characters",
                },
              })}
              className={errors.description ? "border-red-500" : ""}
              disabled={uploadMutation.isPending}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Recorded Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Recorded Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-slate-500"
                  )}
                  disabled={uploadMutation.isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-slate-500">
              Select when this footage was recorded
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2 text-xs">
              <strong>Note:</strong> This will be linked to the current active
              training plan if one exists. Make sure your YouTube video is set
              to public or unlisted.
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
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                uploadMutation.isPending ||
                (urlValidation ? !urlValidation.valid : true)
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Footage
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
