"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createRide } from "@/lib/actions/rides"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader } from "lucide-react"

export default function OfferRidePage() {
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      console.log("Submitting ride form...")

      const result = await createRide(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      console.log("Ride created successfully:", result.ride)
      toast.success("Ride created successfully!")

      // Redirect to my rides page with the offerings tab
      router.push("/my-rides?tab=offering")
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast.error(error.message || "Failed to create ride")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Offer a Ride</CardTitle>
            <CardDescription>Share your journey and help others travel sustainably</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin Address</Label>
                  <Input
                    id="origin"
                    name="origin"
                    placeholder="Enter departure address (e.g., Berlin Hauptbahnhof)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Address</Label>
                  <Input
                    id="destination"
                    name="destination"
                    placeholder="Enter arrival address (e.g., Munich Central Station)"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input id="departureTime" name="departureTime" type="datetime-local" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availableSeats">Available Seats</Label>
                  <Input
                    id="availableSeats"
                    name="availableSeats"
                    type="number"
                    min="1"
                    max="8"
                    defaultValue="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price per Seat (€)</Label>
                  <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue="0.00" required />
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating Ride...
                  </>
                ) : (
                  "Offer Ride"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Map Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Route Preview</CardTitle>
            <CardDescription>Map preview will be available soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 rounded-md border flex items-center justify-center bg-gray-50">
              <div className="text-center p-4">
                <p className="text-gray-600 mb-2">🗺️ Map Preview</p>
                <p className="text-sm text-gray-500">Interactive route mapping coming soon!</p>
                <p className="text-xs text-gray-400 mt-2">Your ride will still be created successfully</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
