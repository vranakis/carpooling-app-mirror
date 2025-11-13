"use server";

// lib/actions/rides.ts
// Smart ride matching with dynamic route calculation

import { revalidatePath } from "next/cache";
import {
  getAllRides,
  getRideById as getRideByIdHelper,
  createRide as createRideHelper,
  getRidesByDriver,
} from "@/lib/database/helpers";
import {
  calculateRoute,
  type PlaceDetails,
  type RouteInfo,
} from "./google-maps";

// ============================================
// TYPES
// ============================================

interface RideWithMatch extends Awaited<ReturnType<typeof getRideByIdHelper>> {
  // Original route (A → D)
  originalRoute?: RouteInfo;

  // Route with passenger waypoints (A → B → C → D)
  detourRoute?: RouteInfo;

  // Detour metrics
  detourDistance?: number; // Extra km
  detourTime?: number; // Extra minutes
  detourPercentage?: number; // % increase

  // Matched segment for passenger (B → C)
  passengerSegment?: RouteInfo;
}

// ============================================
// CONFIGURATION
// ============================================

const MAX_DETOUR_PERCENTAGE = 20; // Maximum 20% detour acceptable
const MAX_DETOUR_KM = 30; // Or maximum 30km extra, whichever is less

// ============================================
// SEARCH WITH SMART MATCHING
// ============================================

export async function searchRidesWithDetour(formData: FormData) {
  try {
    const origin = formData.get("origin")?.toString();
    const destination = formData.get("destination")?.toString();
    const date = formData.get("date")?.toString();

    // Get place details from form
    const originPlaceId = formData.get("originPlaceId")?.toString();
    const destinationPlaceId = formData.get("destinationPlaceId")?.toString();
    const originCoordinates = formData.get("originCoordinates")?.toString();
    const destinationCoordinates = formData
      .get("destinationCoordinates")
      ?.toString();

    console.log("🔍 Smart search:", { origin, destination, date });

    if (
      !origin ||
      !destination ||
      !originCoordinates ||
      !destinationCoordinates
    ) {
      return { error: "Please provide complete origin and destination" };
    }

    // Parse passenger coordinates
    const passengerOrigin: PlaceDetails = {
      placeId: originPlaceId || "",
      address: origin,
      coordinates: JSON.parse(originCoordinates),
      formattedAddress: origin,
    };

    const passengerDestination: PlaceDetails = {
      placeId: destinationPlaceId || "",
      address: destination,
      coordinates: JSON.parse(destinationCoordinates),
      formattedAddress: destination,
    };

    // Get all active rides
    let rides = await getAllRides();

    // Filter by date if provided
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      rides = rides.filter((ride) => {
        const rideDate = new Date(ride.departure_time);
        return rideDate >= searchDate && rideDate < nextDay;
      });
    }

    console.log(`📊 Checking ${rides.length} rides for matches...`);

    // Check each ride for compatibility
    const matchedRides: RideWithMatch[] = [];

    for (const ride of rides) {
      try {
        // Skip rides without coordinates
        if (!ride.origin_coordinates || !ride.destination_coordinates) {
          console.log(
            `⏭️  Skipping ride ${ride.id.slice(0, 8)} - missing coordinates`
          );
          continue;
        }

        // Parse ride coordinates
        const rideOrigin = await parseCoordinates(ride.origin_coordinates);
        const rideDestination = await parseCoordinates(
          ride.destination_coordinates
        );

        if (!rideOrigin || !rideDestination) {
          console.log(
            `⏭️  Skipping ride ${ride.id.slice(0, 8)} - invalid coordinates`
          );
          continue;
        }

        // Create PlaceDetails for ride
        const rideOriginPlace: PlaceDetails = {
          placeId: ride.origin_place_id || "",
          address: ride.origin,
          coordinates: rideOrigin,
          formattedAddress: ride.origin,
        };

        const rideDestinationPlace: PlaceDetails = {
          placeId: ride.destination_place_id || "",
          address: ride.destination,
          coordinates: rideDestination,
          formattedAddress: ride.destination,
        };

        console.log(
          `\n🚗 Analyzing ride ${ride.id.slice(0, 8)}: ${ride.origin} → ${
            ride.destination
          }`
        );

        // Calculate if this ride is compatible
        const matchResult = await calculateRideCompatibility(
          rideOriginPlace,
          rideDestinationPlace,
          passengerOrigin,
          passengerDestination
        );

        if (matchResult.isCompatible) {
          console.log(
            `✅ MATCH! Detour: +${matchResult.detourDistance}km (+${matchResult.detourPercentage}%)`
          );

          matchedRides.push({
            ...ride,
            originalRoute: matchResult.originalRoute,
            detourRoute: matchResult.detourRoute,
            detourDistance: matchResult.detourDistance,
            detourTime: matchResult.detourTime,
            detourPercentage: matchResult.detourPercentage,
            passengerSegment: matchResult.passengerSegment,
          });
        } else {
          console.log(`❌ No match: ${matchResult.reason}`);
        }
      } catch (error) {
        console.error(`Error processing ride ${ride.id}:`, error);
        continue;
      }
    }

    console.log(`\n🎯 Found ${matchedRides.length} compatible rides!`);
    return { success: true, rides: matchedRides };
  } catch (error: any) {
    console.error("Error in smart search:", error);
    return { error: error.message || "Search failed" };
  }
}

