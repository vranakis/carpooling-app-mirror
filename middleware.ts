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

export default clerkMiddleware(async (auth, req) => {
  console.log("🔒 Middleware checking:", req.nextUrl.pathname);

  // Only protect specific routes that require authentication
  if (isProtectedRoute(req)) {
    console.log("🔐 Protected route - checking auth");
    await auth.protect();
  } else {
    console.log("✅ Public route - no auth required");
  }
});
