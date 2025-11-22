// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/sign-in(.*)",
  "/auth/sign-up(.*)",
]);
const isApiRoute = createRouteMatcher(["/api/:path*"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Founder credentials for admin verification
const FOUNDER_CLERK_ID: any = "user_35jot94FIsXLkQ9NWc5QBWre8oS";
const FOUNDER_EMAIL = "ashujha009322@gmail.com";

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = await auth();
  const isAuthenticated = !!userId;

  // 1. Handle API routes separately (important for Cloudinary signature)
  if (isApiRoute(req)) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // 2. Handle Admin Routes - Check BEFORE onboarding enforcement
  if (isAdminRoute(req)) {
    // Must be authenticated to access admin
    if (!isAuthenticated) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    try {
      // Fetch user details from Clerk to get email
      const user = await (await clerkClient()).users.getUser(userId);
      const userEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress;

      // Verify founder credentials
      const isFounder =
        userId === FOUNDER_CLERK_ID && userEmail === FOUNDER_EMAIL;

      if (!isFounder) {
        console.log("Access denied: Not founder");
        const unauthorizedUrl = new URL("/unauthorized", req.url);
        return NextResponse.redirect(unauthorizedUrl);
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      const unauthorizedUrl = new URL("/unauthorized", req.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // 3. Allow authenticated users to access /onboarding
  if (isAuthenticated && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // 4. If the user isn't signed in and the route is private, redirect to sign-in
  if (!isAuthenticated && !isPublicRoute(req)) {
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 5. Redirect signed-in users who haven't completed onboarding
  if (isAuthenticated && !sessionClaims?.metadata?.onboardingComplete) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // 6. If the user is logged in and the route is protected, let them view
  if (isAuthenticated && !isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 7. Allow public routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
