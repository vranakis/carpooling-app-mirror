"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { updateBookingStatus } from "@/lib/actions/bookings"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ManageBookingActions({ bookingId }: { bookingId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    const result = await updateBookingStatus(bookingId, "confirmed")
    setIsLoading(false)
    setIsConfirmDialogOpen(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Booking confirmed successfully")
  }

  const handleReject = async () => {
    setIsLoading(true)
    const result = await updateBookingStatus(bookingId, "cancelled")
    setIsLoading(false)
    setIsRejectDialogOpen(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Booking rejected successfully")
  }

  return (
    <div className="flex gap-2">
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
            Accept
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this booking request? The passenger will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isLoading ? "Confirming..." : "Yes, confirm booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
            Decline
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this booking request? The passenger will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={isLoading} className="bg-red-500 hover:bg-red-600">
              {isLoading ? "Declining..." : "Yes, decline booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
