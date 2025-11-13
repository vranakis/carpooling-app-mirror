// app/api/rides/my-rides/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRidesByDriver } from "@/lib/database/helpers";

export async function GET(request: NextRequest) {
  try {
    // Check authentication - Clerk handles this server-side
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    console.log("📋 Fetching rides for authenticated user:", userId);

    // Get rides where user is the driver
    const rides = await getRidesByDriver(userId);

    console.log(
      `✅ Found ${rides.length} ride(s) for user ${userId.slice(0, 8)}...`
    );

    return NextResponse.json({
      success: true,
      rides,
      count: rides.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching user rides:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        rides: [],
      },
      { status: 500 }
    );
  }
}
