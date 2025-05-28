"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import AppHeader from "@/components/app-header"
import { getConversations } from "@/lib/actions/messages"
import { useRouter } from "next/navigation"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { profile } = useAuth()

  const fetchConversations = async () => {
    try {
      if (!profile) {
        router.push("/auth/login?redirect=/messages")
        return
      }

      const fetchedConversations = await getConversations()
      setConversations(fetchedConversations || [])
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [profile, router])

  const handleRefresh = async () => {
    try {
      await fetchConversations()
      toast.success("Messages updated!")
    } catch (error) {
      toast.error("Failed to refresh messages")
      console.error("Error refreshing messages:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Messages</h1>

          <PullToRefresh onRefresh={handleRefresh}>
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-6">
              {/* Conversation List */}
              <div className="space-y-3 md:space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" placeholder="Search conversations..." />
                </div>

                <Card className="overflow-hidden">
                  <div className="divide-y">
                    {loading ? (
                      // Loading skeleton
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="p-3 animate-pulse">
                            <div className="flex gap-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                  <div className="h-3 w-10 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-3 w-full bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : conversations.length > 0 ? (
                      conversations.map((conversation) => (
                        <Link
                          key={conversation.id}
                          href={`/messages/${conversation.id}`}
                          className={`block p-3 hover:bg-gray-50 cursor-pointer ${
                            conversation.unreadCount > 0 ? "bg-emerald-50 hover:bg-emerald-50/80" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {conversation.user.first_name?.[0]}
                                {conversation.user.last_name?.[0]}
                              </AvatarFallback>
                              <AvatarImage
                                src={conversation.user.avatar_url || "/placeholder.svg?height=40&width=40"}
                              />
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <div className="font-medium truncate">
                                  {conversation.user.first_name} {conversation.user.last_name?.[0]}.
                                </div>
                                <div className="text-xs text-gray-500 ml-2 shrink-0">
                                  {new Date(conversation.lastMessage.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                              <div
                                className={`text-sm truncate ${
                                  conversation.unreadCount > 0 ? "font-medium text-emerald-700" : "text-gray-600"
                                }`}
                              >
                                {conversation.lastMessage.content}
                              </div>
                              {conversation.lastMessage.ride_id && (
                                <div className="text-xs text-gray-500 mt-1 truncate">
                                  Ride: {conversation.lastMessage.ride_id}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No conversations yet</div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Empty State - Only show on desktop */}
              <Card className="hidden md:flex flex-col items-center justify-center h-[600px] p-6 text-center">
                <div className="mb-6">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
                <p className="text-gray-500 mb-6 max-w-md">
                  Choose a conversation from the list to view messages or start a new conversation with a ride
                  participant
                </p>
                <Button variant="outline">Start a new conversation</Button>
              </Card>
            </div>
          </PullToRefresh>
        </div>
      </main>
    </div>
  )
}
