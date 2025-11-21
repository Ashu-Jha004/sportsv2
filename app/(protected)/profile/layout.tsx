"use client";

import LayoutShell from "@/components/global";
import { MENU_ITEMS } from "@/components/global/types/types";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  // if (!user) {
  //   redirect("/auth/sign-in");
  // }

  return (
    <LayoutShell
      brandName="SportX"
      userName={user?.publicMetadata?.username || ""}
      menus={MENU_ITEMS}
    >
      {children}
    </LayoutShell>
  );
}
