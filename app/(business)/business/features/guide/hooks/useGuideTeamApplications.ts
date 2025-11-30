import { useQuery } from "@tanstack/react-query";
import { getGuideTeamApplications } from "../actions/team-applications/guide-team-applications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeamApplicationStatus } from "../actions/team-applications/guide-team-applications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type GuideTeamApplication = {
  id: string;
  name: string;
  sport: string;
  class: string | null;
  rank: string;
  logoUrl: string | null;
  status: string;
  createdAt: Date;
  applicant: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    primarySport: string | null;
    rank: string;
    class: string;
    city: string | null;
    state: string | null;
    country: string | null;
  };
};

export function useGuideTeamApplications() {
  return useQuery({
    queryKey: ["guide-team-applications"],
    queryFn: getGuideTeamApplications,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
export function useUpdateTeamApplication() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: updateTeamApplicationStatus,
    onSuccess: (data, variables) => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: ["guide-team-applications"] });

      // Success toast
      toast.success(
        `Team application ${variables.status.toLowerCase()}d successfully!`
      );

      // Optional: navigate or close dialog (handled by parent component)
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update application"
      );
    },
  });
}
