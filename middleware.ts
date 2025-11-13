// middleware.ts
// Clerk authentication middleware

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  "/offer-ride(.*)",
  "/my-rides(.*)",
  "/my-bookings(.*)",
  "/profile(.*)",
  "/messages(.*)",
  "/notifications(.*)",
]);

// Define public routes that should never be protected
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/rides(.*)",
  "/search(.*)",
  "/available-rides(.*)",
  "/test-rides(.*)",
  "/test-clerk(.*)",
  "/impact(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Don't protect public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
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
