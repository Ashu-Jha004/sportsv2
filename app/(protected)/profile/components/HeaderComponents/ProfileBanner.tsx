// components/profile/ProfileBanner.tsx

"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

interface ProfileBannerProps {
  bannerImage: string;
  isOwnProfile?: boolean;
}

export function ProfileBanner({
  bannerImage,
  isOwnProfile = true,
}: ProfileBannerProps) {
  return (
    <div className="relative w-full h-48 md:h-64 lg:h-80 bg-linear-to-br from-slate-200 to-slate-300 overflow-hidden rounded-t-2xl">
      <Image
        src={bannerImage}
        alt="Profile banner"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

      {/* Edit Banner Button - Only for own profile */}
      {isOwnProfile && (
        <button
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 p-2.5 rounded-lg shadow-lg transition-all hover:shadow-xl"
          aria-label="Change banner image"
        >
          <Camera className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
