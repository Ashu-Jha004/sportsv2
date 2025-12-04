import LayoutShell from "@/components/global";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" bg-slate-50">
      <LayoutShell brandName="Sparta">
        <main className=" overflow-hidden min-h-screen">{children}</main>
      </LayoutShell>
    </div>
  );
}
