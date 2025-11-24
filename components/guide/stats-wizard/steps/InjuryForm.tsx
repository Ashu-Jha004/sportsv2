"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import type { InjuryRecord } from "@/types/stats/athlete-stats.types";

const injurySchema = z
  .object({
    type: z.string().min(1, "Injury type is required"),
    bodyPart: z.string().min(1, "Body part is required"),
    severity: z.enum(["minor", "moderate", "severe", "critical"]),
    occurredAt: z.date({ error: "Occurrence date is required" }),
    currentStatus: z.enum(["active", "recovering", "recovered"]),
    expectedRecoveryDate: z.date().optional(),
    recoveredAt: z.date().optional(),
    notes: z.string().optional(),
    treatmentPlan: z.string().optional(),
  })
  .refine(
    (data) => {
      // If status is active, expectedRecoveryDate should be provided
      if (data.currentStatus === "active" && !data.expectedRecoveryDate) {
        return false;
      }
      return true;
    },
    {
      message: "Expected recovery date is required for active injuries",
      path: ["expectedRecoveryDate"],
    }
  )
  .refine(
    (data) => {
      // If status is recovered, recoveredAt should be provided
      if (data.currentStatus === "recovered" && !data.recoveredAt) {
        return false;
      }
      return true;
    },
    {
      message: "Recovery date is required for recovered injuries",
      path: ["recoveredAt"],
    }
  );

type InjuryFormData = z.infer<typeof injurySchema>;

type InjuryFormProps = {
  initialData?: InjuryRecord;
  onSave: (data: Omit<InjuryRecord, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
};

export function InjuryForm({ initialData, onSave, onCancel }: InjuryFormProps) {
  const form = useForm<InjuryFormData>({
    resolver: zodResolver(injurySchema),
    defaultValues: {
      type: initialData?.type || "",
      bodyPart: initialData?.bodyPart || "",
      severity: initialData?.severity || "minor",
      occurredAt: initialData?.occurredAt
        ? new Date(initialData.occurredAt)
        : undefined,
      currentStatus: initialData?.currentStatus || "active",
      expectedRecoveryDate: initialData?.expectedRecoveryDate
        ? new Date(initialData.expectedRecoveryDate)
        : undefined,
      recoveredAt: initialData?.recoveredAt
        ? new Date(initialData.recoveredAt)
        : undefined,
      notes: initialData?.notes || "",
      treatmentPlan: initialData?.treatmentPlan || "",
    },
  });

  const watchStatus = form.watch("currentStatus");

  const onSubmit = (data: InjuryFormData) => {
    try {
      // Calculate recovery time if recovered
      let recoveryTime: number | undefined;
      if (data.currentStatus === "recovered" && data.recoveredAt) {
        const occurred = new Date(data.occurredAt);
        const recovered = new Date(data.recoveredAt);
        recoveryTime = Math.floor(
          (recovered.getTime() - occurred.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      const injuryData = {
        type: data.type,
        bodyPart: data.bodyPart,
        severity: data.severity,
        occurredAt: data.occurredAt.toISOString(),
        currentStatus: data.currentStatus,
        expectedRecoveryDate: data.expectedRecoveryDate?.toISOString(),
        recoveredAt: data.recoveredAt?.toISOString(),
        recoveryTime,
        notes: data.notes,
        treatmentPlan: data.treatmentPlan,
      };

      onSave(injuryData);
    } catch (error) {
      console.error("[InjuryForm] Error saving:", error);
      form.setError("root", {
        message: "Failed to save injury record. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Injury Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Injury Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select injury type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sprain">Sprain</SelectItem>
                    <SelectItem value="Strain">Strain</SelectItem>
                    <SelectItem value="Fracture">Fracture</SelectItem>
                    <SelectItem value="Tear">Tear</SelectItem>
                    <SelectItem value="Contusion">Contusion</SelectItem>
                    <SelectItem value="Dislocation">Dislocation</SelectItem>
                    <SelectItem value="Tendinitis">Tendinitis</SelectItem>
                    <SelectItem value="Concussion">Concussion</SelectItem>
                    <SelectItem value="Overuse">Overuse Injury</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Body Part */}
          <FormField
            control={form.control}
            name="bodyPart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Part *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select body part" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Ankle">Ankle</SelectItem>
                    <SelectItem value="Knee">Knee</SelectItem>
                    <SelectItem value="Hip">Hip</SelectItem>
                    <SelectItem value="Lower Back">Lower Back</SelectItem>
                    <SelectItem value="Upper Back">Upper Back</SelectItem>
                    <SelectItem value="Shoulder">Shoulder</SelectItem>
                    <SelectItem value="Elbow">Elbow</SelectItem>
                    <SelectItem value="Wrist">Wrist</SelectItem>
                    <SelectItem value="Hand">Hand</SelectItem>
                    <SelectItem value="Neck">Neck</SelectItem>
                    <SelectItem value="Hamstring">Hamstring</SelectItem>
                    <SelectItem value="Quadriceps">Quadriceps</SelectItem>
                    <SelectItem value="Calf">Calf</SelectItem>
                    <SelectItem value="Achilles">Achilles</SelectItem>
                    <SelectItem value="Groin">Groin</SelectItem>
                    <SelectItem value="Head">Head</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Severity */}
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Minor: 1-7 days | Moderate: 1-4 weeks | Severe: 1-3 months |
                  Critical: 3+ months
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current Status */}
          <FormField
            control={form.control}
            name="currentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Status *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="recovering">Recovering</SelectItem>
                    <SelectItem value="recovered">Recovered</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Occurred */}
          <FormField
            control={form.control}
            name="occurredAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Occurred *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: any) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expected Recovery Date - Only for Active */}
          {watchStatus === "active" && (
            <FormField
              control={form.control}
              name="expectedRecoveryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expected Recovery Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: any) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Recovered Date - Only for Recovered */}
          {watchStatus === "recovered" && (
            <FormField
              control={form.control}
              name="recoveredAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Recovery Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: any) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Treatment Plan */}
        <FormField
          control={form.control}
          name="treatmentPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Plan (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the treatment plan, rehabilitation exercises, medications, etc."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional observations, symptoms, or relevant information..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="gap-2"
          >
            {form.formState.isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {initialData ? "Update Injury" : "Add Injury"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
