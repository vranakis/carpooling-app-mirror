// app/api/rides/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRide } from "@/lib/database/helpers";
import { getCurrentUser } from "@/lib/actions/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    console.log("✅ Authenticated user:", userId);

    // Ensure user profile exists in database
    const user = await getCurrentUser();
    if (!user) {
      console.log("⚠️ Profile not found, but continuing...");
    } else {
      console.log("✅ User profile found:", user.email);
    }

    const body = await request.json();
    console.log("📝 Received ride data:", body);

    // Validate required fields
    if (
      !body.origin ||
      !body.destination ||
      !body.departure_time ||
      !body.available_seats ||
      body.price_per_seat === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate data
    if (body.available_seats < 1 || body.available_seats > 8) {
      return NextResponse.json(
        { success: false, error: "Available seats must be between 1 and 8" },
        { status: 400 }
      );
    }

    if (body.price_per_seat < 0) {
      return NextResponse.json(
        { success: false, error: "Price cannot be negative" },
        { status: 400 }
      );
    }

    // Validate departure time is in the future
    const departureTime = new Date(body.departure_time);
    if (departureTime < new Date()) {
      return NextResponse.json(
        { success: false, error: "Departure time must be in the future" },
        { status: 400 }
      );
    }

    console.log("🚀 Creating ride in database...");

    // Create the ride
    const ride = await createRide({
      driver_id: userId,
      origin: body.origin,
      destination: body.destination,
      origin_lat: body.origin_lat,
      origin_lng: body.origin_lng,
      destination_lat: body.destination_lat,
      destination_lng: body.destination_lng,
      departure_time: departureTime,
      available_seats: body.available_seats,
      price_per_seat: body.price_per_seat,
      route_distance: body.route_distance || null,
      route_duration: body.route_duration || null,
    });

    console.log("✅ Ride created successfully:", ride.id);

    return NextResponse.json({
      success: true,
      ride,
      message: "Ride created successfully",
    });
  } catch (error: any) {
    console.error("❌ Error creating ride:", error);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
