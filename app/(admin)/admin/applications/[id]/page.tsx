import { getApplicationById } from "@/app/(admin)/actions/admin-actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ApplicationActions } from "../components/ApplicationActions";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // Changed to Promise
}) {
  // Await params
  const { id } = await params;

  const application = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
            {application.athlete.profileImage ? (
              <Image
                src={application.athlete.profileImage}
                alt={application.athlete.firstName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                {application.athlete.firstName[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {application.athlete.firstName} {application.athlete.lastName}
            </h1>
            <p className="text-gray-600">@{application.athlete.username}</p>
            <p className="text-gray-500 text-sm mt-1">
              {application.athlete.email}
            </p>
          </div>
        </div>

        <StatusBadge status={application.status} />
      </div>

      {/* Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Professional Information
            </h2>
            <div className="space-y-4">
              <InfoRow label="Work Email" value={application.workEmail} />
              <InfoRow
                label="Primary Expertise"
                value={application.primaryExpertise}
              />
              <InfoRow
                label="Secondary Expertise"
                value={application.secondaryExpertise.join(", ") || "None"}
              />
              <InfoRow
                label="Years of Experience"
                value={`${application.yearsOfExperience} years`}
              />
              <InfoRow
                label="Location"
                value={`${application.workCity}, ${application.workState}, ${application.workCountry}`}
              />
            </div>

            {application.coverLetter && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Cover Letter
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            )}

            {/* Resume */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Resume</h3>
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                📄 View Resume
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Athlete Profile */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Athlete Profile
            </h2>
            <div className="space-y-4">
              <InfoRow
                label="Username"
                value={`@${application.athlete.username}`}
              />
              <InfoRow
                label="Primary Sport"
                value={application.athlete.primarySport}
              />
              <InfoRow
                label="Location"
                value={`${application.athlete.city}, ${application.athlete.state}, ${application.athlete.country}`}
              />
              <InfoRow
                label="Member Since"
                value={new Date(
                  application.athlete.createdAt
                ).toLocaleDateString()}
              />
              {application.athlete.bio && (
                <div>
                  <span className="text-sm text-gray-500">Bio:</span>
                  <p className="mt-1 text-gray-900">
                    {application.athlete.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {(application.status === "PENDING" ||
            application.status === "UNDER_REVIEW") && (
            <ApplicationActions applicationId={application.id} />
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Timeline
            </h2>
            <div className="space-y-4">
              <TimelineItem
                label="Submitted"
                date={application.submittedAt}
                icon="📝"
              />
              {application.reviewedAt && (
                <TimelineItem
                  label="Reviewed"
                  date={application.reviewedAt}
                  icon="👁️"
                />
              )}
            </div>
          </div>

          {/* Review Info */}
          {application.reviewedBy && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Review Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Reviewed By:</span>
                  <p className="font-medium">
                    {application.reviewedBy.firstName}{" "}
                    {application.reviewedBy.lastName}
                  </p>
                </div>
                {application.reviewNotes && (
                  <div>
                    <span className="text-sm text-gray-500">Notes:</span>
                    <p className="mt-1 text-gray-900">
                      {application.reviewNotes}
                    </p>
                  </div>
                )}
                {application.rejectionReason && (
                  <div>
                    <span className="text-sm text-gray-500">
                      Rejection Reason:
                    </span>
                    <p className="mt-1 text-red-700">
                      {application.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    UNDER_REVIEW: "bg-purple-100 text-purple-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    WITHDRAWN: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-medium ${
        colors[status as keyof typeof colors]
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-gray-500">{label}:</span>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  icon,
}: {
  label: string;
  date: Date;
  icon: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">
          {new Date(date).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
