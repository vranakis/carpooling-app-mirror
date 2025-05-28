import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppHeader from "@/components/app-header"
import Link from "next/link"
import { getNotifications, markAllNotificationsAsRead } from "@/lib/actions/notifications"
import { format, formatDistanceToNow } from "date-fns"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
  const notifications = await getNotifications()

  if (!notifications) {
    redirect("/auth/login?redirect=/notifications")
  }

  const unreadNotifications = notifications.filter((notification) => !notification.is_read)
  const readNotifications = notifications.filter((notification) => notification.is_read)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <form action={markAllNotificationsAsRead}>
              <Button variant="outline" size="sm" type="submit" disabled={unreadNotifications.length === 0}>
                Mark all as read
              </Button>
            </form>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No notifications</div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No unread notifications</div>
              )}
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              {readNotifications.length > 0 ? (
                readNotifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No read notifications</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function NotificationCard({ notification }: { notification: any }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "request":
        return "bg-blue-100 text-blue-800"
      case "confirmation":
        return "bg-emerald-100 text-emerald-800"
      case "reminder":
        return "bg-amber-100 text-amber-800"
      case "message":
        return "bg-purple-100 text-purple-800"
      case "completion":
        return "bg-gray-100 text-gray-800"
      case "cancellation":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "request":
        return "Request"
      case "confirmation":
        return "Confirmation"
      case "reminder":
        return "Reminder"
      case "message":
        return "Message"
      case "completion":
        return "Completion"
      case "cancellation":
        return "Cancellation"
      default:
        return "Notification"
    }
  }

  const getRelativeTime = (date: string) => {
    const now = new Date()
    const notificationDate = new Date(date)

    // If it's today, show the time
    if (notificationDate.toDateString() === now.toDateString()) {
      return format(notificationDate, "h:mm a")
    }

    // If it's within the last 7 days, show relative time
    if (now.getTime() - notificationDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(notificationDate, { addSuffix: true })
    }

    // Otherwise, show the date
    return format(notificationDate, "MMM d, yyyy")
  }

  return (
    <Card className={notification.is_read ? "bg-white" : "bg-blue-50 border-blue-100"}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(notification.type)}`}>
            {getTypeLabel(notification.type)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{notification.title}</h3>
              <span className="text-xs text-gray-500">{getRelativeTime(notification.created_at)}</span>
            </div>
            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
            <div className="mt-3">
              {notification.related_id && (
                <Link
                  href={`/ride/${notification.related_id}`}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View details
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
