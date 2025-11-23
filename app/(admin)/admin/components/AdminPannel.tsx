"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Mail,
  MapPin,
  Trophy,
  Calendar,
  Eye,
  MoreVertical,
  Download,
  User,
  AlertCircle,
  Loader2,
  Shield,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  File,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import {
  AdminModeratorsPanelProps,
  AdminDashboardData,
  ModeratorApplication,
} from "../../types/AdminModeratorsPanel";
import { ApplicationDetailModalProps } from "../../types/AdminModeratorsPanel";
import { useRef, useCallback } from "react";
import { toast } from "sonner";
// ✅ NEW: Document utilities
const getDocumentInfo = (url: string) => {
  const filename = url.split("/").pop()?.split("?")[0] || "document";
  const decodedFilename = decodeURIComponent(filename);

  // Extract file extension
  const extension = decodedFilename.split(".").pop()?.toLowerCase() || "";

  // Determine file type
  let fileType = "document";
  let icon = File;
  let canPreview = false;

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    fileType = "image";
    icon = ImageIcon;
    canPreview = true;
  } else if (extension === "pdf") {
    fileType = "pdf";
    icon = FileText;
    canPreview = true;
  } else if (["doc", "docx"].includes(extension)) {
    fileType = "document";
    icon = FileText;
  }

  return {
    filename: decodedFilename,
    extension,
    fileType,
    icon,
    canPreview,
    url,
  };
};

// =============================================================================
// MAIN ADMIN DASHBOARD COMPONENT (Keep your existing main component code)
// =============================================================================

