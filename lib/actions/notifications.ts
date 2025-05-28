"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "../supabase/server"
import { getCurrentUser } from "./auth"

export async function getNotifications() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const { data: notifications } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return notifications || []
}

export async function getUnreadNotificationsCount() {
  const user = await getCurrentUser()

  if (!user) {
    return 0
  }

  const { count } = await supabaseAdmin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  return count || 0
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to mark a notification as read" }
  }

  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to mark all notifications as read" }
  }

  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { success: true }
}
