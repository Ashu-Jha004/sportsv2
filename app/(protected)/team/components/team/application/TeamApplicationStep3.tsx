// components/team/application/TeamApplicationStep3.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { teamApplicationStep3Schema } from "../../../lib/validations/team";
import { useTeamApplicationStore } from "@/stores/team/creation/use-team-application-store";
import {
  getGuidesForApplication,
  createTeamApplication,
} from "../../../lib/actions/team-application.actions";
import { ChevronLeft, MapPin, Award, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TeamApplicationStep3() {
  const router = useRouter();
  const {
    formData,
    setFormData,
    prevStep,
    resetForm,
    setIsSubmitting,
    isSubmitting,
  } = useTeamApplicationStore();
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm({
    resolver: zodResolver(teamApplicationStep3Schema),
    defaultValues: {
      guideId: formData.guideId || "",
    },
  });

  // Fetch guides based on sport and location
  const {
    data: guidesResult,
    isLoading: loadingGuides,
    error: guidesError,
  } = useQuery({
    queryKey: [
      "guides-for-application",
      formData.sport,
      formData.latitude,
      formData.longitude,
    ],
    queryFn: async () => {
      if (!formData.sport) {
        throw new Error("Sport is required to fetch guides");
      }

      const result = await getGuidesForApplication({
        sport: formData.sport,
        latitude: formData.latitude,
        longitude: formData.longitude,
        maxDistanceKm: 100,
      });

      if (!result.success) {
        console.error("[GUIDES_FETCH_ERROR]", result.error);
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!formData.sport,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: 2,
  });

  // Filter guides by search query
  const filteredGuides = useMemo(() => {
    if (!guidesResult) return [];
    if (!searchQuery.trim()) return guidesResult;

    const query = searchQuery.toLowerCase();
    return guidesResult.filter((guide) => {
      const fullName = `${guide.user.firstName || ""} ${
        guide.user.lastName || ""
      }`.toLowerCase();
      const username = (guide.user.username || "").toLowerCase();
      const city = (guide.city || "").toLowerCase();
      const state = (guide.state || "").toLowerCase();

      return (
        fullName.includes(query) ||
        username.includes(query) ||
        city.includes(query) ||
        state.includes(query)
      );
    });
  }, [guidesResult, searchQuery]);

  // Submit application mutation
  const submitMutation = useMutation({
    mutationFn: async (guideId: string) => {
      console.log("[SUBMIT_APPLICATION] Starting submission...", guideId);
      setIsSubmitting(true);
      console.log(
        "[SUBMIT_APPLICATION] Form data:",
        formData,
        "Guide ID:",
        guideId
      );
      const applicationData = {
        ...formData,
        guideId,
      };

      //   console.log("[SUBMIT_APPLICATION] Data:", applicationData);

      const result = await createTeamApplication(applicationData as any);

      if (!result.success) {
        console.error("[APPLICATION_SUBMIT_ERROR]", result.error, result.code);
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: (data) => {
      console.log("[APPLICATION_SUCCESS]", data);
      toast.success("Application submitted successfully!", {
        description:
          "Your guide will review it soon. You'll receive a notification.",
      });
      resetForm();
      setIsSubmitting(false);

      // Redirect to a pending applications page or home
      setTimeout(() => {
        router.push("/team");
      }, 1500);
    },
    onError: (error: Error) => {
      console.error("[APPLICATION_ERROR]", error);
      setIsSubmitting(false);

      // Handle specific error codes
      if (error.message.includes("already own a team")) {
        toast.error("You already own a team", {
          description:
            "Leave or delete your existing team before creating another.",
        });
      } else if (error.message.includes("pending application")) {
        toast.error("Pending application exists", {
          description: "Wait for your current application to be reviewed.",
        });
      } else {
        toast.error("Failed to submit application", {
          description: error.message || "Please try again later.",
        });
      }
    },
  });

  const onSubmit = useCallback(
    (data: any) => {
      console.log("[STEP_3] Selected guide:");
      setFormData(data);
      submitMutation.mutate(data.guideId);
      console.log("[STEP_3] Selected guide ID:", data.guideId);
    },
    [setFormData, submitMutation]
  );

  // Error state
  if (guidesError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-800">
          Failed to load guides. Please check your network and try again.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search guides by name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Guides list */}
        <FormField
          control={form.control}
          name="guideId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Select a Guide *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-3"
                >
                  {loadingGuides ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full" />
                    ))
                  ) : filteredGuides.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                      <p className="text-sm text-slate-600">
                        {searchQuery
                          ? "No guides match your search"
                          : "No approved guides found for your sport and location"}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Try adjusting your location or check back later
                      </p>
                    </div>
                  ) : (
                    filteredGuides.map((guide) => (
                      <GuideCard
                        key={guide.userId}
                        guide={guide}
                        isSelected={field.value === guide.userId}
                        onSelect={() => field.onChange(guide.userId)}
                      />
                    ))
                  )}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={prevStep}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !form.watch("guideId")}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface GuideCardProps {
  guide: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      username: string | null;
    };
    PrimarySports: string | null;
    Sports: string[];
    city: string | null;
    state: string | null;
    country: string | null;
    distance?: number;
    userId: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function GuideCard({ guide, isSelected, onSelect }: GuideCardProps) {
  const displayName = useMemo(() => {
    if (guide.user.firstName || guide.user.lastName) {
      return `${guide.user.firstName || ""} ${
        guide.user.lastName || ""
      }`.trim();
    }
    return guide.user.username || "Guide";
  }, [guide.user]);

  const locationText = useMemo(() => {
    const parts = [guide.city, guide.state, guide.country].filter(Boolean);
    return parts.join(", ") || "Location not specified";
  }, [guide.city, guide.state, guide.country]);

  return (
    <label
      htmlFor={`guide-${guide.userId}`}
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50",
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white"
      )}
    >
      <RadioGroupItem
        value={guide.userId}
        id={`guide-${guide.userId}`}
        className="mt-1"
      />

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{displayName}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="h-3 w-3" />
              {locationText}
              {guide.distance !== undefined && (
                <span className="ml-2 font-medium text-emerald-600">
                  • {guide.distance.toFixed(1)} km away
                </span>
              )}
            </div>
          </div>
          {guide.PrimarySports && (
            <Badge variant="secondary" className="ml-2">
              <Award className="mr-1 h-3 w-3" />
              {guide.PrimarySports.replace(/_/g, " ")}
            </Badge>
          )}
        </div>

        {guide.Sports.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {guide.Sports.slice(0, 3).map((sport) => (
              <Badge key={sport} variant="outline" className="text-xs">
                {sport.replace(/_/g, " ")}
              </Badge>
            ))}
            {guide.Sports.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{guide.Sports.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </label>
  );
}
