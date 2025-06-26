"use server";

export async function getGoogleMapsApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_API_KEY in your environment variables."
    );
  }

  if (!apiKey.startsWith("AIza")) {
    console.warn(
      "Google Maps API key format is invalid. It should start with 'AIza'."
    );
    throw new Error(
      "Invalid Google Maps API key format. Key should start with 'AIza'."
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
  distanceValue: number;
  durationValue: number;
  polyline: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export async function calculateRoute(
  origin: PlaceDetails,
  destination: PlaceDetails,
  maxRetries = 3,
  retryDelay = 1000
): Promise<RouteInfo | null> {
  let retries = 0;

  const attemptRouteCalculation = async (): Promise<RouteInfo | null> => {
    try {
      const apiKey = await getGoogleMapsApiKey();
      const requestBody = {
        origin: {
          location: {
            latLng: {
              latitude: origin.coordinates.lat,
              longitude: origin.coordinates.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.coordinates.lat,
              longitude: destination.coordinates.lng,
            },
          },
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

      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(
          () =>
            reject(new Error("Route calculation timed out after 30 seconds")),
          30000
        );
      });

      console.log(`Attempt ${retries + 1}/${maxRetries} to calculate route:`, {
        origin: { lat: origin.coordinates.lat, lng: origin.coordinates.lng },
        destination: {
          lat: destination.coordinates.lat,
          lng: destination.coordinates.lng,
        },
      });

      const response = await Promise.race([
        fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.viewport",
          },
          body: JSON.stringify(requestBody),
        }),
        timeoutPromise,
      ]);

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => "Failed to read error response");
        console.error(
          `Routes API error: ${response.status} ${response.statusText}`,
          errorText
        );
        throw new Error(`Routes API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Routes API response:", JSON.stringify(data, null, 2));

      if (!data.routes || data.routes.length === 0) {
        console.error("No routes found:", data);
        throw new Error("No routes found");
      }

      const route = data.routes[0];
      const durationSeconds = parseInt(route.duration.replace("s", ""));
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      const distanceKm = route.distanceMeters / 1000;
      const distanceText =
        distanceKm >= 1
          ? `${distanceKm.toFixed(1)} km`
          : `${route.distanceMeters} m`;

      return {
        distance: distanceText,
        duration: durationText,
        distanceValue: route.distanceMeters,
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
      if (retries < maxRetries) {
        retries++;
        console.warn(
          `Route calculation failed, retrying (${retries}/${maxRetries})...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return attemptRouteCalculation();
      }
      console.error("Error calculating route with Routes API:", error);
      throw error;
    }
  };

  return attemptRouteCalculation();
}

export async function validatePlaceId(
  placeId: string
): Promise<PlaceDetails | null> {
  try {
    const apiKey = await getGoogleMapsApiKey();
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,formattedAddress,location&key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Places API error:", response.status, response.statusText);
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
