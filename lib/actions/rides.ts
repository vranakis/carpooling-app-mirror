"use server";

// lib/actions/rides.ts
// FIXED VERSION: Smart route matching + Clerk authentication

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { queryNeon } from "@/lib/database/client";
import {
  getRideById as getRideByIdHelper,
  createRide as createRideHelper,
  getRidesByDriver,
  getAllRides,
} from "@/lib/database/helpers";
import {
  calculateRoute,
  type PlaceDetails,
  type RouteInfo,
} from "./google-maps";

// ============================================
// TYPES
// ============================================

interface RideWithCoords {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  origin_place_id?: string;
  destination_place_id?: string;
  origin_lng?: number;
  origin_lat?: number;
  dest_lng?: number;
  dest_lat?: number;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  route_distance?: number;
  route_duration?: number;
  status: string;
}

interface RideWithMatch extends RideWithCoords {
  originalRoute?: RouteInfo;
  detourRoute?: RouteInfo;
  detourDistance?: number;
  detourTime?: number;
  detourPercentage?: number;
  passengerSegment?: RouteInfo;
}

// ============================================
// CONFIGURATION
// ============================================

const MAX_DETOUR_PERCENTAGE = 20; // Maximum 20% detour acceptable
const MAX_DETOUR_KM = 30; // Or maximum 30km extra, whichever is less
const BATCH_SIZE = 5; // Process 5 rides in parallel
const API_TIMEOUT_MS = 10000; // 10 second timeout per API call
const BOUNDING_BOX_MARGIN = 0.5; // ~55km margin for quick filtering

// Route cache to avoid duplicate API calls
const routeCache = new Map<string, RouteInfo>();

// ============================================
// OPTIMIZED SEARCH WITH PARALLEL PROCESSING
// ============================================

export async function searchRidesWithDetourOptimized(formData: FormData) {
  const startTime = Date.now();
  
  try {
    const origin = formData.get("origin")?.toString();
    const destination = formData.get("destination")?.toString();
    const date = formData.get("date")?.toString();

    const originPlaceId = formData.get("originPlaceId")?.toString();
    const destinationPlaceId = formData.get("destinationPlaceId")?.toString();
    const originCoordinates = formData.get("originCoordinates")?.toString();
    const destinationCoordinates = formData
      .get("destinationCoordinates")
      ?.toString();

    console.log("🔍 Smart search (optimized):", { origin, destination, date });

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

    // OPTIMIZATION 1: Get rides from database with filters
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

    console.log(`📊 Initial rides to check: ${rides.length}`);

    // OPTIMIZATION 2: Quick bounding box pre-filter
    const potentialRides = rides.filter((ride) => {
      if (!ride.origin_coordinates || !ride.destination_coordinates) {
        return false;
      }

      // Parse coordinates
      const rideOrigin = parseCoordinatesSync(ride.origin_coordinates);
      const rideDestination = parseCoordinatesSync(ride.destination_coordinates);

      if (!rideOrigin || !rideDestination) {
        return false;
      }

      // Quick bounding box check
      return quickBoundingBoxCheck(
        rideOrigin,
        rideDestination,
        passengerOrigin.coordinates,
        passengerDestination.coordinates
      );
    });

    console.log(
      `✅ After bounding box filter: ${potentialRides.length} rides (eliminated ${
        rides.length - potentialRides.length
      })`
    );

    if (potentialRides.length === 0) {
      return {
        success: true,
        rides: [],
        stats: {
          totalChecked: rides.length,
          afterFilter: 0,
          matchesFound: 0,
          searchTimeMs: Date.now() - startTime,
        },
      };
    }

    // OPTIMIZATION 3: Parallel processing in batches
    const matchedRides: RideWithMatch[] = [];
    let processed = 0;

    for (let i = 0; i < potentialRides.length; i += BATCH_SIZE) {
      const batch = potentialRides.slice(i, i + BATCH_SIZE);

      console.log(
        `\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          potentialRides.length / BATCH_SIZE
        )} (${batch.length} rides)`
      );

      // Process this batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(async (ride) => {
          try {
            const rideOrigin = parseCoordinatesSync(ride.origin_coordinates!);
            const rideDestination = parseCoordinatesSync(
              ride.destination_coordinates!
            );

            if (!rideOrigin || !rideDestination) {
              return null;
            }

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

            // Calculate compatibility with timeout
            const matchResult = await calculateRideCompatibilityOptimized(
              rideOriginPlace,
              rideDestinationPlace,
              passengerOrigin,
              passengerDestination
            );

            if (matchResult.isCompatible) {
              console.log(
                `  ✅ MATCH: ${ride.origin} → ${ride.destination} (+${matchResult.detourDistance}km)`
              );
              return {
                ...ride,
                originalRoute: matchResult.originalRoute,
                detourRoute: matchResult.detourRoute,
                detourDistance: matchResult.detourDistance,
                detourTime: matchResult.detourTime,
                detourPercentage: matchResult.detourPercentage,
                passengerSegment: matchResult.passengerSegment,
              };
            }

            return null;
          } catch (error) {
            console.error(`  ❌ Error processing ride ${ride.id}:`, error);
            return null;
          }
        })
      );

      // Collect successful matches
      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value) {
          matchedRides.push(result.value);
        }
      }

      processed += batch.length;
      console.log(
        `  Progress: ${processed}/${potentialRides.length} checked, ${matchedRides.length} matches found`
      );
    }

    const searchTime = Date.now() - startTime;
    console.log(
      `\n🎯 Search complete! Found ${matchedRides.length} compatible rides in ${(
        searchTime / 1000
      ).toFixed(1)}s`
    );

    return {
      success: true,
      rides: matchedRides,
      stats: {
        totalChecked: rides.length,
        afterFilter: potentialRides.length,
        matchesFound: matchedRides.length,
        searchTimeMs: searchTime,
      },
    };
  } catch (error: any) {
    console.error("❌ Error in smart search:", error);
    return { error: error.message || "Search failed" };
  }
}

