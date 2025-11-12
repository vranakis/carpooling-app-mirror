"use server";

// lib/actions/rides.ts
// Ride operations using Neon database
// TODO: Add authentication with Clerk later

import { revalidatePath } from "next/cache";
import {
  getAllRides,
  getRideById as getRideByIdHelper,
  createRide as createRideHelper,
  searchRides as searchRidesHelper,
  getRidesByDriver,
} from "@/lib/database/helpers";

// ============================================
// TEMPORARY: No authentication
// These functions work without auth for testing
// Will add Clerk authentication later
// ============================================

export async function getPopularRides() {
  try {
    // Get first 5 active rides
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
    // For now, just get all rides and filter in memory
    // TODO: Optimize with proper SQL queries
    let rides = await getAllRides();

    // Filter by origin (case-insensitive)
    if (options.origin) {
      rides = rides.filter((ride) =>
        ride.origin.toLowerCase().includes(options.origin!.toLowerCase())
      );
    }

    // Filter by destination (case-insensitive)
    if (options.destination) {
      rides = rides.filter((ride) =>
        ride.destination
          .toLowerCase()
          .includes(options.destination!.toLowerCase())
      );
    }

    // Filter by date
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

    // Apply pagination
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

export async function searchRidesAction(formData: FormData) {
  try {
    const origin = formData.get("origin")?.toString();
    const destination = formData.get("destination")?.toString();
    const date = formData.get("date")?.toString();

    console.log("Search parameters:", { origin, destination, date });

    // Get rides with filters
    const rides = await getRides({
      origin,
      destination,
      date,
      status: "active",
    });

    console.log(`Found ${rides.length} matching rides`);
    return rides;
  } catch (error) {
    console.error("Error searching rides:", error);
    return [];
  }
}

export async function createRide(formData: FormData) {
  try {
    // TODO: Get user from Clerk authentication
    // For now, use a temporary user ID
    console.log("⚠️ Creating ride without authentication");

    const origin = formData.get("origin") as string;
    const destination = formData.get("destination") as string;
    const departureTime = formData.get("departureTime") as string;
    const availableSeats = parseInt(formData.get("availableSeats") as string);
    const price = parseFloat(formData.get("price") as string);

    // Get optional Google Maps data
    const originPlaceId = formData.get("originPlaceId") as string;
    const destinationPlaceId = formData.get("destinationPlaceId") as string;
    const originCoordinates = formData.get("originCoordinates") as string;
    const destinationCoordinates = formData.get(
      "destinationCoordinates"
    ) as string;

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

    // Parse coordinates if available
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

    // TODO: Replace with real user ID from Clerk
    const tempDriverId = "00000000-0000-0000-0000-000000000000"; // Placeholder

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
      // TODO: Add route calculation with Google Directions API
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
    // TODO: Get user from Clerk and fetch their rides
    console.log("⚠️ getUserRides: Authentication not implemented");

    // For now, return empty array
    // When Clerk is added, this will be:
    // const { userId } = auth();
    // return await getRidesByDriver(userId);

    return [];
  } catch (error) {
    console.error("Error fetching user rides:", error);
    return [];
  }
}

export async function getUserBookings() {
  try {
    // TODO: Get user from Clerk and fetch their bookings
    console.log("⚠️ getUserBookings: Authentication not implemented");

    // For now, return empty array
    // When Clerk is added, this will fetch from bookings table

    return [];
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Parse POINT(x,y) string to coordinates
export async function parsePoint(
  point: string
): Promise<{ lat: number; lng: number }> {
  const matches = point.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!matches) return { lat: 0, lng: 0 };
  return {
    lat: parseFloat(matches[2]),
    lng: parseFloat(matches[1]),
  };
}

// ============================================
// NOTES FOR CLERK MIGRATION
// ============================================

/*
When we add Clerk, update these functions:

import { auth, currentUser } from '@clerk/nextjs/server'

export async function createRide(formData: FormData) {
  const { userId } = auth();
  if (!userId) {
    return { error: "You must be logged in to create a ride" };
  }
  
  // Rest of the function stays the same, but use userId instead of tempDriverId
  const ride = await createRideHelper({
    driver_id: userId,
    // ... rest of fields
  });
}

export async function getUserRides() {
  const { userId } = auth();
  if (!userId) return [];
  
  return await getRidesByDriver(userId);
}
*/
