import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/messages",
    "/profile",
    "/my-rides",
    "/offer-ride",
    "/book",
    "/manage-booking",
    "/notifications",
    "/notification-settings",
    "/tracking",
    "/share-trip",
    "/commute-routes",
    "/available-rides",
    "/public-transport",
    "/search",
    "/ride",
    "/impact",
    "/traffic-impact",
    "/safety"
  ];

  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    // No user detected and trying to access a protected route, redirect to login
    const hasAuthCookie = request.cookies.getAll().some(cookie => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token'));
    if (!hasAuthCookie) {
      console.log("No auth cookie found, redirecting to login. Path:", request.nextUrl.pathname);
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    } else {
      console.log("Auth cookie found but no user detected. Possible refresh token failure. Clearing cookies and redirecting to login. Path:", request.nextUrl.pathname);
      // Clear potentially invalid cookies
      const cookieNames = request.cookies.getAll()
        .filter(cookie => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token'))
        .map(cookie => cookie.name);
      cookieNames.forEach(name => supabaseResponse.cookies.delete(name));
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
