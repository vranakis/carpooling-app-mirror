// app/auth/callback/route.ts
// ⚠️ TEMPORARILY DISABLED - Auth callback not needed without Supabase
// TODO: Replace with Clerk callback when authentication is added

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);

  // For now, just redirect to homepage
  // When we add Clerk, this will handle OAuth callbacks
  console.log("⚠️ Auth callback disabled - redirecting to homepage");

  return NextResponse.redirect(`${origin}/`);
}

/*
CLERK IMPLEMENTATION WILL BE:

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get("next") ?? "/"
  
  // Clerk handles the OAuth flow automatically
  // Just redirect to the intended destination
  return NextResponse.redirect(`${origin}${next}`)
}
*/
