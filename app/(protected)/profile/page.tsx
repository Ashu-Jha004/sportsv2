"use client";
import React from "react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const page = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  console.log(user);
  useEffect(() => {
    if (!isLoaded) return; // Wait for auth state load

    if (!isSignedIn) {
      redirect("/auth/sign-in");
      return;
    }

    if (user?.publicMetadata?.username) {
      redirect(`/profile/${user?.publicMetadata?.username}`);
      return;
    }

    // Optional fallback warning for signed-in users without username
    console.warn("User signed in but username missing");
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    // Optionally show a loading spinner or placeholder while auth is loading
    return <div>Loading...</div>;
  }

  if (!isSignedIn || !user?.publicMetadata?.username) {
    // Prevent flicker by not rendering content until redirects handled
    return null;
  }
  return <div>page</div>;
};

export default page;
