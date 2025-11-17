"use client";
import LayoutShell from "@/components/global";
import { MENU_ITEMS } from "@/components/global/types/types";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LayoutShell brandName="SportX" userName="Ashu" menus={MENU_ITEMS}>
        {children}
      </LayoutShell>
    </>
  );
}
