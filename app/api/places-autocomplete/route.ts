import { getAutocompletePredictions } from "@/lib/actions/places-autocomplete";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { input, sessionToken } = await req.json();
    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const predictions = await getAutocompletePredictions(input, sessionToken);
    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Error fetching autocomplete predictions:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}
