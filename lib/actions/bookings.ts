"use server";

// lib/actions/bookings.ts
// Booking operations using Neon database
// TODO: Add authentication with Clerk later

import { revalidatePath } from "next/cache";
import {
  createBooking as createBookingHelper,
  getBookingsByPassenger,
  getBookingsByRide,
  updateBookingStatus as updateBookingStatusHelper,
  getRideById,
} from "@/lib/database/helpers";

// ============================================
// TEMPORARY: No authentication
// These functions work without auth for testing
// Will add Clerk authentication later
// ============================================

export async function bookRide(formData: FormData) {
  try {
    // TODO: Get user from Clerk authentication
    console.log("⚠️ bookRide: Authentication not implemented");

    return {
      error: "Authentication required. Please wait for Clerk integration.",
    };

    /* WILL BE ENABLED WITH CLERK:
    const { userId } = auth();
    if (!userId) {
      return { error: "You must be logged in to book a ride" };
    }

    const rideId = formData.get("rideId") as string;
    const seatsBooked = parseInt(formData.get("seatsBooked") as string);

    // Check if ride exists and has enough seats
    const ride = await getRideById(rideId);
    
    if (!ride) {
      return { error: "Ride not found" };
    }

    if (ride.driver_id === userId) {
      return { error: "You cannot book your own ride" };
    }

    if (ride.available_seats < seatsBooked) {
      return { error: "Not enough seats available" };
    }

    // Create booking (the helper function will auto-decrease seats via trigger)
    const booking = await createBookingHelper({
      ride_id: rideId,
      passenger_id: userId,
      seats_booked: seatsBooked,
      total_price: ride.price_per_seat * seatsBooked,
    });

    revalidatePath(`/rides/${rideId}`);
    return { success: true, booking };
    */
  } catch (error: any) {
    console.error("Error booking ride:", error);
    return { error: error.message || "Failed to book ride" };
  }
}

export async function getUserBookings() {
  try {
    // TODO: Get user from Clerk and fetch their bookings
    console.log("⚠️ getUserBookings: Authentication not implemented");

    // For now, return empty array
    // When Clerk is added:
    // const { userId } = auth();
    // if (!userId) return [];
    // return await getBookingsByPassenger(userId);

    return [];
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
}

export async function cancelBooking(id: string) {
  try {
    // TODO: Get user from Clerk
    console.log("⚠️ cancelBooking: Authentication not implemented");

    return {
      error: "Authentication required. Please wait for Clerk integration.",
    };

    /* WILL BE ENABLED WITH CLERK:
    const { userId } = auth();
    if (!userId) {
      return { error: "You must be logged in to cancel a booking" };
    }

    // Update booking status to cancelled
    // The trigger will automatically restore available seats
    const updatedBooking = await updateBookingStatusHelper(id, 'cancelled');

    revalidatePath("/my-bookings");
    return { success: true };
    */
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return { error: error.message || "Failed to cancel booking" };
  }
}

export async function createBooking(data: {
  ride_id: string;
  passenger_id: string;
  seats_booked: number;
  total_price: number;
  status?: string;
}) {
  try {
    const booking = await createBookingHelper({
      ride_id: data.ride_id,
      passenger_id: data.passenger_id,
      seats_booked: data.seats_booked,
      total_price: data.total_price,
    });

    return { success: true, booking };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return { error: error.message || "Failed to create booking" };
  }
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    // TODO: Get user from Clerk
    console.log("⚠️ updateBookingStatus: Authentication not implemented");

    return {
      error: "Authentication required. Please wait for Clerk integration.",
    };

    /* WILL BE ENABLED WITH CLERK:
    const { userId } = auth();
    if (!userId) {
      return { error: "You must be logged in to update a booking" };
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return { error: "Invalid status" };
    }

    // Update booking status
    const updatedBooking = await updateBookingStatusHelper(id, status as any);

    revalidatePath(`/bookings`);
    return { success: true };
    */
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return { error: error.message || "Failed to update booking status" };
  }
}

// ============================================
// ADMIN FUNCTIONS (for testing)
// ============================================

// For testing: Get all bookings for a specific ride
export async function getRideBookings(rideId: string) {
  try {
    return await getBookingsByRide(rideId);
  } catch (error) {
    console.error("Error fetching ride bookings:", error);
    return [];
  }
}

// ============================================
// NOTES FOR CLERK MIGRATION
// ============================================

/*
When we add Clerk, uncomment the code blocks above and update imports:

import { auth } from '@clerk/nextjs/server'

Key Changes:
1. Replace console.log warnings with actual auth checks
2. Use auth().userId instead of temporary user IDs
3. Uncomment the commented code blocks
4. Test booking flow with real authentication

The database triggers will handle:
- Auto-decreasing available_seats when booking confirmed
- Auto-increasing available_seats when booking cancelled
- Preventing negative seats
- Validating booking constraints

So we don't need to manually update seats in the code!
*/
