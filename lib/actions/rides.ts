"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "../supabase/server"
import { getCurrentUser } from "./auth"
import { calculateRoute, type PlaceDetails } from "./google-maps"

export async function getPopularRides() {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not available")
    return []
  }

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
  if (!supabaseAdmin) {
    console.error("Supabase admin client not available")
    return []
  }

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
  const origin = formData.get("origin") as string;
  const destination = formData.get("destination") as string;
  const date = formData.get("date") as string;
  const originPlaceId = formData.get("originPlaceId") as string;
  const destinationPlaceId = formData.get("destinationPlaceId") as string;

  console.log("Search parameters:", { origin, destination, date, originPlaceId, destinationPlaceId });

  // For debugging, get all active rides ignoring date filter to ensure we don't miss matches
  const rides = await getRides({
    status: "active",
  });

  console.log(`Found ${rides.length} active rides (ignoring date filter for debugging).`);
  console.log(`Search date provided: ${date}`);

  if (!originPlaceId || !destinationPlaceId) {
    // Fallback to basic string matching if place IDs are not available
    console.log("Falling back to string matching as place IDs are not provided.");
    const filteredRides = rides.filter(ride => {
      const departureLocation = ride.departure_location || '';
      const rideDestination = ride.destination || '';
      const originLower = origin || '';
      const destinationLower = destination || '';
      // More lenient matching: check if either string contains parts of the other
      const originMatch = departureLocation.toLowerCase().includes(originLower.toLowerCase()) || 
                          originLower.toLowerCase().includes(departureLocation.toLowerCase());
      const destMatch = rideDestination.toLowerCase().includes(destinationLower.toLowerCase()) || 
                        destinationLower.toLowerCase().includes(rideDestination.toLowerCase());
      const matches = originMatch && destMatch;
      if (!matches) {
        console.log(`Ride ${ride.id} does not match string criteria: ${departureLocation} -> ${rideDestination} (searching for: ${originLower} -> ${destinationLower})`);
      } else {
        console.log(`Ride ${ride.id} matches string criteria: ${departureLocation} -> ${rideDestination}`);
      }
      return matches;
    });
    console.log(`String matching resulted in ${filteredRides.length} matches out of ${rides.length} rides.`);
    return filteredRides;
  } else {
    console.log("Place IDs provided, proceeding with Routes API matching:", { originPlaceId, destinationPlaceId });
  }

  const matchedRides = [];
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is missing. Falling back to returning all filtered rides by date.");
    return rides;
  }

  console.log("Using Routes API for precise matching with place IDs.");
  for (const ride of rides) {
    // Skip if place IDs are missing for the ride
    if (!ride.origin_place_id || !ride.destination_place_id) {
      console.log(`Skipping ride ${ride.id} due to missing place IDs.`);
      continue;
    }

    try {
      console.log(`Computing route for ride ${ride.id} with passenger waypoints.`);
      // Use Routes API to check if rider's points fit driver's route
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
          },
          body: JSON.stringify({
            origin: { placeId: ride.origin_place_id },
            destination: { placeId: ride.destination_place_id },
            intermediates: [
              { placeId: originPlaceId }, // Rider's pickup
              { placeId: destinationPlaceId }, // Rider's drop-off
            ],
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
          }),
        }
      );

      if (!response.ok) {
        console.error(`Routes API error for ride ${ride.id}: ${response.status} - ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const route = data.routes[0];

      if (!route) {
        console.log(`No route found for ride ${ride.id} with passenger waypoints.`);
        continue;
      }

      // Get baseline duration (driver's original route without rider)
      console.log(`Computing baseline route for ride ${ride.id} without passenger waypoints.`);
      const baselineResponse = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.duration",
          },
          body: JSON.stringify({
            origin: { placeId: ride.origin_place_id },
            destination: { placeId: ride.destination_place_id },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
          }),
        }
      );

      if (!baselineResponse.ok) {
        console.error(`Baseline Routes API error for ride ${ride.id}: ${baselineResponse.status} - ${baselineResponse.statusText}`);
        continue;
      }

      const baselineData = await baselineResponse.json();
      const baselineRoute = baselineData.routes[0];

      if (!baselineRoute) {
        console.log(`No baseline route found for ride ${ride.id}.`);
        continue;
      }

      // Calculate detour time
      const detourSeconds = parseInt(route.duration.replace("s", "")) - parseInt(baselineRoute.duration.replace("s", ""));
      const maxDetourSeconds = 900; // 15 minutes
      console.log(`Detour for ride ${ride.id}: ${detourSeconds} seconds (max allowed: ${maxDetourSeconds} seconds).`);

      if (detourSeconds <= maxDetourSeconds) {
        console.log(`Ride ${ride.id} matches with acceptable detour of ${detourSeconds} seconds.`);
        matchedRides.push({
          ...ride,
          detourDuration: detourSeconds,
          totalDuration: parseInt(route.duration.replace("s", "")),
          totalDistance: route.distanceMeters,
        });
      } else {
        console.log(`Ride ${ride.id} excluded due to excessive detour of ${detourSeconds} seconds.`);
      }
    } catch (error) {
      console.error(`Error processing ride ${ride.id}:`, error);
      continue;
    }
  }

  console.log(`Route matching completed. Found ${matchedRides.length} matching rides out of ${rides.length} candidates.`);
  return matchedRides;
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
      departure_location: origin, // Use departure_location for the required field
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

    if (!supabaseAdmin) {
      return { error: "Database connection not available" }
    }

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

    return { success: true, ride, routeInfo }
  } catch (error: any) {
    console.error("Unexpected error creating ride:", error)
    return { error: error.message || "Failed to create ride" }
  }
}

export async function getRideById(id: string) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not available")
    return null
  }

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
    origin: ride.departure_location,
    driver: ride.profiles,
  }
}

export async function getUserRides() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  if (!supabaseAdmin) {
    console.error("Supabase admin client not available")
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

  if (!supabaseAdmin) {
    console.error("Supabase admin client not available")
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
