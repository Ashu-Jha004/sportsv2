import { getApplicationStats } from "../actions/admin-actions";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getApplicationStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage associate applications and platform operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Applications" value={stats.total} color="blue" />
        <StatCard
          title="Pending"
          value={stats.pending}
          color="yellow"
          href="/admin/applications?status=PENDING"
        />
        <StatCard
          title="Under Review"
          value={stats.underReview}
          color="purple"
          href="/admin/applications?status=UNDER_REVIEW"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          color="green"
          href="/admin/applications?status=APPROVED"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          color="red"
          href="/admin/applications?status=REJECTED"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            title="Review Pending"
            description="Review new applications"
            href="/admin/applications?status=PENDING"
            icon="📋"
          />
          <QuickActionButton
            title="View All Applications"
            description="See all submissions"
            href="/admin/applications"
            icon="📊"
          />
          <QuickActionButton
            title="Active Associates"
            description="Manage associates"
            href="/admin/associates"
            icon="👥"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  href,
}: {
  title: string;
  value: number;
  color: string;
  href?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  const content = (
    <div
      className={`p-6 rounded-lg border-2 ${
        colorClasses[color as keyof typeof colorClasses]
      } ${href ? "hover:shadow-lg transition-shadow cursor-pointer" : ""}`}
    >
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function QuickActionButton({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}