export default function AdminModeratorsPanel({
  adminUser,
}: AdminModeratorsPanelProps) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState<
    string | null
  >(null);

  const isMounted = useRef(true);
  const lastFetchParams = useRef<string>("");
  const abortController = useRef<AbortController | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = useCallback(
    async (isRefresh = false) => {
      // Create current params string for comparison
      const currentParams = JSON.stringify({
        page: currentPage,
        statusFilter,
        searchQuery: searchQuery.trim(),
      });

      // Skip fetch if params haven't changed (except for manual refresh)
      if (!isRefresh && lastFetchParams.current === currentParams && data) {
        return;
      }

      // Cancel previous request if still pending
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
        });

        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        const response = await fetch(
          `/api/admin/moderators?${params.toString()}`,
          {
            signal: abortController.current.signal,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message ||
              `Failed to fetch applications: ${response.status}`
          );
        }

        const result = await response.json();

        // Only update state if component is still mounted
        if (isMounted.current) {
          setData(result.data);
          lastFetchParams.current = currentParams;
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        if (isMounted.current) {
          setError(
            err instanceof Error ? err.message : "Failed to load applications"
          );
          console.error("Admin fetch error:", err);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [statusFilter, searchQuery, currentPage]
  );
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]); // Empty dependency array - runs once on mount

  // ✅ REPLACE handleBulkStatusUpdate with optimistic updates
  const handleBulkStatusUpdate = async (newStatus: "approved" | "rejected") => {
    if (bulkUpdating) {
      return;
    }
    if (selectedApplications.length === 0) {
      alert("Please select applications to update");
      toast.error("No applications selected", {
        description:
          "Select at least one application before performing a bulk action.",
      });
      return;
    }

    const reviewNote =
      window.prompt(
        `Add a review note for ${newStatus} applications (optional):`
      ) || undefined;

    // Store original data for rollback
    const originalData = data;

    try {
      setBulkUpdating(true);

      // Optimistic update - immediately update UI
      if (data) {
        const updatedApplications = data.applications.map((app) =>
          selectedApplications.includes(app.id)
            ? {
                ...app,
                status: newStatus as any,
                reviewNote: reviewNote ?? null,
              }
            : app
        );
        const delta = selectedApplications.length;
        setData({
          ...data,
          applications: updatedApplications,
          stats: {
            ...data.stats,
            [newStatus]: data.stats[newStatus] + delta,
            pending_review: Math.max(
              0,
              data.stats.pending_review - selectedApplications.length
            ),
          },
        });
      }

      const response = await fetch("/api/admin/moderators", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          status: newStatus,
          reviewNote: reviewNote || undefined,
        }),
      });

      if (!response.ok) {
        // Rollback on failure
        if (originalData) setData(originalData);
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.error?.message ??
          `Failed to update applications (${response.status})`;
        throw new Error(message);
      }

      setSelectedApplications([]);
      toast.success("Applications Update has been made! ", {
        description: `Successfully updated`,
      });
    } catch (err) {
      // Rollback to original state on error
      if (originalData) {
        setData(originalData);
      }

      alert(
        err instanceof Error ? err.message : "Failed to update applications"
      );
      console.error("Bulk update error:", err);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleRefresh = useCallback(() => {
    lastFetchParams.current = ""; // Reset cache
    fetchApplications(true);
  }, [fetchApplications]);

  const handleSelectAll = () => {
    if (!data) return;

    if (selectedApplications.length === data.applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(data.applications.map((app) => app.id));
    }
  };

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending_review":
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "pending_review":
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-indigo-600" />
                Moderator Applications
              </h1>
              <p className="text-sm text-gray-600">
                Welcome {adminUser.name} ({adminUser.role}) - Manage and review
                moderator applications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.stats.total || 0}
                </p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.stats.pending_review || 0}
                </p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.stats.approved || 0}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.stats.rejected || 0}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by email, sport, or location..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-80"
                  />
                </div>

                <select
                  title="button2"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedApplications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedApplications.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkStatusUpdate("approved")}
                    disabled={bulkUpdating}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {bulkUpdating ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate("rejected")}
                    disabled={bulkUpdating}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {bulkUpdating ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {data?.applications && data.applications.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          title="button3"
                          type="checkbox"
                          checked={
                            data.applications.length > 0 &&
                            selectedApplications.length ===
                              data.applications.length
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sports
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.applications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            title="button5"
                            type="checkbox"
                            checked={selectedApplications.includes(
                              application.id
                            )}
                            onChange={() =>
                              handleSelectApplication(application.id)
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {application.user.firstName}{" "}
                                {application.user.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {application.guideEmail ||
                                  application.user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {application.PrimarySports}
                            </p>
                            <p className="text-sm text-gray-500">
                              {application.Sports.length > 1 &&
                                `+${application.Sports.length - 1} more`}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {[
                              application.city,
                              application.state,
                              application.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <Paperclip className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {application.documents.length}
                            </span>
                            <span className="text-xs text-gray-500">docs</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {getStatusIcon(application.status)}
                            <span className="ml-1">
                              {application.status.replace("_", " ")}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              setShowApplicationModal(application.id)
                            }
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {data.pagination.page} of{" "}
                    {data.pagination.pages}({data.pagination.total} total
                    applications)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!data.pagination.hasPrev || loading}
                      className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>

                    <span className="text-sm text-gray-500">
                      Page {data.pagination.page} of {data.pagination.pages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!data.pagination.hasNext || loading}
                      className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-500">
                {statusFilter !== "all" || searchQuery
                  ? "Try adjusting your filters to see more results."
                  : "No moderator applications have been submitted yet."}
              </p>
              {(statusFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {showApplicationModal && data?.applications && (
        <ApplicationDetailModal
          applicationId={showApplicationModal}
          applications={data.applications}
          onClose={() => setShowApplicationModal(null)}
          onStatusUpdate={fetchApplications}
        />
      )}
    </div>
  );
}

// =============================================================================
// ✅ ENHANCED APPLICATION DETAIL MODAL WITH DOCUMENT VIEWER
// =============================================================================

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  applicationId,
  applications,
  onClose,
  onStatusUpdate,
}) => {
  const application = applications.find((app) => app.id === applicationId);
  const [updating, setUpdating] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);

  if (!application) return null;

  const handleStatusUpdate = async (newStatus: "approved" | "rejected") => {
    const reviewNote = prompt(
      `Add a review note for ${newStatus} application (optional):`
    );

    try {
      setUpdating(true);

      const response = await fetch("/api/admin/moderators", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationIds: [application.id],
          status: newStatus,
          reviewNote: reviewNote || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `Failed to update application: ${response.status}`
        );
      }

      alert(`Application ${newStatus} successfully`);
      onStatusUpdate();
      onClose();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update application"
      );
      console.error("Status update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Document actions
  const handleViewDocument = (url: string) => {
    const docInfo = getDocumentInfo(url);

    if (docInfo.fileType === "image") {
      setPreviewDocument(url);
    } else {
      // Open in new tab for PDFs and other documents
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownloadDocument = async (url: string) => {
    try {
      const docInfo = getDocumentInfo(url);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = docInfo.filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Application Details
              </h2>
              <button
                title="button6"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Application Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900">
                      {application.user.firstName} {application.user.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {application.guideEmail || application.user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Primary Sport
                    </label>
                    <p className="text-gray-900">{application.PrimarySports}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Experience
                    </label>
                    <p className="text-gray-900">
                      {application.Experience
                        ? `${application.Experience} years`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location & Sports */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Location & Sports
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Location
                    </label>
                    <p className="text-gray-900">
                      {[
                        application.city,
                        application.state,
                        application.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      All Sports
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {application.Sports.map((sport, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ ENHANCED: Documents Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Documents ({application.documents.length})
                </h3>

                {application.documents.length > 0 ? (
                  <div className="space-y-3">
                    {application.documents.map((doc, index) => {
                      const docInfo = getDocumentInfo(doc);
                      const IconComponent = docInfo.icon;

                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div
                                className={`p-2 rounded-lg ${
                                  docInfo.fileType === "image"
                                    ? "bg-green-100"
                                    : docInfo.fileType === "pdf"
                                    ? "bg-red-100"
                                    : "bg-blue-100"
                                }`}
                              >
                                <IconComponent
                                  className={`w-5 h-5 ${
                                    docInfo.fileType === "image"
                                      ? "text-green-600"
                                      : docInfo.fileType === "pdf"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium text-gray-900 truncate"
                                  title={docInfo.filename}
                                >
                                  {docInfo.filename}
                                </p>
                                <p className="text-xs text-gray-500 uppercase">
                                  {docInfo.extension || "Unknown"} •{" "}
                                  {docInfo.fileType}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {docInfo.canPreview && (
                                <button
                                  onClick={() => handleViewDocument(doc)}
                                  className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                                  title="View document"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDownloadDocument(doc)}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                                title="Download document"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(doc, "_blank")}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No documents uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Status */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Application Status
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                      application.status === "approved"
                        ? "text-green-600 bg-green-50 border-green-200"
                        : application.status === "rejected"
                        ? "text-red-600 bg-red-50 border-red-200"
                        : "text-yellow-600 bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    {application.status === "approved" && (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {application.status === "rejected" && (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {application.status === "pending_review" && (
                      <Clock className="w-4 h-4 mr-2" />
                    )}
                    {application.status.replace("_", " ").toUpperCase()}
                  </span>
                  <div className="text-sm text-gray-500">
                    Applied:{" "}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {application.reviewNote && (
                  <div className="mb-6 p-4 bg-white rounded-lg border">
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      Review Note
                    </label>
                    <p className="text-gray-900">{application.reviewNote}</p>
                  </div>
                )}

                {application.status === "pending_review" && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate("approved")}
                      disabled={updating}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Application
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("rejected")}
                      disabled={updating}
                      className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Application
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ IMAGE PREVIEW MODAL */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="relative max-w-4xl max-h-full">
            <button
              title="button9"
              onClick={() => setPreviewDocument(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img
              src={previewDocument}
              alt="Document preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => handleDownloadDocument(previewDocument)}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 font-medium"
              >
                <Download className="w-4 h-4 mr-2 inline" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
