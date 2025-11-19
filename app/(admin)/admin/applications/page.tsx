import { getAllApplications } from "../../actions/admin-actions";
import { ApplicationStatus } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: ApplicationStatus };
}) {
  const applications = await getAllApplications(searchParams.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-2">
            Manage associate applications ({applications.length} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <FilterButton
            label="All"
            href="/admin/applications"
            active={!searchParams.status}
          />
          <FilterButton
            label="Pending"
            href="/admin/applications?status=PENDING"
            active={searchParams.status === "PENDING"}
          />
          <FilterButton
            label="Under Review"
            href="/admin/applications?status=UNDER_REVIEW"
            active={searchParams.status === "UNDER_REVIEW"}
          />
          <FilterButton
            label="Approved"
            href="/admin/applications?status=APPROVED"
            active={searchParams.status === "APPROVED"}
          />
          <FilterButton
            label="Rejected"
            href="/admin/applications?status=REJECTED"
            active={searchParams.status === "REJECTED"}
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No applications found</p>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </Link>
  );
}

function ApplicationCard({ application }: { application: any }) {
  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    UNDER_REVIEW: "bg-purple-100 text-purple-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    WITHDRAWN: "bg-gray-100 text-gray-800",
  };

  return (
    <Link href={`/admin/applications/${application.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
              {application.athlete.profileImage ? (
                <Image
                  src={application.athlete.profileImage}
                  alt={application.athlete.firstName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {application.athlete.firstName[0]}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {application.athlete.firstName} {application.athlete.lastName}
              </h3>
              <p className="text-gray-600">@{application.athlete.username}</p>

              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Primary Sport:</span>
                  <span className="ml-2 font-medium">
                    {application.primaryExpertise}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Experience:</span>
                  <span className="ml-2 font-medium">
                    {application.yearsOfExperience} years
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">
                    {application.workCity}, {application.workState}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <span className="ml-2 font-medium">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[application.status as keyof typeof statusColors]
            }`}
          >
            {application.status.replace("_", " ")}
          </span>
        </div>
      </div>
    </Link>
  );
}
