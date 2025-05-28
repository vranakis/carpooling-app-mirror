"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { bookRide } from "@/lib/actions/bookings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function BookRidePage({ params }: { params: { id: string } }) {
  const [seatsBooked, setSeatsBooked] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("rideId", params.id)
      formData.append("seatsBooked", seatsBooked.toString())

      const result = await bookRide(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Ride booked successfully!")
      router.push("/my-bookings")
    } catch (error: any) {
      toast.error(error.message || "Failed to book ride")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/ride/${params.id}`} className="flex items-center text-emerald-600 mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to ride details
      </Link>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Book your seat</CardTitle>
          <CardDescription>Confirm your booking details</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seatsBooked">Number of seats</Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSeatsBooked(Math.max(1, seatsBooked - 1))}
                  disabled={seatsBooked <= 1}
                >
                  -
                </Button>
                <div className="w-12 text-center">{seatsBooked}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSeatsBooked(Math.min(10, seatsBooked + 1))}
                  disabled={seatsBooked >= 10}
                >
                  +
                </Button>
                <div className="ml-2 flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">Select how many seats you need</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message to driver (optional)</Label>
              <Input id="message" name="message" placeholder="Any special requests or information" />
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>Price per seat:</span>
                <span className="font-medium">$10.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Number of seats:</span>
                <span className="font-medium">{seatsBooked}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${(10 * seatsBooked).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
              {isLoading ? "Booking..." : "Confirm Booking"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
