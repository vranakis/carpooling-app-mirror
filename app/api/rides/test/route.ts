// app/api/rides/test/route.ts
// Create and manage test rides with proper profile handling

import { createRide, getAllRides } from "@/lib/database/helpers";
import { queryNeon, queryNeonSingle } from "@/lib/database/client";
import { NextResponse } from "next/server";

// Test driver profile details
const TEST_DRIVER = {
  id: "00000000-0000-0000-0000-000000000001", // Fixed UUID for testing
  email: "test.driver@example.com",
  first_name: "Test",
  last_name: "Driver",
  phone: "+30 123 456 7890",
};

async function ensureTestProfileExists() {
  try {
    // Check if test profile exists
    const existing = await queryNeonSingle(
      "SELECT id FROM profiles WHERE id = $1",
      [TEST_DRIVER.id]
    );

    if (existing) {
      console.log("✅ Test profile already exists");
      return TEST_DRIVER.id;
    }

    // Create test profile
    console.log("📝 Creating test profile...");
    await queryNeon(
      `INSERT INTO profiles (id, email, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        TEST_DRIVER.id,
        TEST_DRIVER.email,
        TEST_DRIVER.first_name,
        TEST_DRIVER.last_name,
        TEST_DRIVER.phone,
      ]
    );

    console.log("✅ Test profile created");
    return TEST_DRIVER.id;
  } catch (error) {
    console.error("❌ Error ensuring test profile:", error);
    throw error;
  }
}

export async function POST() {
  try {
    console.log("🧪 Creating test ride...");

    // Ensure test profile exists first
    const driverId = await ensureTestProfileExists();

    // Generate random departure time (1-7 days from now)
    const daysFromNow = Math.floor(Math.random() * 7) + 1;
    const departureTime = new Date(
      Date.now() + daysFromNow * 24 * 60 * 60 * 1000
    );

    // Random test routes
    const routes = [
      {
        origin: "Athens, Greece",
        destination: "Thessaloniki, Greece",
        origin_lat: 37.9838,
        origin_lng: 23.7275,
        destination_lat: 40.6401,
        destination_lng: 22.9444,
        distance: 502000, // 502 km
        duration: 18000, // 5 hours
        price: 15.0,
      },
      {
        origin: "Athens, Greece",
        destination: "Patras, Greece",
        origin_lat: 37.9838,
        origin_lng: 23.7275,
        destination_lat: 38.2466,
        destination_lng: 21.7346,
        distance: 215000, // 215 km
        duration: 7800, // 2.17 hours
        price: 8.5,
      },
      {
        origin: "Thessaloniki, Greece",
        destination: "Kavala, Greece",
        origin_lat: 40.6401,
        origin_lng: 22.9444,
        destination_lat: 40.9394,
        destination_lng: 24.4019,
        distance: 165000, // 165 km
        duration: 6000, // 1.67 hours
        price: 7.0,
      },
      {
        origin: "Athens, Greece",
        destination: "Larissa, Greece",
        origin_lat: 37.9838,
        origin_lng: 23.7275,
        destination_lat: 39.639,
        destination_lng: 22.4191,
        distance: 355000, // 355 km
        duration: 12600, // 3.5 hours
        price: 12.0,
      },
      {
        origin: "Heraklion, Greece",
        destination: "Chania, Greece",
        origin_lat: 35.3387,
        origin_lng: 25.1442,
        destination_lat: 35.5138,
        destination_lng: 24.018,
        distance: 143000, // 143 km
        duration: 5400, // 1.5 hours
        price: 6.5,
      },
    ];

    // Pick a random route
    const route = routes[Math.floor(Math.random() * routes.length)];

    // Random available seats (1-4)
    const availableSeats = Math.floor(Math.random() * 4) + 1;

    // Create test ride
    const testRide = await createRide({
      driver_id: driverId,
      origin: route.origin,
      destination: route.destination,
      origin_lat: route.origin_lat,
      origin_lng: route.origin_lng,
      destination_lat: route.destination_lat,
      destination_lng: route.destination_lng,
      departure_time: departureTime,
      available_seats: availableSeats,
      price_per_seat: route.price,
      route_distance: route.distance,
      route_duration: route.duration,
    });

    console.log("✅ Test ride created:", testRide.id);

    return NextResponse.json({
      success: true,
      message: "✅ Test ride created successfully!",
      ride: testRide,
      note: `Using test driver: ${TEST_DRIVER.first_name} ${TEST_DRIVER.last_name}`,
    });
  } catch (error: any) {
    console.error("❌ Failed to create test ride:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("🔍 Fetching all rides...");
    const rides = await getAllRides();

    console.log(`✅ Found ${rides.length} rides`);

    return NextResponse.json({
      success: true,
      count: rides.length,
      rides: rides,
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch rides:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    console.log("🗑️ Deleting all test rides...");

    // Count rides before deletion
    const beforeCount = await queryNeon("SELECT COUNT(*) as count FROM rides");
    const count = parseInt(beforeCount[0].count);

    // Delete all rides
    await queryNeon("DELETE FROM rides");

    // Optionally, also delete the test profile
    // await queryNeon('DELETE FROM profiles WHERE id = $1', [TEST_DRIVER.id]);

    console.log(`✅ Deleted ${count} ride(s)`);

    return NextResponse.json({
      success: true,
      message: `✅ Deleted ${count} ride(s)`,
      count: count,
    });
  } catch (error: any) {
    console.error("❌ Failed to delete rides:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