// ============================================
// ROUTE COMPATIBILITY CALCULATION
// ============================================

async function calculateRideCompatibility(
  rideOrigin: PlaceDetails,
  rideDestination: PlaceDetails,
  passengerOrigin: PlaceDetails,
  passengerDestination: PlaceDetails
): Promise<{
  isCompatible: boolean;
  reason?: string;
  originalRoute?: RouteInfo;
  detourRoute?: RouteInfo;
  passengerSegment?: RouteInfo;
  detourDistance?: number;
  detourTime?: number;
  detourPercentage?: number;
}> {
  try {
    // Step 1: Calculate original route (A → D)
    console.log("  📍 Calculating original route...");
    const originalRoute = await calculateRoute(rideOrigin, rideDestination);

    if (!originalRoute) {
      return {
        isCompatible: false,
        reason: "Could not calculate original route",
      };
    }

    console.log(
      `  ✓ Original: ${originalRoute.distance} (${originalRoute.duration})`
    );

    // Step 2: Check if passenger points are roughly between origin and destination
    // Use a simple bounding box check first to eliminate obvious mismatches
    if (
      !isPointInGeneralDirection(
        rideOrigin.coordinates,
        rideDestination.coordinates,
        passengerOrigin.coordinates
      )
    ) {
      return {
        isCompatible: false,
        reason: "Pickup point not in route direction",
      };
    }

    if (
      !isPointInGeneralDirection(
        rideOrigin.coordinates,
        rideDestination.coordinates,
        passengerDestination.coordinates
      )
    ) {
      return {
        isCompatible: false,
        reason: "Dropoff point not in route direction",
      };
    }

    // Step 3: Calculate route with passenger waypoints (A → B → C → D)
    console.log("  📍 Calculating route with waypoints...");
    const detourRoute = await calculateRouteWithWaypoints(
      rideOrigin,
      [passengerOrigin, passengerDestination],
      rideDestination
    );

    if (!detourRoute) {
      return {
        isCompatible: false,
        reason: "Could not calculate route with waypoints",
      };
    }

    console.log(
      `  ✓ With detour: ${detourRoute.distance} (${detourRoute.duration})`
    );

    // Step 4: Calculate detour metrics
    const detourKm =
      (detourRoute.distanceValue - originalRoute.distanceValue) / 1000;
    const detourMinutes =
      (detourRoute.durationValue - originalRoute.durationValue) / 60;
    const detourPercentage =
      (detourKm / (originalRoute.distanceValue / 1000)) * 100;

    console.log(
      `  📊 Detour: +${detourKm.toFixed(1)}km (+${detourPercentage.toFixed(
        1
      )}%), +${detourMinutes.toFixed(0)}min`
    );

    // Step 5: Check if detour is acceptable
    if (detourPercentage > MAX_DETOUR_PERCENTAGE) {
      return {
        isCompatible: false,
        reason: `Detour too large: ${detourPercentage.toFixed(
          1
        )}% (max ${MAX_DETOUR_PERCENTAGE}%)`,
      };
    }

    if (detourKm > MAX_DETOUR_KM) {
      return {
        isCompatible: false,
        reason: `Detour too large: ${detourKm.toFixed(
          1
        )}km (max ${MAX_DETOUR_KM}km)`,
      };
    }

    // Step 6: Calculate passenger segment (B → C)
    console.log("  📍 Calculating passenger segment...");
    const passengerSegment = await calculateRoute(
      passengerOrigin,
      passengerDestination
    );

    if (!passengerSegment) {
      return {
        isCompatible: false,
        reason: "Could not calculate passenger segment",
      };
    }

    console.log(
      `  ✓ Passenger segment: ${passengerSegment.distance} (${passengerSegment.duration})`
    );

    // Success! This is a compatible match
    return {
      isCompatible: true,
      originalRoute,
      detourRoute,
      passengerSegment,
      detourDistance: parseFloat(detourKm.toFixed(1)),
      detourTime: Math.round(detourMinutes),
      detourPercentage: parseFloat(detourPercentage.toFixed(1)),
    };
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    return { isCompatible: false, reason: "Calculation error" };
  }
}

