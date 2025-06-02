"use server";

export async function getGoogleMapsApiKey() {
  // Try both environment variable names for compatibility
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_API_KEY in your environment variables."
    );
  }

  return apiKey;
}

export interface PlaceDetails {
  placeId: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
  polyline: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

// Calculate route between two places using the new Routes API
export async function calculateRoute(
  origin: PlaceDetails,
  destination: PlaceDetails
): Promise<RouteInfo | null> {
  try {
    const apiKey = await getGoogleMapsApiKey();

    // Use the new Routes API (New)
    const requestBody = {
      origin: {
        placeId: origin.placeId,
      },
      destination: {
        placeId: destination.placeId,
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false,
      },
    };

    const response = await fetch(
      `https://routes.googleapis.com/directions/v2:computeRoutes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.viewport',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      console.error("Routes API (New) error:", response.status, response.statusText);
      // Fallback to legacy Directions API
      return calculateRouteLegacy(origin, destination);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.error("No routes found:", data);
      return calculateRouteLegacy(origin, destination);
    }

    const route = data.routes[0];

    // Convert duration from seconds string to readable format
    const durationSeconds = parseInt(route.duration.replace('s', ''));
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Convert distance from meters to readable format
    const distanceMeters = route.distanceMeters;
    const distanceKm = distanceMeters / 1000;
    const distanceText = distanceKm >= 1 ? `${distanceKm.toFixed(1)} km` : `${distanceMeters} m`;

    return {
      distance: distanceText,
      duration: durationText,
      distanceValue: distanceMeters,
      durationValue: durationSeconds,
      polyline: route.polyline.encodedPolyline,
      bounds: {
        northeast: {
          lat: route.viewport.high.latitude,
          lng: route.viewport.high.longitude,
        },
        southwest: {
          lat: route.viewport.low.latitude,
          lng: route.viewport.low.longitude,
        },
      },
    };
  } catch (error) {
    console.error("Error calculating route:", error);
    // Fallback to legacy API
    return calculateRouteLegacy(origin, destination);
  }
}

// Fallback function using legacy Directions API
async function calculateRouteLegacy(
  origin: PlaceDetails,
  destination: PlaceDetails
): Promise<RouteInfo | null> {
  try {
    const apiKey = await getGoogleMapsApiKey();

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=place_id:${origin.placeId}&` +
        `destination=place_id:${destination.placeId}&` +
        `key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
      console.error("Directions API error:", data);
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance.text,
      duration: leg.duration.text,
      distanceValue: leg.distance.value,
      durationValue: leg.duration.value,
      polyline: route.overview_polyline.points,
      bounds: {
        northeast: {
          lat: route.bounds.northeast.lat,
          lng: route.bounds.northeast.lng,
        },
        southwest: {
          lat: route.bounds.southwest.lat,
          lng: route.bounds.southwest.lng,
        },
      },
    };
  } catch (error) {
    console.error("Error calculating route with legacy API:", error);
    return null;
  }
}

// Validate a place ID using the new Places API
export async function validatePlaceId(
  placeId: string
): Promise<PlaceDetails | null> {
  try {
    const apiKey = await getGoogleMapsApiKey();

    // Use the new Places API (New) endpoint
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?` +
        `fields=id,displayName,formattedAddress,location&` +
        `key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error("Places API (New) error:", response.status, response.statusText);
      return null;
    }

    const place = await response.json();

    if (!place.id || !place.location) {
      console.error("Invalid place data:", place);
      return null;
    }

    return {
      placeId: place.id,
      address: place.displayName?.text || place.formattedAddress || "",
      coordinates: {
        lat: place.location.latitude,
        lng: place.location.longitude,
      },
      formattedAddress: place.formattedAddress || "",
    };
  } catch (error) {
    console.error("Error validating place ID:", error);
    return null;
  }
}
