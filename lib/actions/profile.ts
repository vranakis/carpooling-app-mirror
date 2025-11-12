"use server";

// lib/actions/profile.ts
// Profile operations using Neon database
// TODO: Add authentication with Clerk

import { revalidatePath } from "next/cache";
import { queryNeon, queryNeonSingle } from "@/lib/database/client";

// ============================================
// PROFILE ACTIONS
// ============================================

export async function updateProfile(formData: FormData) {
  try {
    // TODO: Get user from Clerk
    console.log("⚠️ updateProfile: Authentication not implemented");

    return {
      error:
        "Authentication required. Profile updates will be available with Clerk.",
    };

    /* WILL BE ENABLED WITH CLERK:
    const { userId } = auth();
    if (!userId) {
      return { error: "You must be logged in to update your profile" };
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;

    await queryNeon(
      `UPDATE profiles 
       SET first_name = $1, last_name = $2, phone = $3, bio = $4, updated_at = NOW()
       WHERE id = $5`,
      [firstName, lastName, phone, bio, userId]
    );

    revalidatePath("/profile");
    return { success: true };
    */
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { error: error.message || "Failed to update profile" };
  }
}

export async function updateUserSettings(formData: FormData) {
  try {
    // TODO: Get user from Clerk
    console.log("⚠️ updateUserSettings: Authentication not implemented");

    return {
      error: "Authentication required. Settings will be available with Clerk.",
    };

    /* WILL BE ENABLED WITH CLERK:
    const { userId } = auth();
    if (!userId) {
      return { error: "You must be logged in to update your settings" };
    }

    const pushEnabled = formData.has("pushEnabled");
    const emailRideRequests = formData.has("emailRideRequests");
    const emailRideConfirmations = formData.has("emailRideConfirmations");
    const emailRideReminders = formData.has("emailRideReminders");
    const emailMessages = formData.has("emailMessages");
    const emailMarketing = formData.has("emailMarketing");
    const appRideRequests = formData.has("appRideRequests");
    const appRideConfirmations = formData.has("appRideConfirmations");
    const appRideReminders = formData.has("appRideReminders");
    const appMessages = formData.has("appMessages");

    // First, check if settings exist
    const existing = await queryNeonSingle(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (existing) {
      // Update existing settings
      await queryNeon(
        `UPDATE user_settings 
         SET push_enabled = $1, 
             email_ride_requests = $2,
             email_ride_confirmations = $3,
             email_ride_reminders = $4,
             email_messages = $5,
             email_marketing = $6,
             app_ride_requests = $7,
             app_ride_confirmations = $8,
             app_ride_reminders = $9,
             app_messages = $10,
             updated_at = NOW()
         WHERE user_id = $11`,
        [
          pushEnabled,
          emailRideRequests,
          emailRideConfirmations,
          emailRideReminders,
          emailMessages,
          emailMarketing,
          appRideRequests,
          appRideConfirmations,
          appRideReminders,
          appMessages,
          userId
        ]
      );
    } else {
      // Create new settings
      await queryNeon(
        `INSERT INTO user_settings (
          user_id, push_enabled, email_ride_requests, email_ride_confirmations,
          email_ride_reminders, email_messages, email_marketing,
          app_ride_requests, app_ride_confirmations, app_ride_reminders, app_messages
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId,
          pushEnabled,
          emailRideRequests,
          emailRideConfirmations,
          emailRideReminders,
          emailMessages,
          emailMarketing,
          appRideRequests,
          appRideConfirmations,
          appRideReminders,
          appMessages
        ]
      );
    }

    revalidatePath("/profile/settings");
    return { success: true };
    */
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return { error: error.message || "Failed to update settings" };
  }
}

export async function getUserSettings() {
  try {
    // TODO: Get user from Clerk
    console.log("⚠️ getUserSettings: Authentication not implemented");

    return null;

    /* WILL BE ENABLED WITH CLERK:
    const { userId } = auth();
    if (!userId) return null;

    const settings = await queryNeonSingle(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    return settings;
    */
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export async function getEnvironmentalImpact() {
  try {
    // TODO: Get user from Clerk
    console.log("⚠️ getEnvironmentalImpact: Authentication not implemented");

    return null;

    /* WILL BE ENABLED WITH CLERK:
    const { userId } = auth();
    if (!userId) return null;

    const impact = await queryNeonSingle(
      'SELECT * FROM environmental_impact WHERE user_id = $1',
      [userId]
    );

    return impact;
    */
  } catch (error) {
    console.error("Error fetching environmental impact:", error);
    return null;
  }
}

// ============================================
// HELPER FUNCTIONS (Work without auth)
// ============================================

// Get profile by ID (for displaying driver info, etc.)
export async function getProfileById(userId: string) {
  try {
    const profile = await queryNeonSingle(
      "SELECT * FROM profiles WHERE id = $1",
      [userId]
    );
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// ============================================
// NOTES FOR CLERK MIGRATION
// ============================================

/*
When we add Clerk:

1. Import auth:
   import { auth } from '@clerk/nextjs/server'

2. Get user ID:
   const { userId } = auth();

3. Uncomment all the code blocks above

4. Create user_settings table if it doesn't exist:

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_ride_requests BOOLEAN DEFAULT true,
  email_ride_confirmations BOOLEAN DEFAULT true,
  email_ride_reminders BOOLEAN DEFAULT true,
  email_messages BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  app_ride_requests BOOLEAN DEFAULT true,
  app_ride_confirmations BOOLEAN DEFAULT true,
  app_ride_reminders BOOLEAN DEFAULT true,
  app_messages BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

5. Create environmental_impact table if needed:

CREATE TABLE IF NOT EXISTS environmental_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_co2_saved FLOAT DEFAULT 0,
  total_distance_carpooled FLOAT DEFAULT 0,
  total_rides_shared INT DEFAULT 0,
  trees_equivalent FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
*/
