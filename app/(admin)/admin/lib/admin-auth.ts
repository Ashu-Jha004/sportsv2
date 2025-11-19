import { auth, currentUser } from "@clerk/nextjs/server";
import { FOUNDER_CLERK_ID, FOUNDER_EMAIL } from "./constants";
import { redirect } from "next/navigation";

export async function verifyAdminAccess() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is founder
  const isFounder =
    user.id === FOUNDER_CLERK_ID &&
    user.emailAddresses[0]?.emailAddress === FOUNDER_EMAIL;

  if (!isFounder) {
    redirect("/unauthorized");
  }

  return {
    userId: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    name: `${user.firstName} ${user.lastName}`,
    isAdmin: true,
  };
}

export async function checkIsAdmin() {
  try {
    const { userId } = await auth();

    if (!userId) return false;

    const user = await currentUser();

    if (!user) return false;

    return (
      user.id === FOUNDER_CLERK_ID &&
      user.emailAddresses[0]?.emailAddress === FOUNDER_EMAIL
    );
  } catch {
    return false;
  }
}
