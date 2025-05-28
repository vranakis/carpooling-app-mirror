"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notifications"
import { useAuth } from "./auth-provider"

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return

      try {
        const count = await getUnreadNotificationsCount()
        setUnreadCount(count || 0)

        if (open) {
          const notifs = await getNotifications()
          setNotifications(notifs || [])
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Set up polling for new notifications
    const interval = setInterval(() => {
      if (user) {
        getUnreadNotificationsCount().then((count) => setUnreadCount(count || 0))
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user, open])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        ),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-base">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-8">
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-0 focus:bg-gray-100"
                onSelect={(e) => {
                  e.preventDefault()
                  handleMarkAsRead(notification.id)
                }}
              >
                <Link
                  href={notification.related_id ? `/ride/${notification.related_id}` : "/notifications"}
                  className="flex items-start p-4 gap-3 w-full"
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${notification.is_read ? "bg-gray-300" : "bg-emerald-500"}`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-medium ${notification.is_read ? "text-gray-700" : "text-black"}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className={`text-sm ${notification.is_read ? "text-gray-500" : "text-gray-700"}`}>
                      {notification.message}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">No notifications yet</div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="p-0 focus:bg-gray-100">
          <Link href="/notifications" className="w-full p-4 text-center text-sm text-emerald-600">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
