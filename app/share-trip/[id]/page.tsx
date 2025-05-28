"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Copy, Mail, MessageSquare, Share2 } from "lucide-react"
import Link from "next/link"
import AppHeader from "@/components/app-header"

export default function ShareTripPage({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)

  // This would come from your database in a real app
  const tripData = {
    id: params.id,
    origin: "Glyfada",
    destination: "Syntagma Square",
    date: "May 25, 2025",
    time: "8:30 AM",
    driver: {
      name: "John Doe",
      phone: "+30 694 123 4567",
      vehicle: "Tesla Model 3 (White)",
    },
  }

  const shareUrl = `https://rideshare.example.com/track/${tripData.id}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailShare = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate sending email
    setEmailSent(true)
    setTimeout(() => setEmailSent(false), 3000)
  }

  const handleSmsShare = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate sending SMS
    setSmsSent(true)
    setTimeout(() => setSmsSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href={`/tracking/${params.id}`} className="flex items-center text-emerald-600 mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to tracking
          </Link>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Share2 className="h-6 w-6 text-emerald-500" />
                <CardTitle>Share your trip</CardTitle>
              </div>
              <CardDescription>Share your trip details with friends or family for added safety</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">Trip details</h3>
                <div className="space-y-1 text-blue-700">
                  <p>
                    <span className="font-medium">From:</span> {tripData.origin}
                  </p>
                  <p>
                    <span className="font-medium">To:</span> {tripData.destination}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {tripData.date}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {tripData.time}
                  </p>
                  <p>
                    <span className="font-medium">Driver:</span> {tripData.driver.name}
                  </p>
                  <p>
                    <span className="font-medium">Vehicle:</span> {tripData.driver.vehicle}
                  </p>
                </div>
              </div>

              <Tabs defaultValue="link" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="link">Copy Link</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                </TabsList>

                <TabsContent value="link" className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="flex-1" />
                    <Button onClick={copyToClipboard} className="bg-emerald-500 hover:bg-emerald-600">
                      {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    This link allows anyone to view your real-time trip progress and details. Only share with people you
                    trust.
                  </p>
                </TabsContent>

                <TabsContent value="email">
                  <form onSubmit={handleEmailShare} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" type="email" placeholder="friend@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message (optional)</Label>
                      <Input id="message" placeholder="I'm sharing my trip details with you for safety" />
                    </div>
                    <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
                      {emailSent ? (
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" /> Email sent!
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" /> Send email
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="sms">
                  <form onSubmit={handleSmsShare} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" type="tel" placeholder="+30 69XXXXXXXX" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms-message">Message (optional)</Label>
                      <Input id="sms-message" placeholder="I'm sharing my trip details with you for safety" />
                    </div>
                    <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
                      {smsSent ? (
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" /> SMS sent!
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" /> Send SMS
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Sharing your trip details helps keep you safe by letting trusted contacts know where you are.
            </p>
            <Button asChild variant="outline">
              <Link href="/safety">Learn more about safety features</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
