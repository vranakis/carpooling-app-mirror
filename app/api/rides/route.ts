// app/api/rides/route.ts
// GET endpoint to fetch all active rides (no auth required for browsing)

import { NextRequest, NextResponse } from "next/server";
import { getAllRides } from "@/lib/database/helpers";

export async function GET(request: NextRequest) {
  try {
    console.log("📋 API /api/rides - Fetching all active rides...");

    // Get all active rides from database
    const rides = await getAllRides();

    console.log(`✅ API /api/rides - Found ${rides.length} active rides`);

    return NextResponse.json({
      success: true,
      rides,
      count: rides.length,
    });
  } catch (error: any) {
    console.error("❌ API /api/rides - Error fetching rides:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch rides",
        errorDetails: error.toString(),
        rides: [],
      },
      { status: 500 }
    );
  }
}

// Note: This is a public endpoint (no auth required)
// Users can browse rides without logging in
// Authentication will be added with Clerk for creating/booking rides
