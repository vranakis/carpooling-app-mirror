"use server";

import { getGoogleMapsApiKey } from "./google-maps";

export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
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

// Get autocomplete predictions using the new Places API
export async function getAutocompletePredictions(
  input: string,
  sessionToken?: string
): Promise<AutocompletePrediction[]> {
  if (!input.trim()) {
    return [];
  }

  try {
    const apiKey = await getGoogleMapsApiKey();

    const requestBody = {
      input: input.trim(),
      locationRestriction: {
        rectangle: {
          low: {
            latitude: 37.8,  // Southern Athens area
            longitude: 23.6, // Western Athens area
          },
          high: {
            latitude: 38.2,  // Northern Athens area
            longitude: 24.1, // Eastern Athens area
          },
        },
      },
      includedPrimaryTypes: ["establishment", "geocode"],
      languageCode: "el", // Greek language
      regionCode: "GR",   // Greece region
      sessionToken: sessionToken || undefined,
    };

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      console.error("Places Autocomplete API error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      return [];
    }

    const data = await response.json();

    if (!data.suggestions) {
      return [];
    }

    return data.suggestions
      .filter((suggestion: any) => suggestion.placePrediction)
      .map((suggestion: any) => {
        const prediction = suggestion.placePrediction;
        return {
          placeId: prediction.placeId,
          description: prediction.text.text,
          mainText: prediction.structuredFormat?.mainText?.text || prediction.text.text,
          secondaryText: prediction.structuredFormat?.secondaryText?.text || "",
        };
      })
      .slice(0, 5); // Limit to 5 suggestions
  } catch (error) {
    console.error("Error getting autocomplete predictions:", error);
    return [];
  }
}

// Get place details using the new Places API
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails | null> {
  try {
    const apiKey = await getGoogleMapsApiKey();

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
        },
      }
    );

    if (!response.ok) {
      console.error("Places Details API error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error details:", errorText);
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
    console.error("Error getting place details:", error);
    return null;
  }
}