// ============================================
// HELPER: Calculate route with waypoints
// ============================================

async function calculateRouteWithWaypoints(
  origin: PlaceDetails,
  waypoints: PlaceDetails[],
  destination: PlaceDetails
): Promise<RouteInfo | null> {
  try {
    // For now, we'll calculate the total route by chaining segments
    // A more sophisticated approach would use Google's waypoint optimization

    const segments: RouteInfo[] = [];

    // Calculate A → B
    const firstSegment = await calculateRoute(origin, waypoints[0]);
    if (!firstSegment) return null;
    segments.push(firstSegment);

    // Calculate intermediate segments (B → C, if more waypoints)
    for (let i = 0; i < waypoints.length - 1; i++) {
      const segment = await calculateRoute(waypoints[i], waypoints[i + 1]);
      if (!segment) return null;
      segments.push(segment);
    }

    // Calculate last segment → D
    const lastSegment = await calculateRoute(
      waypoints[waypoints.length - 1],
      destination
    );
    if (!lastSegment) return null;
    segments.push(lastSegment);

    // Sum up all segments
    const totalDistance = segments.reduce(
      (sum, seg) => sum + seg.distanceValue,
      0
    );
    const totalDuration = segments.reduce(
      (sum, seg) => sum + seg.durationValue,
      0
    );

    // Format nicely
    const distanceKm = totalDistance / 1000;
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    return {
      distance:
        distanceKm >= 1 ? `${distanceKm.toFixed(1)} km` : `${totalDistance} m`,
      duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      distanceValue: totalDistance,
      durationValue: totalDuration,
      polyline: segments[0].polyline, // Use first segment's polyline for now
      bounds: segments[0].bounds,
    };
  } catch (error) {
    console.error("Error calculating route with waypoints:", error);
    return null;
  }
}

// ============================================
// HELPER: Check if point is in general direction
// ============================================

function isPointInGeneralDirection(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  point: { lat: number; lng: number }
): boolean {
  // Create a bounding box around the origin-destination line with some margin
  const minLat = Math.min(origin.lat, destination.lat) - 0.5; // ~55km margin
  const maxLat = Math.max(origin.lat, destination.lat) + 0.5;
  const minLng = Math.min(origin.lng, destination.lng) - 0.5;
  const maxLng = Math.max(origin.lng, destination.lng) + 0.5;

  return (
    point.lat >= minLat &&
    point.lat <= maxLat &&
    point.lng >= minLng &&
    point.lng <= maxLng
  );
}

// ============================================
// HELPER: Parse PostGIS coordinates
// ============================================

