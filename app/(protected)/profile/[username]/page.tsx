"use client";

import AthleteHeader from "../components/AthleteHeader";
import { useParams } from "next/navigation"; // or useRouter
import { useAthlete } from "../hooks/use-athlete";
import AthleteProfile from "../components/AthleteBody";
export default function DynamicProfilePage() {
  const params = useParams();

  // params.username may be string | string[] | undefined
  let username: any = params.username;

  // Normalize to string or null
  if (Array.isArray(username)) {
    username = username[0]; // Pick the first if array
  }
  if (!username) {
    username = null;
  }
  const { data: athlete }: any = useAthlete(username);
  // Replace this with your authentication logic to check if own profile
  const isOwnProfile: boolean = false; // or compare username with logged-in user
  return (
    <>
      {username ? (
        <AthleteHeader athlete={athlete} isOwnProfile={isOwnProfile} />
      ) : (
        <div>Invalid profile URL</div>
      )}
      <AthleteProfile athlete={athlete} isOwnProfile={isOwnProfile} />
    </>
  );
}