// ============================================
// OPTIMIZED COMPATIBILITY CALCULATION
// ============================================

async function calculateRideCompatibilityOptimized(
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
    // Step 1: Calculate original route with caching
    const originalRoute = await calculateRouteWithCache(
      rideOrigin,
      rideDestination
    );

    if (!originalRoute) {
      return {
        isCompatible: false,
        reason: "Could not calculate original route",
      };
    }

    // Step 2: Calculate route with waypoints
    const detourRoute = await calculateRouteWithWaypointsOptimized(
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

    // Step 3: Calculate detour metrics
    const detourKm =
      (detourRoute.distanceValue - originalRoute.distanceValue) / 1000;
    const detourMinutes =
      (detourRoute.durationValue - originalRoute.durationValue) / 60;
    const detourPercentage =
      (detourKm / (originalRoute.distanceValue / 1000)) * 100;

    // Step 4: Check if detour is acceptable
    if (detourPercentage > MAX_DETOUR_PERCENTAGE) {
      return {
        isCompatible: false,
        reason: `Detour too large: ${detourPercentage.toFixed(1)}%`,
      };
    }

    if (detourKm > MAX_DETOUR_KM) {
      return {
        isCompatible: false,
        reason: `Detour too large: ${detourKm.toFixed(1)}km`,
      };
    }

    // Step 5: Calculate passenger segment with caching
    const passengerSegment = await calculateRouteWithCache(
      passengerOrigin,
      passengerDestination
    );

    if (!passengerSegment) {
      return {
        isCompatible: false,
        reason: "Could not calculate passenger segment",
      };
    }

    // Success!
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
    console.error("❌ Error calculating compatibility:", error);
    return {
      isCompatible: false,
      reason: error instanceof Error ? error.message : "Calculation error",
    };
  }
}

// ============================================
// CACHING & OPTIMIZATION HELPERS
// ============================================

async function calculateRouteWithCache(
  origin: PlaceDetails,
  destination: PlaceDetails
): Promise<RouteInfo | null> {
  // Create cache key
  const cacheKey = `${origin.placeId}-${destination.placeId}`;

  // Check cache
  if (routeCache.has(cacheKey)) {
    console.log(`  📦 Cache hit: ${cacheKey.slice(0, 30)}...`);
    return routeCache.get(cacheKey)!;
  }

  // Calculate with timeout
  try {
    const route = await withTimeout(
      calculateRoute(origin, destination),
      API_TIMEOUT_MS,
      "Route calculation timeout"
    );

    if (route) {
      routeCache.set(cacheKey, route);

      // Clear old cache entries if too large (keep last 1000)
      if (routeCache.size > 1000) {
        const firstKey = routeCache.keys().next().value;
        routeCache.delete(firstKey);
      }
    }

    return route;
  } catch (error) {
    console.error("Route calculation error:", error);
    return null;
  }
}

