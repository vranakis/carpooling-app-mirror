"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "../supabase/server"
import { getCurrentUser } from "./auth"
import { calculateRoute, type PlaceDetails } from "./google-maps"

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

    // Get place data if available
    const originPlaceId = formData.get("originPlaceId") as string
    const destinationPlaceId = formData.get("destinationPlaceId") as string
    const originCoordinates = formData.get("originCoordinates") as string
    const destinationCoordinates = formData.get("destinationCoordinates") as string
    const originFormatted = formData.get("originFormatted") as string
    const destinationFormatted = formData.get("destinationFormatted") as string

    // Fallback to basic text inputs if place data not available
    const origin = originFormatted || (formData.get("origin") as string)
    const destination = destinationFormatted || (formData.get("destination") as string)
    
    const departureTime = formData.get("departureTime") as string
    const availableSeats = Number.parseInt(formData.get("availableSeats") as string)
    const price = Number.parseFloat(formData.get("price") as string)

    console.log("Form data:", {
      origin,
      destination,
      departureTime,
      availableSeats,
      price,
      hasPlaceData: !!originPlaceId && !!destinationPlaceId
    })

    // Validate required fields
    if (!origin || !destination || !departureTime || !availableSeats) {
      return { error: "Please fill in all required fields" }
    }

    // Parse coordinates if available
    let originCoords = null
    let destinationCoords = null
    let routeInfo = null

    if (originCoordinates && destinationCoordinates) {
      try {
        originCoords = JSON.parse(originCoordinates)
        destinationCoords = JSON.parse(destinationCoordinates)

        // Calculate route if we have place data
        if (originPlaceId && destinationPlaceId) {
          const originPlace: PlaceDetails = {
            placeId: originPlaceId,
            address: origin,
            coordinates: originCoords,
            formattedAddress: originFormatted
          }

          const destinationPlace: PlaceDetails = {
            placeId: destinationPlaceId,
            address: destination,
            coordinates: destinationCoords,
            formattedAddress: destinationFormatted
          }

          routeInfo = await calculateRoute(originPlace, destinationPlace)
        }
      } catch (error) {
        console.error("Error parsing coordinates:", error)
      }
    }

    // Calculate estimated arrival time if we have route info
    let estimatedArrivalTime = departureTime
    if (routeInfo) {
      const departureDate = new Date(departureTime)
      const arrivalDate = new Date(departureDate.getTime() + routeInfo.durationValue * 1000)
      estimatedArrivalTime = arrivalDate.toISOString()
    }

    // Prepare ride data with new fields
    const rideData = {
      driver_id: user.id,
      origin: origin,
      destination: destination,
      departure_time: departureTime,
      estimated_arrival_time: estimatedArrivalTime,
      available_seats: availableSeats,
      price: price,
      status: "active",
      // Add new fields if database supports them
      ...(originPlaceId && { origin_place_id: originPlaceId }),
      ...(destinationPlaceId && { destination_place_id: destinationPlaceId }),
      ...(originCoords && { origin_coordinates: `POINT(${originCoords.lng} ${originCoords.lat})` }),
      ...(destinationCoords && { destination_coordinates: `POINT(${destinationCoords.lng} ${destinationCoords.lat})` }),
      ...(routeInfo && {
        route_distance: routeInfo.distanceValue,
        route_duration: routeInfo.durationValue,
        route_polyline: routeInfo.polyline
      })
    }

    console.log("Inserting ride data:", rideData)

    const { data: ride, error } = await supabaseAdmin!.from("rides").insert(rideData).select().single()

    if (error) {
      console.error("Error creating ride:", error)
      return { error: error.message }
    }

    console.log("Ride created successfully:", ride)

    // Revalidate relevant paths
    revalidatePath("/")
    revalidatePath("/my-rides")
    revalidatePath("/available-rides")

    return { success: true, ride, routeInfo }
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
