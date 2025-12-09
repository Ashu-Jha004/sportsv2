"use client";

import LayoutShell from "@/components/global";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUser } from "@clerk/nextjs";
import { Suspense } from "react";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense
        fallback={
          <div>
            <LoadingSpinner />
          </div>
        }
      >
        <LayoutShell brandName="Sparta">{children}</LayoutShell>

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
      </Suspense>
    </>
  );
}
