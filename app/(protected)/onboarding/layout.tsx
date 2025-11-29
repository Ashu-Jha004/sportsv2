import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { metadata }: any = (await auth())?.sessionClaims;
  if ((await auth()).sessionClaims?.metadata.onboardingComplete == true) {
    redirect(`/profile/${metadata?.firstName}`);
  }

  return <>{children}</>;
}
