"use server";

// lib/actions/auth.ts
// Clerk authentication with database profile sync

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfileById, createProfile } from "@/lib/database/helpers";

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    // Check if profile exists in database
    let profile = await getProfileById(userId);

    // If no profile, create one from Clerk data
    if (!profile) {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return null;
      }

      // Create profile in database
      profile = await createProfile({
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        first_name: clerkUser.firstName || "",
        last_name: clerkUser.lastName || "",
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || undefined,
      });

      console.log("✅ Created new profile for user:", userId);
    }

    return profile;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Use this at the top of server actions that require auth
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}

/**
 * Get the current user's ID (without database lookup)
 * Returns null if not authenticated
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  // Clerk handles sign out via their components
  // This is kept for compatibility
  redirect("/sign-out");
}
