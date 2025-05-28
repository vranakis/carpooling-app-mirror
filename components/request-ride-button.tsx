"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createBooking } from "@/lib/actions/bookings"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "./auth-provider"

export default function RequestRideButton({ rideId, seatsAvailable }: { rideId: string; seatsAvailable: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleRequest = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/ride/${rideId}`)
      return
    }

    setIsLoading(true)
    const result = await createBooking(rideId)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Ride request sent successfully!")
    router.push("/my-rides")
  }

  return (
    <Button
      className="w-full mb-3 bg-emerald-500 hover:bg-emerald-600"
      onClick={handleRequest}
      disabled={isLoading || seatsAvailable < 1}
    >
      {isLoading ? "Sending request..." : seatsAvailable < 1 ? "No seats available" : "Request to join ride"}
    </Button>
  )
}
