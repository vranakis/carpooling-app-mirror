"use server";

// lib/actions/rides.ts
// Smart ride matching with dynamic route calculation + standard ride operations

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
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

import type { Ride } from "@/lib/database/helpers";

interface RideWithMatch extends Ride {
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
const MAX_DETOUR_TIME = 10; // Maximum 10 extra minutes for the driver
const BOUNDING_BOX_MARGIN = 0.1; // ~11km margin (reduced from 0.5° = 55km)

// ============================================
// SMART SEARCH WITH DETOUR MATCHING
// ============================================

/**
 * Search for rides with intelligent route matching
 * Finds rides where the driver's route overlaps with passenger journey
 * even if start/end points don't match exactly
 */
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
    let processedCount = 0;
    let skippedNoCoords = 0;
    let skippedBoundingBox = 0;
    let rejectedByDetour = 0;

    for (const ride of rides) {
      processedCount++;
      console.log(`\n${"=".repeat(60)}`);
      console.log(
        `🔍 [${processedCount}/${rides.length}] Checking ride ${ride.id.slice(
          0,
          8
        )}`
      );
      console.log(`   Route: ${ride.origin} → ${ride.destination}`);

      try {
        // Skip rides without coordinates
        if (!ride.origin_coordinates || !ride.destination_coordinates) {
          skippedNoCoords++;
          console.log(`⏭️  Skipped: Missing coordinates`, {
            hasOrigin: !!ride.origin_coordinates,
            hasDest: !!ride.destination_coordinates,
          });
          continue;
        }

        console.log(`  Raw coordinates:`, {
          origin: ride.origin_coordinates,
          destination: ride.destination_coordinates,
        });

        // Parse ride coordinates
        const rideOrigin = await parseCoordinates(ride.origin_coordinates);
        const rideDestination = await parseCoordinates(
          ride.destination_coordinates
        );

        console.log(`  Parsed coordinates:`, {
          rideOrigin,
          rideDestination,
        });

        if (!rideOrigin || !rideDestination) {
          console.log(`⏭️  Skipping - invalid coordinates after parsing`);
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
            `✅ MATCH! Detour: +${matchResult.detourDistance}km (+${matchResult.detourPercentage}%), +${matchResult.detourTime}min`
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
          rejectedByDetour++;
          console.log(`❌ No match: ${matchResult.reason}`);
        }
      } catch (error) {
        console.error(`⚠️  Error processing ride ${ride.id}:`, error);
        continue;
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 SEARCH SUMMARY:`);
    console.log(`   Total rides checked: ${processedCount}`);
    console.log(`   Skipped (no coords): ${skippedNoCoords}`);
    console.log(`   Skipped (bounding box): ${skippedBoundingBox}`);
    console.log(`   Rejected (detour limits): ${rejectedByDetour}`);
    console.log(`   ✅ MATCHES FOUND: ${matchedRides.length}`);
    console.log(`${"=".repeat(60)}\n`);

    return { success: true, rides: matchedRides };
  } catch (error: any) {
    console.error("Error in smart search:", error);
    return { error: error.message || "Search failed" };
  }
}

// ============================================
// ROUTE COMPATIBILITY CALCULATION
// ============================================

/**
 * Calculate if a ride is compatible with passenger's journey
 * Checks if driver's route overlaps and calculates detour metrics
 */
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
    console.log(`  🗺️  Checking pickup point bounding box...`);
    if (
      !isPointInGeneralDirection(
        rideOrigin.coordinates,
        rideDestination.coordinates,
        passengerOrigin.coordinates
      )
    ) {
      return {
        isCompatible: false,
        reason: "Pickup point not in route direction (bounding box check)",
      };
    }

    console.log(`  🗺️  Checking dropoff point bounding box...`);
    if (
      !isPointInGeneralDirection(
        rideOrigin.coordinates,
        rideDestination.coordinates,
        passengerDestination.coordinates
      )
    ) {
      return {
        isCompatible: false,
        reason: "Dropoff point not in route direction (bounding box check)",
      };
    }

    console.log(`  ✅ Both points passed bounding box check`);

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

    // Step 5: Check if detour is acceptable (ALL conditions must pass)

    // Check time limit first (most important for driver)
    if (detourMinutes > MAX_DETOUR_TIME) {
      console.log(
        `  ❌ Rejected: Detour time ${detourMinutes.toFixed(
          0
        )}min exceeds ${MAX_DETOUR_TIME}min limit`
      );
      return {
        isCompatible: false,
        reason: `Detour time too long: ${detourMinutes.toFixed(
          0
        )}min (max ${MAX_DETOUR_TIME}min)`,
      };
    }

    if (detourPercentage > MAX_DETOUR_PERCENTAGE) {
      console.log(
        `  ❌ Rejected: Detour ${detourPercentage.toFixed(
          1
        )}% exceeds ${MAX_DETOUR_PERCENTAGE}% limit`
      );
      return {
        isCompatible: false,
        reason: `Detour too large: ${detourPercentage.toFixed(
          1
        )}% (max ${MAX_DETOUR_PERCENTAGE}%)`,
      };
    }

    if (detourKm > MAX_DETOUR_KM) {
      console.log(
        `  ❌ Rejected: Detour ${detourKm.toFixed(
          1
        )}km exceeds ${MAX_DETOUR_KM}km limit`
      );
      return {
        isCompatible: false,
        reason: `Detour too large: ${detourKm.toFixed(
          1
        )}km (max ${MAX_DETOUR_KM}km)`,
      };
    }

    console.log(`  ✅ All detour checks passed!`);

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

/**
 * Calculate a route that includes waypoints
 * Chains segments: origin → waypoint1 → waypoint2 → destination
 */
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

/**
 * Simple bounding box check to quickly eliminate obvious mismatches
 * Returns true if point is roughly between origin and destination
 */
function isPointInGeneralDirection(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  point: { lat: number; lng: number }
): boolean {
  // Create a bounding box around the origin-destination line with margin
  const minLat = Math.min(origin.lat, destination.lat) - BOUNDING_BOX_MARGIN;
  const maxLat = Math.max(origin.lat, destination.lat) + BOUNDING_BOX_MARGIN;
  const minLng = Math.min(origin.lng, destination.lng) - BOUNDING_BOX_MARGIN;
  const maxLng = Math.max(origin.lng, destination.lng) + BOUNDING_BOX_MARGIN;

  const isInBox =
    point.lat >= minLat &&
    point.lat <= maxLat &&
    point.lng >= minLng &&
    point.lng <= maxLng;

  console.log(`    🗺️  Bounding box check: ${isInBox ? "PASS" : "FAIL"}`, {
    point: `(${point.lat.toFixed(3)}, ${point.lng.toFixed(3)})`,
    box: `lat: ${minLat.toFixed(2)} to ${maxLat.toFixed(
      2
    )}, lng: ${minLng.toFixed(2)} to ${maxLng.toFixed(2)}`,
  });

  return isInBox;
}

// ============================================
// HELPER: Parse PostGIS coordinates
// ============================================

/**
 * Parse PostGIS geometry data into lat/lng coordinates
 * Handles multiple formats: POINT(lng lat), (lng,lat), GeoJSON
 */
async function parseCoordinates(
  geom: any
): Promise<{ lat: number; lng: number } | null> {
  try {
    console.log(`    🔧 parseCoordinates input:`, typeof geom, geom);

    // Handle different PostGIS geometry formats
    if (typeof geom === "string") {
      console.log(`    → Parsing as string`);
      // Format: "POINT(lng lat)" or "(lng,lat)"
      const matches =
        geom.match(/\(([^,]+),([^)]+)\)/) ||
        geom.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (matches) {
        const result = {
          lng: parseFloat(matches[1]),
          lat: parseFloat(matches[2]),
        };
        console.log(`    ✓ Parsed string:`, result);
        return result;
      }
    } else if (geom && typeof geom === "object") {
      console.log(`    → Parsing as object`);
      // GeoJSON format
      if (geom.coordinates) {
        const result = {
          lng: geom.coordinates[0],
          lat: geom.coordinates[1],
        };
        console.log(`    ✓ Parsed GeoJSON:`, result);
        return result;
      }
    }

    console.error("    ❌ Could not parse coordinates:", geom);
    return null;
  } catch (error) {
    console.error("    ❌ Error parsing coordinates:", error);
    return null;
  }
}

// ============================================
// STANDARD RIDE OPERATIONS
// ============================================

/**
 * Create a new ride
 * userId is passed from the server component after authentication
 */
export async function createRide(userId: string, formData: FormData) {
  try {
    // Validate userId
    if (!userId) {
      console.log("❌ No userId provided - cannot create ride");
      return {
        error: "User authentication required. Please sign in and try again.",
      };
    }

    console.log("✅ Creating ride for user:", userId);

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

    // Optional route info from map
    const routeDistance = formData.get("routeDistance") as string;
    const routeDuration = formData.get("routeDuration") as string;
    const routePolyline = formData.get("routePolyline") as string;

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

    // Use the authenticated user's ID as the driver
    const ride = await createRideHelper({
      driver_id: userId,
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
      route_distance: routeDistance ? parseInt(routeDistance) : undefined,
      route_duration: routeDuration ? parseInt(routeDuration) : undefined,
      route_polyline: routePolyline || undefined,
    });

    console.log(
      "✅ Ride created successfully:",
      ride.id,
      "for driver:",
      userId
    );

    revalidatePath("/");
    revalidatePath("/rides");
    revalidatePath("/my-rides");

    return { success: true, ride };
  } catch (error: any) {
    console.error("❌ Error creating ride:", error);
    return { error: error.message || "Failed to create ride" };
  }
}

/**
 * Get a single ride by ID
 */
export async function getRideById(id: string) {
  try {
    const ride = await getRideByIdHelper(id);
    return ride;
  } catch (error) {
    console.error("Error fetching ride:", error);
    return null;
  }
}

/**
 * Get rides with optional filtering
 * Used for basic ride listings and filtering
 */
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

/**
 * Get popular/recent rides for homepage
 */
export async function getPopularRides() {
  try {
    const rides = await getAllRides();
    return rides.slice(0, 5);
  } catch (error) {
    console.error("Error fetching popular rides:", error);
    return [];
  }
}
