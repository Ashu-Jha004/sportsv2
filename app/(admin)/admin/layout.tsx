import { verifyAdminAccess } from "./lib/admin-auth";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await verifyAdminAccess();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-bold text-gray-900">
                Sparta Admin
              </Link>
              <nav className="flex gap-6">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/applications"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Applications
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {admin.name}
                </p>
                <p className="text-xs text-gray-500">Founder</p>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
