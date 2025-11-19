"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  MapPin,
  Trophy,
  Calendar,
  Edit,
  CheckCircle,
  Navigation,
  Loader2,
} from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";
import { useUpdateLocation } from "../../hooks/use-associate";
import { toast } from "sonner";
import { getCurrentLocation, reverseGeocode } from "@/lib/utils/geolocation";

interface AssociateDashboardProps {
  profile: any;
}

export function AssociateDashboard({ profile }: AssociateDashboardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const { mutateAsync: updateLocation, isPending: isUpdatingLocation } =
    useUpdateLocation();

  const formatSportName = (sport: string) => {
    return sport
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleUpdateLocation = async () => {
    try {
      const location = await getCurrentLocation();
      await updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Optionally fetch address
      try {
        const address = await reverseGeocode(
          location.latitude,
          location.longitude
        );
        toast.success(`Location updated: ${address.city}, ${address.state}`);
      } catch {
        toast.success("Location coordinates updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update location");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Associate Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your associate profile and settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              {profile.isActive ? (
                <Badge variant="default" className="text-lg px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {profile.verifiedAt && (
          <Card className="p-4 mb-8 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  Verified Associate
                </p>
                <p className="text-sm text-green-700">
                  Verified on{" "}
                  {new Date(profile.verifiedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Profile Card */}
          <Card className="lg:col-span-2 p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Profile Information
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            <div className="space-y-6">
              {/* Contact */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Contact</h3>
                </div>
                <p className="ml-11 text-gray-700">{profile.workEmail}</p>
              </div>

              <Separator />

              {/* Sports Expertise */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Sports Expertise
                  </h3>
                </div>
                <div className="ml-11 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Primary:</p>
                    <Badge variant="default" className="text-sm">
                      {formatSportName(profile.primaryExpertise)}
                    </Badge>
                  </div>
                  {profile.secondaryExpertise &&
                    profile.secondaryExpertise.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Secondary:</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.secondaryExpertise.map((sport: string) => (
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
                </div>
              </div>

              <Separator />

              {/* Experience */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Experience</h3>
                </div>
                <p className="ml-11 text-gray-700">
                  {profile.yearsOfExperience} years of coaching/mentoring
                  experience
                </p>
              </div>

              <Separator />

              {/* Location */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Work Location</h3>
                </div>
                <div className="ml-11 space-y-2">
                  <p className="text-gray-700">
                    {profile.workCity}, {profile.workState}
                  </p>
                  <p className="text-gray-700">{profile.workCountry}</p>
                  <p className="text-sm text-gray-500">
                    Coordinates: {profile.workLatitude.toFixed(4)},{" "}
                    {profile.workLongitude.toFixed(4)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateLocation}
                    disabled={isUpdatingLocation}
                    className="mt-2"
                  >
                    {isUpdatingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        Update Location
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={profile.isActive ? "default" : "secondary"}>
                    {profile.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold">
                    {profile.yearsOfExperience} years
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Primary Sport</span>
                  <span className="font-semibold">
                    {formatSportName(profile.primaryExpertise)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-4">
                Have questions about your associate profile or need assistance?
              </p>
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600"
              >
                Contact Support
              </Button>
            </Card>
          </div>
        </div>

        {/* Resume Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resume</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">Your uploaded resume</p>
              <a
                href={profile.resumeUrl}
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
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
