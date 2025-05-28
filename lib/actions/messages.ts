"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "../supabase/server"
import { getCurrentUser } from "./auth"

export async function sendMessage(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to send a message" }
  }

  const recipientId = formData.get("recipientId") as string
  const rideId = formData.get("rideId") as string
  const content = formData.get("content") as string

  if (!content.trim()) {
    return { error: "Message cannot be empty" }
  }

  const { data: message, error } = await supabaseAdmin
    .from("messages")
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      ride_id: rideId,
      content,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/messages/${recipientId}?ride=${rideId}`)
  return { success: true, message }
}

export async function getConversations() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  // Get the most recent message from each conversation
  const { data: conversations, error } = await supabaseAdmin.rpc("get_user_conversations", {
    user_id: user.id,
  })

  if (error) {
    console.error("Error fetching conversations:", error)
    return []
  }

  return conversations || []
}

export async function getMessages(recipientId: string, rideId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const { data: messages, error } = await supabaseAdmin
    .from("messages")
    .select(`
      *,
      sender:sender_id(id, first_name, last_name, avatar_url),
      recipient:recipient_id(id, first_name, last_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
    .eq("ride_id", rideId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }

  // Mark messages as read
  await supabaseAdmin
    .from("messages")
    .update({ is_read: true })
    .eq("recipient_id", user.id)
    .eq("sender_id", recipientId)
    .eq("ride_id", rideId)
    .eq("is_read", false)

  return messages
}
