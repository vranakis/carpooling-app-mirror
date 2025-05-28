import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import AppHeader from "@/components/app-header"
import Link from "next/link"

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/profile" className="text-emerald-600 mb-6 inline-block">
            ← Back to profile
          </Link>

          <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Receive notifications on your device even when you're not using the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-enabled" className="flex flex-col space-y-1">
                  <span>Enable push notifications</span>
                  <span className="font-normal text-sm text-gray-500">Receive notifications on your device</span>
                </Label>
                <Switch id="push-enabled" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose which types of email notifications you'd like to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-ride-requests" className="flex flex-col space-y-1">
                  <span>Ride requests</span>
                  <span className="font-normal text-sm text-gray-500">When someone requests to join your ride</span>
                </Label>
                <Switch id="email-ride-requests" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-ride-confirmations" className="flex flex-col space-y-1">
                  <span>Ride confirmations</span>
                  <span className="font-normal text-sm text-gray-500">
                    When your ride request is accepted or confirmed
                  </span>
                </Label>
                <Switch id="email-ride-confirmations" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-ride-reminders" className="flex flex-col space-y-1">
                  <span>Ride reminders</span>
                  <span className="font-normal text-sm text-gray-500">Reminders about upcoming rides</span>
                </Label>
                <Switch id="email-ride-reminders" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-messages" className="flex flex-col space-y-1">
                  <span>New messages</span>
                  <span className="font-normal text-sm text-gray-500">When you receive a new message</span>
                </Label>
                <Switch id="email-messages" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-marketing" className="flex flex-col space-y-1">
                  <span>Marketing emails</span>
                  <span className="font-normal text-sm text-gray-500">News, updates, and promotions</span>
                </Label>
                <Switch id="email-marketing" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>Choose which types of in-app notifications you'd like to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="app-ride-requests" className="flex flex-col space-y-1">
                  <span>Ride requests</span>
                  <span className="font-normal text-sm text-gray-500">When someone requests to join your ride</span>
                </Label>
                <Switch id="app-ride-requests" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="app-ride-confirmations" className="flex flex-col space-y-1">
                  <span>Ride confirmations</span>
                  <span className="font-normal text-sm text-gray-500">
                    When your ride request is accepted or confirmed
                  </span>
                </Label>
                <Switch id="app-ride-confirmations" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="app-ride-reminders" className="flex flex-col space-y-1">
                  <span>Ride reminders</span>
                  <span className="font-normal text-sm text-gray-500">Reminders about upcoming rides</span>
                </Label>
                <Switch id="app-ride-reminders" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="app-messages" className="flex flex-col space-y-1">
                  <span>New messages</span>
                  <span className="font-normal text-sm text-gray-500">When you receive a new message</span>
                </Label>
                <Switch id="app-messages" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button className="bg-emerald-500 hover:bg-emerald-600">Save preferences</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