async function calculateRouteWithWaypointsOptimized(
  origin: PlaceDetails,
  waypoints: PlaceDetails[],
  destination: PlaceDetails
): Promise<RouteInfo | null> {
  try {
    // Calculate segments in parallel (instead of sequentially!)
    const segmentPromises = [];

    // A → B
    segmentPromises.push(calculateRouteWithCache(origin, waypoints[0]));

    // B → C (if more waypoints)
    for (let i = 0; i < waypoints.length - 1; i++) {
      segmentPromises.push(
        calculateRouteWithCache(waypoints[i], waypoints[i + 1])
      );
    }

    // C → D
    segmentPromises.push(
      calculateRouteWithCache(waypoints[waypoints.length - 1], destination)
    );

    // Wait for all segments in parallel
    const segments = await Promise.all(segmentPromises);

    // Check if all segments succeeded
    if (segments.some((seg) => !seg)) {
      return null;
    }

    // Sum up segments
    const totalDistance = segments.reduce(
      (sum, seg) => sum + seg!.distanceValue,
      0
    );
    const totalDuration = segments.reduce(
      (sum, seg) => sum + seg!.durationValue,
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
      polyline: segments[0]!.polyline,
      bounds: segments[0]!.bounds,
    };
  } catch (error) {
    console.error("Error calculating route with waypoints:", error);
    return null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function quickBoundingBoxCheck(
  rideOrigin: { lat: number; lng: number },
  rideDestination: { lat: number; lng: number },
  passengerOrigin: { lat: number; lng: number },
  passengerDestination: { lat: number; lng: number }
): boolean {
  // Create bounding box with margin
  const minLat =
    Math.min(rideOrigin.lat, rideDestination.lat) - BOUNDING_BOX_MARGIN;
  const maxLat =
    Math.max(rideOrigin.lat, rideDestination.lat) + BOUNDING_BOX_MARGIN;
  const minLng =
    Math.min(rideOrigin.lng, rideDestination.lng) - BOUNDING_BOX_MARGIN;
  const maxLng =
    Math.max(rideOrigin.lng, rideDestination.lng) + BOUNDING_BOX_MARGIN;

  // Both passenger points should be roughly in the box
  const originInBox =
    passengerOrigin.lat >= minLat &&
    passengerOrigin.lat <= maxLat &&
    passengerOrigin.lng >= minLng &&
    passengerOrigin.lng <= maxLng;

  const destInBox =
    passengerDestination.lat >= minLat &&
    passengerDestination.lat <= maxLat &&
    passengerDestination.lng >= minLng &&
    passengerDestination.lng <= maxLng;

  return originInBox && destInBox;
}

function parseCoordinatesSync(
  geom: any
): { lat: number; lng: number } | null {
  try {
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
      if (geom.coordinates) {
        return {
          lng: geom.coordinates[0],
          lat: geom.coordinates[1],
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

// ============================================
// CACHE MANAGEMENT
// ============================================

// Clear cache periodically (call from a cron job or on server restart)
export async function clearRouteCache() {
  routeCache.clear();
  console.log("🗑️ Route cache cleared");
}

// Get cache statistics
export async function getRouteCacheStats() {
  return {
    size: routeCache.size,
    keys: Array.from(routeCache.keys()).slice(0, 10), // First 10 keys
  };
}

// ===========================================
// OLD SEARCH FUNCTION (for reference)
// ============================================
// SEARCH WITH SMART MATCHING
// ============================================

export async function searchRidesWithDetour(formData: FormData) {
  try {
    const origin = formData.get("origin")?.toString();
    const destination = formData.get("destination")?.toString();
    const date = formData.get("date")?.toString();

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

    console.log("👤 Passenger route:", {
      from: { ...passengerOrigin.coordinates, address: origin },
      to: { ...passengerDestination.coordinates, address: destination },
    });

    // Get all active rides WITH coordinates explicitly extracted
    let rides = await getAllRidesWithCoordinates();

    console.log(`📊 Total rides in database: ${rides.length}`);

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

      console.log(`📅 After date filter: ${rides.length} rides`);
    }

    // Check each ride for compatibility
    const matchedRides: RideWithMatch[] = [];

    for (const ride of rides) {
      try {
        // Skip rides without coordinates
        if (
          !ride.origin_lat ||
          !ride.origin_lng ||
          !ride.dest_lat ||
          !ride.dest_lng
        ) {
          console.log(
            `⏭️  Skipping ride ${ride.id.slice(0, 8)} - missing coordinates`
          );
          continue;
        }

        // Create PlaceDetails for ride
        const rideOriginPlace: PlaceDetails = {
          placeId: ride.origin_place_id || "",
          address: ride.origin,
          coordinates: { lat: ride.origin_lat, lng: ride.origin_lng },
          formattedAddress: ride.origin,
        };

        const rideDestinationPlace: PlaceDetails = {
          placeId: ride.destination_place_id || "",
          address: ride.destination,
          coordinates: { lat: ride.dest_lat, lng: ride.dest_lng },
          formattedAddress: ride.destination,
        };

        console.log(
          `\n🚗 Analyzing ride ${ride.id.slice(0, 8)}: ${ride.origin} → ${
            ride.destination
          }`
        );
        console.log(
          `   Coords: (${ride.origin_lat}, ${ride.origin_lng}) → (${ride.dest_lat}, ${ride.dest_lng})`
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
    console.error("❌ Error in smart search:", error);
    return { error: error.message || "Search failed" };
  }
}

// ============================================
// GET RIDES WITH COORDINATES
// ============================================

async function getAllRidesWithCoordinates(): Promise<RideWithCoords[]> {
  const rides = await queryNeon<RideWithCoords>(
    `SELECT 
      id, 
      driver_id,
      origin, 
      destination,
      origin_place_id,
      destination_place_id,
      ST_X(origin_coordinates::geometry) as origin_lng,
      ST_Y(origin_coordinates::geometry) as origin_lat,
      ST_X(destination_coordinates::geometry) as dest_lng,
      ST_Y(destination_coordinates::geometry) as dest_lat,
      departure_time,
      available_seats,
      price_per_seat,
      route_distance,
      route_duration,
      status
    FROM rides 
    WHERE status = 'active'
      AND origin_coordinates IS NOT NULL
      AND destination_coordinates IS NOT NULL
    ORDER BY departure_time DESC 
    LIMIT 50`
  );

  console.log(`📍 Fetched ${rides.length} rides with coordinates`);
  if (rides.length > 0) {
    console.log(
      `   Sample ride coords: lat=${rides[0].origin_lat}, lng=${rides[0].origin_lng}`
    );
  }

  return rides;
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

    // Step 2: Quick bounding box check
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

    // Success!
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
// HELPER FUNCTIONS
// ============================================

async function calculateRouteWithWaypoints(
  origin: PlaceDetails,
  waypoints: PlaceDetails[],
  destination: PlaceDetails
): Promise<RouteInfo | null> {
  try {
    const segments: RouteInfo[] = [];

    // A → B
    const firstSegment = await calculateRoute(origin, waypoints[0]);
    if (!firstSegment) return null;
    segments.push(firstSegment);

    // B → C (if multiple waypoints)
    for (let i = 0; i < waypoints.length - 1; i++) {
      const segment = await calculateRoute(waypoints[i], waypoints[i + 1]);
      if (!segment) return null;
      segments.push(segment);
    }

    // Last waypoint → D
    const lastSegment = await calculateRoute(
      waypoints[waypoints.length - 1],
      destination
    );
    if (!lastSegment) return null;
    segments.push(lastSegment);

    // Sum up segments
    const totalDistance = segments.reduce(
      (sum, seg) => sum + seg.distanceValue,
      0
    );
    const totalDuration = segments.reduce(
      (sum, seg) => sum + seg.durationValue,
      0
    );

    const distanceKm = totalDistance / 1000;
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    return {
      distance:
        distanceKm >= 1 ? `${distanceKm.toFixed(1)} km` : `${totalDistance} m`,
      duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      distanceValue: totalDistance,
      durationValue: totalDuration,
      polyline: segments[0].polyline,
      bounds: segments[0].bounds,
    };
  } catch (error) {
    console.error("Error calculating route with waypoints:", error);
    return null;
  }
}

function isPointInGeneralDirection(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  point: { lat: number; lng: number }
): boolean {
  const minLat = Math.min(origin.lat, destination.lat) - 0.5;
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
// EXISTING FUNCTIONS (kept for compatibility)
// ============================================

export async function getPopularRides() {
  try {
    const rides = await getAllRidesWithCoordinates();
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
    let rides = await getAllRidesWithCoordinates();

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
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      console.log("❌ User not authenticated - cannot create ride");
      return { error: "You must be signed in to create a ride" };
    }

    console.log("✅ Creating ride for authenticated user:", userId);

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
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      console.log("⚠️ getUserRides: User not authenticated");
      return [];
    }

    return await getRidesByDriver(userId);
  } catch (error) {
    console.error("Error fetching user rides:", error);
    return [];
  }
}

export async function getUserBookings() {
  try {
    console.log("⚠️ getUserBookings: Not yet implemented");
    return [];
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
}