async function parseCoordinates(
  geom: any
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Handle different PostGIS geometry formats
    if (typeof geom === "string") {
      // Format: "POINT(lng lat)" or "(lng,lat)"
      const matches =
        geom.match(/\(([^,]+),([^)]+)\)/) ||
        geom.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (matches) {
        return {
          lng: parseFloat(matches[1]),
          lat: parseFloat(matches[2]),
        };
      }
    } else if (geom && typeof geom === "object") {
      // GeoJSON format
      if (geom.coordinates) {
        return {
          lng: geom.coordinates[0],
          lat: geom.coordinates[1],
        };
      }
    }

    console.error("Could not parse coordinates:", geom);
    return null;
  } catch (error) {
    console.error("Error parsing coordinates:", error);
    return null;
  }
}

// ============================================
// EXISTING FUNCTIONS (kept for compatibility)
// ============================================

export async function getPopularRides() {
  try {
    const rides = await getAllRides();
    return rides.slice(0, 5);
  } catch (error) {
    console.error("Error fetching popular rides:", error);
    return [];
  }
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
  try {
    let rides = await getAllRides();

    if (options.origin) {
      rides = rides.filter((ride) =>
        ride.origin.toLowerCase().includes(options.origin!.toLowerCase())
      );
    }

    if (options.destination) {
      rides = rides.filter((ride) =>
        ride.destination
          .toLowerCase()
          .includes(options.destination!.toLowerCase())
      );
    }

    if (options.date) {
      const searchDate = new Date(options.date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      rides = rides.filter((ride) => {
        const rideDate = new Date(ride.departure_time);
        return rideDate >= searchDate && rideDate < nextDay;
      });
    }

    if (options.offset !== undefined) {
      rides = rides.slice(options.offset);
    }

    if (options.limit !== undefined) {
      rides = rides.slice(0, options.limit);
    }

    return rides;
  } catch (error) {
    console.error("Error fetching rides:", error);
    return [];
  }
}

export async function createRide(formData: FormData) {
  try {
    console.log("⚠️ Creating ride without authentication");

    const origin = formData.get("origin") as string;
    const destination = formData.get("destination") as string;
    const departureTime = formData.get("departureTime") as string;
    const availableSeats = parseInt(formData.get("availableSeats") as string);
    const price = parseFloat(formData.get("price") as string);

    const originPlaceId = formData.get("originPlaceId") as string;
    const destinationPlaceId = formData.get("destinationPlaceId") as string;
    const originCoordinates = formData.get("originCoordinates") as string;
    const destinationCoordinates = formData.get(
      "destinationCoordinates"
    ) as string;

    if (!origin || !destination || !departureTime || !availableSeats) {
      return { error: "Please fill in all required fields" };
    }

    let originCoords = null;
    let destinationCoords = null;

    if (originCoordinates && destinationCoordinates) {
      try {
        originCoords = JSON.parse(originCoordinates);
        destinationCoords = JSON.parse(destinationCoordinates);
      } catch (error) {
        console.error("Error parsing coordinates:", error);
      }
    }

    const tempDriverId = "00000000-0000-0000-0000-000000000001";

    const ride = await createRideHelper({
      driver_id: tempDriverId,
      origin,
      destination,
      origin_place_id: originPlaceId,
      destination_place_id: destinationPlaceId,
      origin_lat: originCoords?.lat,
      origin_lng: originCoords?.lng,
      destination_lat: destinationCoords?.lat,
      destination_lng: destinationCoords?.lng,
      departure_time: new Date(departureTime),
      available_seats: availableSeats,
      price_per_seat: price,
    });

    console.log("Ride created successfully:", ride.id);

    revalidatePath("/");
    revalidatePath("/rides");

    return { success: true, ride };
  } catch (error: any) {
    console.error("Unexpected error creating ride:", error);
    return { error: error.message || "Failed to create ride" };
  }
}

export async function getRideById(id: string) {
  try {
    const ride = await getRideByIdHelper(id);
    return ride;
  } catch (error) {
    console.error("Error fetching ride:", error);
    return null;
  }
}

export async function getUserRides() {
  try {
    console.log("⚠️ getUserRides: Authentication not implemented");
    return [];
  } catch (error) {
    console.error("Error fetching user rides:", error);
    return [];
  }
}

export async function getUserBookings() {
  try {
    console.log("⚠️ getUserBookings: Authentication not implemented");
    return [];
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
}
