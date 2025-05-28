"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "../supabase/server"
import { getCurrentUser } from "./auth"

export async function bookRide(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to book a ride" }
  }

  const rideId = formData.get("rideId") as string
  const seatsBooked = Number.parseInt(formData.get("seatsBooked") as string)

  // Check if ride exists and has enough seats
  const { data: ride, error: rideError } = await supabaseAdmin
    .from("rides")
    .select("available_seats, driver_id")
    .eq("id", rideId)
    .single()

  if (rideError) {
    return { error: "Ride not found" }
  }

  if (ride.driver_id === user.id) {
    return { error: "You cannot book your own ride" }
  }

  if (ride.available_seats < seatsBooked) {
    return { error: "Not enough seats available" }
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .insert({
      ride_id: rideId,
      passenger_id: user.id,
      seats_booked: seatsBooked,
      status: "confirmed",
    })
    .select()
    .single()

  if (bookingError) {
    return { error: bookingError.message }
  }

  // Update available seats
  const { error: updateError } = await supabaseAdmin
    .from("rides")
    .update({
      available_seats: ride.available_seats - seatsBooked,
    })
    .eq("id", rideId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath(`/ride/${rideId}`)
  return { success: true, booking }
}

export async function getUserBookings() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      *,
      ride:ride_id(
        id,
        origin,
        destination,
        departure_time,
        estimated_arrival_time,
        price,
        driver:driver_id(id, first_name, last_name, avatar_url)
      )
    `)
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }

  return bookings
}

export async function cancelBooking(id: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to cancel a booking" }
  }

  // Get booking details
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("ride_id, seats_booked, passenger_id")
    .eq("id", id)
    .single()

  if (bookingError) {
    return { error: "Booking not found" }
  }

  if (booking.passenger_id !== user.id) {
    return { error: "You can only cancel your own bookings" }
  }

  // Get ride details
  const { data: ride, error: rideError } = await supabaseAdmin
    .from("rides")
    .select("available_seats")
    .eq("id", booking.ride_id)
    .single()

  if (rideError) {
    return { error: "Ride not found" }
  }

  // Update booking status
  const { error: updateBookingError } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "cancelled",
    })
    .eq("id", id)

  if (updateBookingError) {
    return { error: updateBookingError.message }
  }

  // Update available seats
  const { error: updateRideError } = await supabaseAdmin
    .from("rides")
    .update({
      available_seats: ride.available_seats + booking.seats_booked,
    })
    .eq("id", booking.ride_id)

  if (updateRideError) {
    return { error: updateRideError.message }
  }

  revalidatePath("/my-bookings")
  return { success: true }
}

// Add the missing exports
export async function createBooking(data: {
  ride_id: string
  passenger_id: string
  seats_booked: number
  status?: string
}) {
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .insert({
      ride_id: data.ride_id,
      passenger_id: data.passenger_id,
      seats_booked: data.seats_booked,
      status: data.status || "confirmed",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating booking:", error)
    return { error: error.message }
  }

  return { success: true, booking }
}

export async function updateBookingStatus(id: string, status: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "You must be logged in to update a booking" }
  }

  // Get booking details
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("ride_id, passenger_id")
    .eq("id", id)
    .single()

  if (bookingError) {
    return { error: "Booking not found" }
  }

  // Check if user is the passenger or the driver of the ride
  const { data: ride, error: rideError } = await supabaseAdmin
    .from("rides")
    .select("driver_id")
    .eq("id", booking.ride_id)
    .single()

  if (rideError) {
    return { error: "Ride not found" }
  }

  if (booking.passenger_id !== user.id && ride.driver_id !== user.id) {
    return { error: "You can only update bookings you're involved in" }
  }

  // Update booking status
  const { error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({
      status,
    })
    .eq("id", id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath(`/ride/${booking.ride_id}`)
  return { success: true }
}
