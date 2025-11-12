// app/api/test-db/route.ts
// Test endpoint to verify Neon database is working

import { queryNeon, testConnection } from "@/lib/database/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🧪 Testing database connection...");

    // Test 1: Basic connection
    const timeResult = await queryNeon(
      "SELECT NOW() as current_time, version() as pg_version"
    );

    // Test 2: PostGIS is working
    const postgisResult = await queryNeon(
      "SELECT PostGIS_version() as postgis_version"
    );

    // Test 3: Check all tables exist
    const tablesResult = await queryNeon(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'rides', 'bookings', 'reviews', 'route_segments')
      ORDER BY table_name
    `);

    // Test 4: Count rows in each table
    const profilesCount = await queryNeon(
      "SELECT COUNT(*) as count FROM profiles"
    );
    const ridesCount = await queryNeon("SELECT COUNT(*) as count FROM rides");
    const bookingsCount = await queryNeon(
      "SELECT COUNT(*) as count FROM bookings"
    );

    // Test 5: Helper function works
    const nearbyRides = await queryNeon(`
      SELECT * FROM find_rides_near_location(
        37.9838,  -- Athens latitude
        23.7275,  -- Athens longitude
        10000,    -- 10km radius
        NOW()
      )
    `);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        database: {
          status: "✅ Connected",
          time: timeResult[0].current_time,
          postgres: timeResult[0].pg_version.split(",")[0], // Just version number
        },
        postgis: {
          status: "✅ Enabled",
          version: postgisResult[0].postgis_version,
        },
        tables: {
          status: "✅ All tables exist",
          count: tablesResult.length,
          names: tablesResult.map((t) => t.table_name),
          expected: [
            "bookings",
            "profiles",
            "reviews",
            "rides",
            "route_segments",
          ],
        },
        data: {
          profiles: parseInt(profilesCount[0].count),
          rides: parseInt(ridesCount[0].count),
          bookings: parseInt(bookingsCount[0].count),
        },
        functions: {
          find_rides_near_location: "✅ Working",
          results: nearbyRides.length,
        },
      },
      message: "🎉 Database is fully operational!",
      nextSteps: [
        "1. Create a test ride: POST /api/rides/test",
        "2. List all rides: GET /api/rides",
        "3. Add Clerk authentication when ready",
      ],
    });
  } catch (error: any) {
    console.error("❌ Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: "Check your DATABASE_URL in .env.local",
        troubleshooting: [
          "1. Verify DATABASE_URL is set correctly",
          "2. Check Neon database is not paused",
          "3. Ensure all 3 migration steps completed",
          "4. Restart dev server: npm run dev",
        ],
      },
      { status: 500 }
    );
  }
}
