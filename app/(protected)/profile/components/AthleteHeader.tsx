// components/profile/ProfileHeader.tsx

"use client";

import { useState } from "react";
import { ProfileData } from "../types/profile.types";
import { ProfileBanner } from "./HeaderComponents/ProfileBanner";
import { ProfileInfo } from "./HeaderComponents/ProfileInfo";
import { ProfileStats } from "./HeaderComponents/ProfileStats";
import { EditProfileDialog } from "./HeaderComponents/EditProfileDialog";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
  className?: string;
}

export default function ProfileHeader({
  profile,
  isOwnProfile = true,
  className,
}: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState(profile);

  const handleSaveProfile = (updatedProfile: Partial<ProfileData>) => {
    // Merge updated data with existing profile
    setProfileData((prev) => ({
      ...prev,
      ...updatedProfile,
    }));

    // Here you would typically make an API call
    console.log("Profile updated:", updatedProfile);
  };

  return (
    <div
      className={cn(
        "w-full bg-white shadow-lg rounded-2xl overflow-hidden",
        className
      )}
    >
      {/* Banner Section */}
      <ProfileBanner
        bannerImage={profileData.bannerImage}
        isOwnProfile={isOwnProfile}
      />

      {/* Profile Info Section */}
      <ProfileInfo
        profile={profileData}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditDialogOpen(true)}
      />

      {/* Stats Section */}
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <ProfileStats stats={profileData.stats} />
      </div>

      {/* Edit Dialog */}
      {isOwnProfile && (
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          profile={profileData}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
