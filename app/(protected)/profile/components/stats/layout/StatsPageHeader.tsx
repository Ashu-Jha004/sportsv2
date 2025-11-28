// components/stats/layout/StatsPageHeader.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, ArrowLeft, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";

interface StatsPageHeaderProps {
  profileData: any;
  isOwnProfile: boolean;
  stats?: CleanedAthleteStats;
}

export function StatsPageHeader({
  profileData,
  isOwnProfile,
  stats,
}: StatsPageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData.firstName}'s Performance Stats`,
          text: "Check out these athletic performance stats!",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleExport = () => {
    if (!stats) return;

    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profileData.username}-stats-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getInitials = () => {
    const first = profileData.firstName?.[0] || "";
    const last = profileData.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Background Pattern */}
      <div className="h-32 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 -mt-16 relative z-10">
        {/* Top Actions */}
        <div className="flex justify-between items-start mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {stats && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar */}
          <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
            <AvatarImage
              src={profileData?.profileImage || undefined}
              alt={profileData.firstName}
            />
            <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-blue-500 to-purple-500 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h1>
              {isOwnProfile && (
                <Badge variant="secondary" className="text-xs">
                  Your Profile
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {profileData.username && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">@{profileData.username}</span>
                </span>
              )}
              {profileData.primarySport && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <span>🏆</span>
                    <span>{profileData.primarySport}</span>
                  </span>
                </>
              )}
              {profileData.city && profileData.state && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <span>📍</span>
                    <span>
                      {profileData.city}, {profileData.state}
                    </span>
                  </span>
                </>
              )}
              {profileData.gender && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{profileData.gender}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
