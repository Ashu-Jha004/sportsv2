"use client";

import LayoutShell from "@/components/global";
import { MENU_ITEMS } from "@/components/global/types/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return; // Wait for auth state load

    if (!isSignedIn) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user?.publicMetadata?.username) {
      router.replace(`/profile/${user.publicMetadata.username}`);
      return;
    }

    // Optional fallback warning for signed-in users without username
    console.warn("User signed in but username missing");
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    // Optionally show a loading spinner or placeholder while auth is loading
    return <div>Loading...</div>;
  }

  if (!isSignedIn || !user?.publicMetadata?.username) {
    // Prevent flicker by not rendering content until redirects handled
    return null;
  }

  return (
    <LayoutShell
      brandName="SportX"
      userName={user.username || ""}
      menus={MENU_ITEMS}
    >
      {children}
    </LayoutShell>
  );
}
