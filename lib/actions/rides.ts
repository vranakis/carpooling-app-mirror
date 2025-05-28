"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "../supabase/server"
import { getCurrentUser } from "./auth"

export async function getPopularRides() {
  const { data: rides, error } = await supabaseAdmin
    .from("rides")
    .select(`
      *,
      profiles!rides_driver_id_fkey(id, first_name, last_name, avatar_url)
    `)
    .eq("status", "active")
    .order("departure_time", { ascending: true })
    .limit(5)

  if (error) {
    console.error("Error fetching popular rides:", error)
    return []
  }

  // Transform the data to match expected format
  return rides.map((ride) => ({
    ...ride,
    driver: ride.profiles,
  }))
}

export async function getRides(
  options: {
    limit?: number
    offset?: number
    status?: string
    origin?: string
    destination?: string
    date?: string
  } = {},
) {
  let query = supabaseAdmin.from("rides").select(`
      *,
      profiles!rides_driver_id_fkey(id, first_name, last_name, avatar_url)
    `)

  if (options.status) {
    query = query.eq("status", options.status)
  } else {
    query = query.eq("status", "active")
  }

  if (options.origin) {
    query = query.ilike("departure_location", `%${options.origin}%`)
  }

  if (options.destination) {
    query = query.ilike("destination", `%${options.destination}%`)
  }

  if (options.date) {
    const startDate = new Date(options.date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(options.date)
    endDate.setHours(23, 59, 59, 999)

    query = query.gte("departure_time", startDate.toISOString())
    query = query.lte("departure_time", endDate.toISOString())
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data: rides, error } = await query.order("departure_time", { ascending: true })

  if (error) {
    console.error("Error fetching rides:", error)
    return []
  }

  // Transform the data to match expected format
  return rides.map((ride) => ({
    ...ride,
    driver: ride.profiles,
  }))
}

export async function searchRides(formData: FormData) {
  const origin = formData.get("origin") as string
  const destination = formData.get("destination") as string
  const date = formData.get("date") as string

  return getRides({
    origin,
    destination,
    date,
  })
}

export async function createRide(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "You must be logged in to create a ride" }
    }

    console.log("Creating ride for user:", user.id)

    const origin = formData.get("origin") as string
    const destination = formData.get("destination") as string
    const departureTime = formData.get("departureTime") as string
    const availableSeats = Number.parseInt(formData.get("availableSeats") as string)
    const price = Number.parseFloat(formData.get("price") as string)

    console.log("Form data:", {
      origin,
      destination,
      departureTime,
      availableSeats,
      price,
    })

    // Validate required fields
    if (!origin || !destination || !departureTime || !availableSeats) {
      return { error: "Please fill in all required fields" }
    }

    // Only use columns that exist in the database
    const rideData = {
      driver_id: user.id,
      departure_location: origin,
      destination,
      departure_time: departureTime,
      available_seats: availableSeats,
      price: price,
      status: "active",
    }

    console.log("Inserting ride data:", rideData)

    const { data: ride, error } = await supabaseAdmin.from("rides").insert(rideData).select().single()

    if (error) {
      console.error("Error creating ride:", error)
      return { error: error.message }
    }

    console.log("Ride created successfully:", ride)

    // Revalidate relevant paths
    revalidatePath("/")
    revalidatePath("/my-rides")
    revalidatePath("/available-rides")

    return { success: true, ride }
  } catch (error: any) {
    console.error("Unexpected error creating ride:", error)
    return { error: error.message || "Failed to create ride" }
  }
}

export async function getRideById(id: string) {
  const { data: ride, error } = await supabaseAdmin
    .from("rides")
    .select(`
      *,
      profiles!rides_driver_id_fkey(id, first_name, last_name, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching ride:", error)
    return null
  }

  return {
    ...ride,
    driver: ride.profiles,
  }
}

export async function getUserRides() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  console.log("Fetching rides for user:", user.id)

  const { data: rides, error } = await supabaseAdmin
    .from("rides")
    .select(`*`)
    .eq("driver_id", user.id)
    .order("departure_time", { ascending: false })

  if (error) {
    console.error("Error fetching user rides:", error)
    return []
  }

  console.log("Found rides:", rides?.length || 0)
  return rides || []
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
      rides!bookings_ride_id_fkey(
        id,
        departure_location,
        destination,
        departure_time,
        price,
        profiles!rides_driver_id_fkey(id, first_name, last_name, avatar_url)
      )
    `)
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }

  // Transform the data to match expected format
  return bookings.map((booking) => ({
    ...booking,
    ride: {
      ...booking.rides,
      driver_id: booking.rides.profiles,
    },
  }))
}
