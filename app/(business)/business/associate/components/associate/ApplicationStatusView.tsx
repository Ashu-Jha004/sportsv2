"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  MapPin,
  Trophy,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAssociateStatus } from "../../hooks/use-associate";
import { useEffect } from "react";

interface ApplicationStatusViewProps {
  application: any;
  canReapply?: boolean;
  canReapplyAfter?: Date | null;
}

export function ApplicationStatusView({
  application,
  canReapply = false,
  canReapplyAfter = null,
}: ApplicationStatusViewProps) {
  const router = useRouter();

  // Poll for status updates every 30 seconds
  const { refetch } = useAssociateStatus();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const formatSportName = (sport: string) => {
    return sport
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          title: "Application Pending",
          description:
            "Your application has been submitted and is waiting for admin review.",
        };
      case "UNDER_REVIEW":
        return {
          icon: Eye,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          title: "Under Review",
          description: "An admin is currently reviewing your application.",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Application Not Approved",
          description: "Your application was not approved at this time.",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          title: "Application Status",
          description: "Check your application status below.",
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  const getDaysUntilReapply = () => {
    if (!canReapplyAfter) return 0;
    const now = new Date();
    const diff = canReapplyAfter.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysUntilReapply = getDaysUntilReapply();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Status Header */}
        <div
          className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-lg p-8 mb-8`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 ${statusConfig.bgColor} rounded-full`}>
              <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
            </div>
            <div className="flex-1">
              <h1 className={`text-3xl font-bold ${statusConfig.color} mb-2`}>
                {statusConfig.title}
              </h1>
              <p className="text-gray-700 text-lg">
                {statusConfig.description}
              </p>

              {/* Submission Date */}
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Submitted on{" "}
                  {new Date(application.submittedAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <Badge
              variant={
                application.status === "PENDING" ? "default" : "secondary"
              }
              className="text-lg px-4 py-2"
            >
              {application.status.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Rejection Information */}
        {application.status === "REJECTED" && application.rejectionReason && (
          <Card className="p-6 mb-8 border-2 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  Reason for Decision
                </h3>
                <p className="text-red-800 mb-4">
                  {application.rejectionReason}
                </p>

                {canReapply ? (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-green-700 font-medium mb-2">
                      ✓ You can reapply now
                    </p>
                    <Button
                      onClick={() => router.push("/associate/reapply")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit New Application
                    </Button>
                  </div>
                ) : (
                  canReapplyAfter && (
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <p className="text-gray-700 mb-1">
                        You can reapply after the cooldown period
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {daysUntilReapply}{" "}
                        {daysUntilReapply === 1 ? "day" : "days"} remaining
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Available on{" "}
                        {canReapplyAfter.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Application Details */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Application Details
          </h2>

          {/* Contact Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
            </div>
            <div className="space-y-2 ml-11">
              <p className="text-gray-700">
                <span className="text-gray-500">Work Email:</span>{" "}
                <span className="font-medium">{application.workEmail}</span>
              </p>
            </div>
          </Card>

          {/* Sports Expertise */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sports Expertise
              </h3>
            </div>
            <div className="ml-11 space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Primary:</p>
                <Badge variant="default" className="text-sm">
                  {formatSportName(application.primaryExpertise)}
                </Badge>
              </div>
              {application.secondaryExpertise &&
                application.secondaryExpertise.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Secondary:</p>
                    <div className="flex flex-wrap gap-2">
                      {application.secondaryExpertise.map((sport: string) => (
                        <Badge
                          key={sport}
                          variant="secondary"
                          className="text-sm"
                        >
                          {formatSportName(sport)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              <div className="pt-2">
                <p className="text-gray-700">
                  <span className="text-gray-500">Experience:</span>{" "}
                  <span className="font-medium">
                    {application.yearsOfExperience} years
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Work Location
              </h3>
            </div>
            <div className="ml-11 space-y-1">
              <p className="text-gray-700 font-medium">
                {application.workCity}, {application.workState}
              </p>
              <p className="text-gray-700">{application.workCountry}</p>
            </div>
          </Card>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Cover Letter
                </h3>
              </div>
              <p className="ml-11 text-gray-700 whitespace-pre-wrap">
                {application.coverLetter}
              </p>
            </Card>
          )}

          {/* Resume */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
            </div>
            <div className="ml-11">
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <FileText className="w-4 h-4" />
                View Resume
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
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Help Section */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            Questions about your application?
          </h3>
          <p className="text-blue-800 text-sm mb-4">
            If you have any questions or concerns about your application status,
            feel free to contact us.
          </p>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-100"
          >
            Contact Support
          </Button>
        </Card>
      </div>
    </div>
  );
}
