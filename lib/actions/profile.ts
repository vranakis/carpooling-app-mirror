"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "../supabase/server"
import { getCurrentUser } from "./auth"

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to update your profile" }
  }

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const bio = formData.get("bio") as string

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
      bio,
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function updateUserSettings(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to update your settings" }
  }

  const pushEnabled = formData.has("pushEnabled")
  const emailRideRequests = formData.has("emailRideRequests")
  const emailRideConfirmations = formData.has("emailRideConfirmations")
  const emailRideReminders = formData.has("emailRideReminders")
  const emailMessages = formData.has("emailMessages")
  const emailMarketing = formData.has("emailMarketing")
  const appRideRequests = formData.has("appRideRequests")
  const appRideConfirmations = formData.has("appRideConfirmations")
  const appRideReminders = formData.has("appRideReminders")
  const appMessages = formData.has("appMessages")

  const { error } = await supabaseAdmin
    .from("user_settings")
    .update({
      push_enabled: pushEnabled,
      email_ride_requests: emailRideRequests,
      email_ride_confirmations: emailRideConfirmations,
      email_ride_reminders: emailRideReminders,
      email_messages: emailMessages,
      email_marketing: emailMarketing,
      app_ride_requests: appRideRequests,
      app_ride_confirmations: appRideConfirmations,
      app_ride_reminders: appRideReminders,
      app_messages: appMessages,
    })
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/profile/settings")
  return { success: true }
}

export async function getUserSettings() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data: settings } = await supabaseAdmin.from("user_settings").select("*").eq("user_id", user.id).single()

  return settings
}

export async function getEnvironmentalImpact() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data: impact } = await supabaseAdmin.from("environmental_impact").select("*").eq("user_id", user.id).single()

  return impact
}
