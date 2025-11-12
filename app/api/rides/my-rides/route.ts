// app/api/rides/my-rides/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRidesByDriver } from "@/lib/database/helpers";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Fetching rides for user:", userId);

    // Get rides where user is the driver
    const rides = await getRidesByDriver(userId);

    console.log(`Found ${rides.length} rides for user`);

    return NextResponse.json({
      success: true,
      rides,
      count: rides.length,
    });
  } catch (error: any) {
    console.error("Error fetching user rides:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
