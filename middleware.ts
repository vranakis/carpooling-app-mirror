import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const isProtectedRoute = createRouteMatcher([
  "/offer-ride(.*)",
  "/my-rides(.*)",
  "/my-bookings(.*)",
  "/profile(.*)",
  "/messages(.*)",
  "/notifications(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
