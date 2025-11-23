// app/(guide)/dashboard/components/GuideScheduleDialog.tsx
"use client";

import { useState, useTransition, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { updateGuideEvaluationRequestStatusAction } from "../EvaluationAction/guideEvaluationRequests";

const scheduleSchema = z.object({
  messageFromGuide: z.string().trim().optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required."),
  scheduledTime: z.string().min(1, "Scheduled time is required."),
  equipmentRaw: z
    .string()
    .optional()
    .transform((val) => val ?? ""),
  location: z.string().min(1, "Location / address is required."),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

type GuideScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string | null;
};

export function GuideScheduleDialog({
  open,
  onOpenChange,
  requestId,
}: GuideScheduleDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<any>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      messageFromGuide: "",
      scheduledDate: "",
      scheduledTime: "",
      equipmentRaw: "",
      location: "",
    },
  });

  const handleClose = useCallback(() => {
    if (isPending) return;
    onOpenChange(false);
    form.reset();
    setFormError(null);
  }, [form, isPending, onOpenChange]);

  const onSubmit = useCallback(
    (values: ScheduleFormValues) => {
      if (!requestId) {
        toast.error("Request not found.", {
          description: "No evaluation request selected.",
        });
        return;
      }

      setFormError(null);

      startTransition(async () => {
        try {
          const res = await updateGuideEvaluationRequestStatusAction({
            requestId,
            action: "ACCEPT",
            messageFromGuide: values.messageFromGuide ?? null,
            scheduledDate: values.scheduledDate,
            scheduledTime: values.scheduledTime,
            equipmentRaw: values.equipmentRaw,
            location: values.location,
          });

          if (!res.success) {
            console.error("[GuideScheduleDialog] ACCEPT failed", res);
            setFormError(
              process.env.NODE_ENV === "development" && res.traceId
                ? `${res.message} (trace: ${res.traceId})`
                : res.message
            );
            toast.error("Failed to accept evaluation request.", {
              description: res.message,
            });
            return;
          }

          await queryClient.invalidateQueries({
            queryKey: ["guide-evaluation-requests"],
          });
          await queryClient.invalidateQueries({
            queryKey: ["my-evaluation-requests"],
          });

          toast.success("Evaluation scheduled", {
            description: "The athlete has been notified with schedule and OTP.",
          });
          handleClose();
        } catch (error) {
          console.error(
            "[GuideScheduleDialog] Unexpected error on ACCEPT",
            error
          );
          const msg =
            process.env.NODE_ENV === "development"
              ? String(error)
              : "Unexpected error while accepting request.";
          setFormError(msg);
          toast.error("Failed to accept evaluation request.", {
            description: msg,
          });
        }
      });
    },
    [handleClose, queryClient, requestId]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule physical evaluation</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="messageFromGuide"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to athlete (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Any special instructions or notes for the athlete."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="equipmentRaw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment list</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Comma-separated, e.g. Football, Water bottle, Training shoes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location / address</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Exact location where evaluation will happen."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && <p className="text-xs text-red-500">{formError}</p>}

            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Scheduling..." : "Confirm schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
