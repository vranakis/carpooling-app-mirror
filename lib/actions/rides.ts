"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../supabase/server";
import { getCurrentUser } from "./auth";
import {
  calculateRoute,
  type PlaceDetails,
  getGoogleMapsApiKey,
} from "./google-maps";
import { loadGoogleMaps, isGoogleMapsLoaded } from "@/lib/google-maps-loader";

export async function getPopularRides() {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not available");
    return [];
  }

  const { data: rides, error } = await supabaseAdmin
    .from("rides")
    .select(
      `
      *,
      profiles!rides_driver_id_fkey(id, first_name, last_name, avatar_url)
    `
    )
    .eq("status", "active")
    .order("departure_time", { ascending: true })
    .limit(5);

  if (error) {
    console.error("Error fetching popular rides:", error);
    return [];
  }

  return rides.map((ride) => ({
    ...ride,
    driver: ride.profiles,
  }));
}

export async function getRides(
  options: {
    limit?: number;
    offset?: number;
    status?: string;
    origin?: string;
    destination?: string;
    date?: string;
  } = {}
) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not available");
    return [];
  }

  let query = supabaseAdmin.from("rides").select(`
      *,
      profiles!rides_driver_id_fkey(id, first_name, last_name, avatar_url)
    `);

  if (options.status) {
    query = query.eq("status", options.status);
  } else {
    query = query.eq("status", "active");
  }

  if (options.origin) {
    query = query.ilike("departure_location", `%${options.origin}%`);
  }

  if (options.destination) {
    query = query.ilike("destination", `%${options.destination}%`);
  }

  if (options.date) {
    const startDate = new Date(options.date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(options.date);
    endDate.setHours(23, 59, 59, 999);

    query = query.gte("departure_time", startDate.toISOString());
    query = query.lte("departure_time", endDate.toISOString());
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data: rides, error } = await query.order("departure_time", {
    ascending: true,
  });

  if (error) {
    console.error("Error fetching rides:", error);
    return [];
  }

  return rides.map((ride) => ({
    ...ride,
    driver: ride.profiles,
  }));
}

