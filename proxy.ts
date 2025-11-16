// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
]);
const isApiRoute = createRouteMatcher(["/api/:path*"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth();

  // 1. Handle API routes separately (important for Cloudinary signature)
  if (isApiRoute(req)) {
    // If you want all APIs protected, keep this check:
    if (!isAuthenticated) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // Do NOT enforce onboardingComplete for APIs
    return NextResponse.next();
  }

  // 2. Allow authenticated users to access /onboarding
  if (isAuthenticated && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // 3. If the user isn't signed in and the route is private, redirect to sign-in
  if (!isAuthenticated && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 4. Redirect signed-in users who haven't completed onboarding
  if (isAuthenticated && !sessionClaims?.metadata?.onboardingComplete) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // 5. If the user is logged in and the route is protected, let them view
  if (isAuthenticated && !isPublicRoute(req)) {
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
