import { redirect } from "next/navigation";
import { getAssociateStatus } from "@/lib/associate/get-associate-status";
import { AssociateApplicationForm } from "./components/associate/AssociateApplicationForm";
import { AssociateDashboard } from "./components/associate/AssociateDashboard";
import { ApplicationStatusView } from "./components/associate/ApplicationStatusView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AssociatePage() {
  const status = await getAssociateStatus();

  // Not authenticated - redirect to sign in
  if (!status.isAuthenticated) {
    redirect("/auth/sign-in?redirect=/associate");
  }

  // No athlete record - something is wrong
  if (!status.athleteId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Error: Profile Not Found
          </h1>
          <p className="text-gray-600">
            Your athlete profile could not be found. Please complete onboarding
            first.
          </p>
        </div>
      </div>
    );
  }

  // Has approved profile - show dashboard
  if (status.hasProfile && status.profile) {
    return <AssociateDashboard profile={status.profile} />;
  }

  // Has pending/under review application - show status
  if (
    status.hasApplication &&
    status.application &&
    (status.application.status === "PENDING" ||
      status.application.status === "UNDER_REVIEW")
  ) {
    return <ApplicationStatusView application={status.application} />;
  }

  // Has rejected application - show status with reapply info
  if (
    status.hasApplication &&
    status.application &&
    status.application.status === "REJECTED"
  ) {
    return (
      <ApplicationStatusView
        application={status.application}
        canReapply={status.canApply}
        canReapplyAfter={status.canReapplyAfter}
      />
    );
  }

  // Can apply - show application form
  if (status.canApply) {
    return <AssociateApplicationForm />;
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600">
          Unable to determine your associate status. Please contact support.
        </p>
      </div>
    </div>
  );
}
