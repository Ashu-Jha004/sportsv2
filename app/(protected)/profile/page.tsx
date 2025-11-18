"use client";
import { useUser } from "@clerk/clerk-react";
import { redirect } from "next/navigation";
import AthleteHeader from "./components/AthleteHeader";
import { ProfileBody } from "./components/AthleteBody";
import { mockProfileData } from "./data/mockProfile";
export default function Example() {
  const { isSignedIn, user, isLoaded } = useUser();

  console.log("user meta data", user?.publicMetadata);
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    redirect("/auth/sign-in");
  }

  return (
    <>
      <div className="">
        <main className="min-h-screen bg-slate-50 py-8">
          <div className="container mx-auto px-4 max-w-5xl space-y-6">
            <AthleteHeader profile={mockProfileData} isOwnProfile={true} />
          </div>
          <ProfileBody profile={mockProfileData} isOwnProfile={true} />
        </main>
      </div>
    </>
  );
}
