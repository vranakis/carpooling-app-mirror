"use server"

export async function getGoogleMapsApiKey() {
  // Remove NEXT_PUBLIC_ prefix since we're serving from server now
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error("Google Maps API key not configured")
  }

  return apiKey
}
