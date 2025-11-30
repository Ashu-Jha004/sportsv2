"use client";

import LayoutShell from "@/components/global";
import { MENU_ITEMS } from "@/components/global/types/types";
import { useUser } from "@clerk/nextjs";
import { GuideFinderDialog } from "./components/GuideFinderDialog";
import { AIDialogProvider } from "@/components/ai/AIDialogProvider";
import { Toaster } from "sonner";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  // Optional: Add redirect logic when ready
  // useEffect(() => {
  //   if (isLoaded && !user) {
  //     redirect("/auth/sign-in");
  //   }
  // }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-200 opacity-25" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">Sparta</p>
            <p className="text-sm text-slate-600 mt-1">
              Loading your experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LayoutShell
        brandName="Sparta"
        userName={user?.publicMetadata?.username || ""}
        menus={MENU_ITEMS}
      >
        {children}
      </LayoutShell>

      {/* Global Dialogs */}
      <GuideFinderDialog />
      <AIDialogProvider />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: 500,
          },
          className: "shadow-lg",
        }}
      />
    </>
  );
}
