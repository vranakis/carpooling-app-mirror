"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, PlaneIcon as PaperPlaneIcon, Phone } from "lucide-react"
import Link from "next/link"
import AppHeader from "@/components/app-header"
import { getMessages, sendMessage } from "@/lib/actions/messages"
import { useAuth } from "@/components/auth-provider"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useMobile } from "@/hooks/use-mobile"
import { PullToRefresh } from "@/components/pull-to-refresh"

export default function ConversationPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { profile } = useAuth()
  const searchParams = useSearchParams()
  const rideId = searchParams.get("ride")
  const isMobile = useMobile()

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await getMessages(params.id)
      setMessages(fetchedMessages || [])
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 10000)

    return () => clearInterval(interval)
  }, [params.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !profile) return

    setIsSending(true)
    try {
      await sendMessage(params.id, newMessage, rideId || undefined)

      // Optimistically update UI
      const newMsg = {
        id: Date.now().toString(),
        content: newMessage,
        sender_id: profile.id,
        recipient_id: params.id,
        ride_id: rideId || null,
        created_at: new Date().toISOString(),
        is_read: false,
        sender: {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
        },
        recipient: {
          id: params.id,
        },
      }

      setMessages([...messages, newMsg])
      setNewMessage("")
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleRefresh = async () => {
    try {
      await fetchMessages()
      toast.success("Messages updated!")
    } catch (error) {
      toast.error("Failed to refresh messages")
      console.error("Error refreshing messages:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center items-center h-[500px]">
              <div className="text-gray-500">Loading conversation...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Get the other user from the first message
  const otherUser =
    messages.length > 0
      ? messages[0].sender_id === profile?.id
        ? messages[0].recipient
        : messages[0].sender
      : { first_name: "User", last_name: "", avatar_url: null }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {!isMobile && (
            <Link href="/messages" className="flex items-center text-emerald-600 mb-4 text-sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to messages
            </Link>
          )}

          <Card className="flex flex-col h-[calc(100vh-180px)] md:h-[600px]">
            <div className="p-3 md:p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                {isMobile && (
                  <Link href="/messages" className="text-gray-500">
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                )}
                <Avatar>
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {otherUser.first_name?.[0]}
                    {otherUser.last_name?.[0]}
                  </AvatarFallback>
                  <AvatarImage src={otherUser.avatar_url || "/placeholder.svg?height=40&width=40"} />
                </Avatar>
                <div>
                  <div className="font-medium">
                    {otherUser.first_name} {otherUser.last_name?.[0]}.
                  </div>
                  {rideId && <div className="text-xs text-gray-500">Ride: {rideId}</div>}
                </div>
              </div>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Phone className="h-4 w-4 mr-2" /> Call
              </Button>
            </div>

            <PullToRefresh onRefresh={handleRefresh}>
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === profile?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-lg p-2 md:p-3 max-w-[85%] md:max-w-[80%] ${
                          message.sender_id === profile?.id
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm md:text-base">{message.content}</p>
                        <div
                          className={`text-xs mt-1 text-right ${
                            message.sender_id === profile?.id ? "text-emerald-600/70" : "text-gray-500"
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </PullToRefresh>

            <div className="p-3 md:p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  className="flex-1 text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={!newMessage.trim() || isSending}
                  size={isMobile ? "icon" : "default"}
                >
                  {isSending ? (
                    "..."
                  ) : isMobile ? (
                    <PaperPlaneIcon className="h-4 w-4" />
                  ) : (
                    <>
                      <PaperPlaneIcon className="h-4 w-4 mr-2" /> Send
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
