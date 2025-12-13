"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (user?.username) {
        router.replace(`/profile/${user.username}`);
      } else {
        router.replace("/onboarding"); // Or wherever you want
      }
    }
  }, [isLoaded, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full border-4 border-blue-600/70 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Redirecting to your profile...
        </p>
      </div>
    </div>
  );
}
