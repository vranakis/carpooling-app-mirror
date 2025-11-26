// middleware.ts :)
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/search",
    "/rides(.*)",
    "/available-rides",
    "/api/test-db",
    "/api/rides(.*)",
    "/test-rides",
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