export async function searchRides(formData: FormData) {
  const origin = formData.get("origin")?.toString();
  const destination = formData.get("destination")?.toString();
  const date = formData.get("date")?.toString();
  const originPlaceId = formData.get("originPlaceId")?.toString();
  const destinationPlaceId = formData.get("destinationPlaceId")?.toString();

  console.log("Search parameters:", {
    origin,
    destination,
    date,
    originPlaceId,
    destinationPlaceId,
  });

  // Fetch all active rides, optionally filtered by date
  const rides = await getRides({
    status: "active",
    date,
  });

  console.log(
    `Found ${rides.length} active rides${date ? ` for date ${date}` : ""}.`
  );

  if (!origin || !destination || !originPlaceId || !destinationPlaceId) {
    console.log(
      "Missing origin, destination, or place IDs. Falling back to string matching."
    );
    const filteredRides = rides.filter((ride) => {
      const departureLocation = ride.departure_location || "";
      const rideDestination = ride.destination || "";
      const originLower = origin?.toLowerCase() || "";
      const destinationLower = destination?.toLowerCase() || "";
      const originMatch =
        departureLocation.toLowerCase().includes(originLower) ||
        originLower.includes(departureLocation.toLowerCase());
      const destMatch =
        rideDestination.toLowerCase().includes(destinationLower) ||
        destinationLower.includes(rideDestination.toLowerCase());
      const matches = originMatch && destMatch;
      console.log(
        `Ride ${ride.id} ${
          matches ? "matches" : "does not match"
        } string criteria: ${departureLocation} -> ${rideDestination}`
      );
      return matches;
    });
    console.log(`String matching resulted in ${filteredRides.length} matches.`);
    return filteredRides;
  }

  // Load Google Maps API
  await loadGoogleMaps();
  if (!isGoogleMapsLoaded()) {
    console.error(
      "Google Maps API not loaded. Falling back to string matching."
    );
    return rides;
  }

  const apiKey = await getGoogleMapsApiKey();
  if (!apiKey) {
    console.error(
      "Google Maps API key missing. Falling back to string matching."
    );
    return rides;
  }

  // Geocode passenger origin and destination
  let passengerOrigin: PlaceDetails;
  let passengerDestination: PlaceDetails;
  try {
    passengerOrigin = await geocodeAddress(origin, apiKey);
    passengerDestination = await geocodeAddress(destination, apiKey);
    console.log("Passenger coordinates:", {
      origin: passengerOrigin.coordinates,
      destination: passengerDestination.coordinates,
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return rides; // Fallback to all rides
  }

  const matchedRides = [];
  for (const ride of rides) {
    if (!ride.origin_place_id || !ride.destination_place_id) {
      console.log(`Skipping ride ${ride.id} due to missing place IDs.`);
      continue;
    }

    try {
      // Fetch route segments (waypoints)
      const { data: segmentsData, error: segmentsError } = await supabaseAdmin
        .from("route_segments")
        .select(
          "start_place_id, start_coordinates, end_place_id, end_coordinates, segment_order"
        )
        .eq("ride_id", ride.id)
        .order("segment_order", { ascending: true });

      if (segmentsError) {
        console.error(
          `Error fetching route segments for ride ${ride.id}:`,
          segmentsError
        );
        continue;
      }

      // Convert segments to waypoints
      const waypoints: PlaceDetails[] = [];
      if (segmentsData && segmentsData.length > 0) {
        for (const segment of segmentsData) {
          if (segment.start_place_id && segment.start_coordinates) {
            waypoints.push({
              placeId: segment.start_place_id,
              address: "",
              coordinates: await parsePoint(segment.start_coordinates),
              formattedAddress: "",
            });
          }
          if (segment.end_place_id && segment.end_coordinates) {
            waypoints.push({
              placeId: segment.end_place_id,
              address: "",
              coordinates: await parsePoint(segment.end_coordinates),
              formattedAddress: "",
            });
          }
        }
      }

      // Build full route: origin, waypoints, destination
      const routeWaypoints: PlaceDetails[] = [
        {
          placeId: ride.origin_place_id,
          address: ride.departure_location,
          coordinates: ride.origin_coordinates
            ? await parsePoint(ride.origin_coordinates)
            : { lat: 0, lng: 0 },
          formattedAddress: ride.departure_location,
        },
        ...waypoints,
        {
          placeId: ride.destination_place_id,
          address: ride.destination,
          coordinates: ride.destination_coordinates
            ? await parsePoint(ride.destination_coordinates)
            : { lat: 0, lng: 0 },
          formattedAddress: ride.destination,
        },
      ];

      // Remove duplicates
      const uniqueWaypoints = routeWaypoints.filter(
        (wp, index, arr) => index === 0 || wp.placeId !== arr[index - 1].placeId
      );

      // Compute route polyline
      const routeResponse = await computeRoutePolyline(uniqueWaypoints, apiKey);
      if (!routeResponse || !routeResponse.polyline) {
        console.log(`No valid route for ride ${ride.id}`);
        continue;
      }

      // Decode polyline
      const path = google.maps.geometry.encoding.decodePath(
        routeResponse.polyline
      );

      // Check if passenger points are on/near the path
      const originMatch = findPointOnPath(passengerOrigin.coordinates, path);
      const destinationMatch = findPointOnPath(
        passengerDestination.coordinates,
        path
      );

      if (
        originMatch &&
        destinationMatch &&
        originMatch.index < destinationMatch.index
      ) {
        console.log(`Ride ${ride.id} matched for ${origin} to ${destination}`);

        // Compute DirectionsResult for full route and matched segment
        const { fullRouteDirections, matchedSegmentDirections } =
          await computeDirections(
            uniqueWaypoints,
            originPlaceId,
            destinationPlaceId,
            apiKey
          );

        matchedRides.push({
          ...ride,
          totalDistance: routeResponse.distanceMeters,
          totalDuration: routeResponse.durationSeconds,
          fullRouteDirections,
          matchedSegmentDirections,
          routePoints: uniqueWaypoints, // Include for display in RideCard
        });
      } else {
        console.log(`Ride ${ride.id} does not match route criteria.`);
      }
    } catch (error) {
      console.error(`Error processing ride ${ride.id}:`, error);
      continue;
    }
  }

  console.log(
    `Route matching completed. Found ${matchedRides.length} matching rides out of ${rides.length} candidates.`
  );
  return matchedRides;
}

// Parse POINT(x,y) to { lat, lng }
export async function parsePoint(
  point: string
): Promise<{ lat: number; lng: number }> {
  const matches = point.match(/\((\d+\.?\d*),(\d+\.?\d*)\)/);
  if (!matches) return { lat: 0, lng: 0 };
  return { lat: parseFloat(matches[2]), lng: parseFloat(matches[1]) };
}

// Geocode address to PlaceDetails
async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<PlaceDetails> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`
  );
  const data = await response.json();
  if (data.status !== "OK" || !data.results[0]) {
    throw new Error(`Geocoding failed for address: ${address}`);
  }
  const result = data.results[0];
  return {
    placeId: result.place_id,
    address: result.formatted_address,
    coordinates: {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    },
    formattedAddress: result.formatted_address,
  };
}

// Compute route polyline using Routes API
async function computeRoutePolyline(
  waypoints: PlaceDetails[],
  apiKey: string
): Promise<{
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
} | null> {
  const requestBody = {
    origin: { location: { latLng: waypoints[0].coordinates } },
    destination: {
      location: { latLng: waypoints[waypoints.length - 1].coordinates },
    },
    intermediates: waypoints.slice(1, -1).map((wp) => ({
      location: { latLng: wp.coordinates },
    })),
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    optimizeWaypointOrder: true,
    extraComputations: ["TRAFFIC_ON_POLYLINE"],
  };

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify(requestBody),
    }
  );

  const data = await response.json();
  if (data.status !== "OK" || !data.routes[0]) {
    console.error("Routes API error:", data);
    return null;
  }
  return {
    polyline: data.routes[0].polyline.encodedPolyline,
    distanceMeters: data.routes[0].distanceMeters,
    durationSeconds: parseInt(data.routes[0].duration.replace("s", "")),
  };
}

// Compute DirectionsResult for full route and matched segment
async function computeDirections(
  waypoints: PlaceDetails[],
  originPlaceId: string,
  destinationPlaceId: string,
  apiKey: string
): Promise<{
  fullRouteDirections: google.maps.DirectionsResult | null;
  matchedSegmentDirections: google.maps.DirectionsResult | null;
}> {
  const directionsService = new google.maps.DirectionsService();

  // Full route
  const fullRouteRequest: google.maps.DirectionsRequest = {
    origin: waypoints[0].coordinates,
    destination: waypoints[waypoints.length - 1].coordinates,
    waypoints: waypoints.slice(1, -1).map((wp) => ({
      location: wp.coordinates,
      stopover: true,
    })),
    travelMode: google.maps.TravelMode.DRIVING,
    optimizeWaypoints: true,
  };

  // Matched segment
  const matchedSegmentStartIndex = waypoints.findIndex(
    (wp) => wp.placeId === originPlaceId
  );
  const matchedSegmentEndIndex = waypoints.findIndex(
    (wp) => wp.placeId === destinationPlaceId
  );
  let matchedSegmentRequest: google.maps.DirectionsRequest | null = null;
  if (
    matchedSegmentStartIndex >= 0 &&
    matchedSegmentEndIndex > matchedSegmentStartIndex
  ) {
    matchedSegmentRequest = {
      origin: waypoints[matchedSegmentStartIndex].coordinates,
      destination: waypoints[matchedSegmentEndIndex].coordinates,
      waypoints: waypoints
        .slice(matchedSegmentStartIndex + 1, matchedSegmentEndIndex)
        .map((wp) => ({
          location: wp.coordinates,
          stopover: true,
        })),
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };
  }

  const [fullRouteResult, matchedSegmentResult] = await Promise.all([
    directionsService.route(fullRouteRequest).then(
      (response) => response,
      () => null
    ),
    matchedSegmentRequest
      ? directionsService.route(matchedSegmentRequest).then(
          (response) => response,
          () => null
        )
      : Promise.resolve(null),
  ]);

  return {
    fullRouteDirections: fullRouteResult,
    matchedSegmentDirections: matchedSegmentResult,
  };
}

// Check if a point is on/near the route path
function findPointOnPath(
  point: { lat: number; lng: number },
  path: google.maps.LatLng[]
): { index: number } | null {
  const MAX_DISTANCE = 500; // Max distance (meters) to consider a point "on" the route
  for (let i = 0; i < path.length; i++) {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(point.lat, point.lng),
      path[i]
    );
    if (distance <= MAX_DISTANCE) {
      return { index: i };
    }
  }
  return null;
}

export async function createRide(formData: FormData) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "You must be logged in to create a ride" };
    }

    console.log("Creating ride for user:", user.id);

    const originPlaceId = formData.get("originPlaceId") as string;
    const destinationPlaceId = formData.get("destinationPlaceId") as string;
    const originCoordinates = formData.get("originCoordinates") as string;
    const destinationCoordinates = formData.get(
      "destinationCoordinates"
    ) as string;
    const originFormatted = formData.get("originFormatted") as string;
    const destinationFormatted = formData.get("destinationFormatted") as string;

    const origin = originFormatted || (formData.get("origin") as string);
    const destination =
      destinationFormatted || (formData.get("destination") as string);
    const departureTime = formData.get("departureTime") as string;
    const availableSeats = Number.parseInt(
      formData.get("availableSeats") as string
    );
    const price = Number.parseFloat(formData.get("price") as string);

    console.log("Form data:", {
      origin,
      destination,
      departureTime,
      availableSeats,
      price,
      hasPlaceData: !!originPlaceId && !!destinationPlaceId,
    });

    if (!origin || !destination || !departureTime || !availableSeats) {
      return { error: "Please fill in all required fields" };
    }

    let originCoords = null;
    let destinationCoords = null;
    let routeInfo = null;

    if (originCoordinates && destinationCoordinates) {
      try {
        originCoords = JSON.parse(originCoordinates);
        destinationCoords = JSON.parse(destinationCoordinates);

        if (originPlaceId && destinationPlaceId) {
          const originPlace: PlaceDetails = {
            placeId: originPlaceId,
            address: origin,
            coordinates: originCoords,
            formattedAddress: originFormatted,
          };

          const destinationPlace: PlaceDetails = {
            placeId: destinationPlaceId,
            address: destination,
            coordinates: destinationCoords,
            formattedAddress: destinationFormatted,
          };

          routeInfo = await calculateRoute(originPlace, destinationPlace);
        }
      } catch (error) {
        console.error("Error parsing coordinates:", error);
      }
    }

    let estimatedArrivalTime = departureTime;
    if (routeInfo) {
      const departureDate = new Date(departureTime);
      const arrivalDate = new Date(
        departureDate.getTime() + routeInfo.durationValue * 1000
      );
      estimatedArrivalTime = arrivalDate.toISOString();
    }

    const rideData = {
      driver_id: user.id,
      departure_location: origin,
      destination: destination,
      departure_time: departureTime,
      estimated_arrival_time: estimatedArrivalTime,
      available_seats: availableSeats,
      price: price,
      status: "active",
      ...(originPlaceId && { origin_place_id: originPlaceId }),
      ...(destinationPlaceId && { destination_place_id: destinationPlaceId }),
      ...(originCoords && {
        origin_coordinates: `(${originCoords.lng},${originCoords.lat})`,
      }),
      ...(destinationCoords && {
        destination_coordinates: `(${destinationCoords.lng},${destinationCoords.lat})`,
      }),
      ...(routeInfo && {
        route_distance: routeInfo.distanceValue,
        route_duration: routeInfo.durationValue,
        route_polyline: routeInfo.polyline,
      }),
    };

    console.log("Inserting ride data:", rideData);

    if (!supabaseAdmin) {
      return { error: "Database connection not available" };
    }

    const { data: ride, error } = await supabaseAdmin
      .from("rides")
      .insert(rideData)
      .select()
      .single();

    if (error) {
      console.error("Error creating ride:", error);
      return { error: error.message };
    }

    console.log("Ride created successfully:", ride);

    revalidatePath("/");
    revalidatePath("/my-rides");
    revalidatePath("/available-rides");

    return { success: true, ride, routeInfo };
  } catch (error: any) {
    console.error("Unexpected error creating ride:", error);
    return { error: error.message || "Failed to create ride" };
  }
}

export async function getRideById(id: string) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not available");
    return null;
  }

  const { data: ride, error } = await supabaseAdmin
    .from("rides")
    .select(
      `
      *,
      profiles!rides_driver_id_fkey(id, first_name, last_name, avatar_url)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching ride:", error);
    return null;
  }

  return {
    ...ride,
    origin: ride.departure_location,
    driver: ride.profiles,
  };
}

export async function getUserRides() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  if (!supabaseAdmin) {
    console.error("Supabase admin client not available");
    return [];
  }

  console.log("Fetching rides for user:", user.id);

  const { data: rides, error } = await supabaseAdmin
    .from("rides")
    .select(`*`)
    .eq("driver_id", user.id)
    .order("departure_time", { ascending: false });

  if (error) {
    console.error("Error fetching user rides:", error);
    return [];
  }

  console.log("Found rides:", rides?.length || 0);
  return rides || [];
}

export async function getUserBookings() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  if (!supabaseAdmin) {
    console.error("Supabase admin client not available");
    return [];
  }

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select(
      `
      *,
      rides!bookings_ride_id_fkey(
        id,
        departure_location,
        destination,
        departure_time,
        price,
        profiles!rides_driver_id_fkey(id, first_name, last_name, avatar_url)
      )
    `
    )
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }

  return bookings.map((booking) => ({
    ...booking,
    ride: {
      ...booking.rides,
      driver_id: booking.rides.profiles,
    },
  }));
}
