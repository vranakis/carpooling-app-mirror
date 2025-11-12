"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import { Loader, MapPin, Clock, Route } from "lucide-react";
import { calculateRoute, getGoogleMapsApiKey } from "@/lib/actions/google-maps";
import { loadGoogleMaps, isGoogleMapsLoaded } from "@/lib/google-maps-loader";
import type { RouteInfo } from "@/lib/actions/google-maps";
import type { PlaceDetails } from "@/lib/actions/places-autocomplete";

interface RouteMapProps {
  origin?: PlaceDetails | null;
  destination?: PlaceDetails | null;
  routeInfo?: RouteInfo | null;
  onRouteCalculated?: (routeInfo: RouteInfo | null) => void;
  className?: string;
  height?: string;
}

export function RouteMap({
  origin,
  destination,
  routeInfo,
  onRouteCalculated,
  className = "",
  height = "h-96",
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRouteInfo, setCurrentRouteInfo] = useState<RouteInfo | null>(
    routeInfo || null
  );
  const [apiKey, setApiKey] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  // Stabilize origin and destination to prevent unnecessary re-renders
  const originMemo = useMemo(
    () => origin,
    [origin?.placeId, origin?.coordinates?.lat, origin?.coordinates?.lng]
  );
  const destinationMemo = useMemo(
    () => destination,
    [
      destination?.placeId,
      destination?.coordinates?.lat,
      destination?.coordinates?.lng,
    ]
  );

  // Fetch API key for static map fallback
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getGoogleMapsApiKey();
        setApiKey(key);
      } catch (err) {
        console.error("Error fetching API key for static map:", err);
        setError("Failed to load API key for map fallback");
      }
    };
    fetchApiKey();
  }, []);

  const initMap = useCallback(() => {
    if (!mapContainerRef.current) {
      console.error("Map container ref is null in initMap");
      setError("Map container not found");
      setIsMapLoading(false);
      return;
    }

    if (hasInitialized.current) {
      console.log("Map already initialized, skipping creation...");
      if (originMemo && destinationMemo) {
        calculateAndDisplayRoute();
      }
      setIsMapLoading(false);
      return;
    }

    try {
      if (!isGoogleMapsLoaded()) {
        throw new Error("Google Maps API not loaded");
      }

      console.log("Creating Google Map instance...");
      hasInitialized.current = true;

      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 37.9755, lng: 23.7348 }, // Default to Athens
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setIsMapLoading(false);
      console.log("Map initialized, checking for origin and destination:", {
        origin: originMemo
          ? { lat: originMemo.coordinates.lat, lng: originMemo.coordinates.lng }
          : null,
        destination: destinationMemo
          ? {
              lat: destinationMemo.coordinates.lat,
              lng: destinationMemo.coordinates.lng,
            }
          : null,
      });
      if (originMemo && destinationMemo) {
        console.log("Triggering route calculation...");
        calculateAndDisplayRoute();
      }
    } catch (err) {
      console.error("Map initialization error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize map");
      setIsMapLoading(false);
    }
  }, [originMemo, destinationMemo]);

  const calculateAndDisplayRoute = useCallback(
    debounce(async () => {
      if (!originMemo || !destinationMemo) {
        console.log("Missing required data for route calculation:", {
          origin: originMemo,
          destination: destinationMemo,
        });
        return;
      }

      setIsRouteLoading(true);
      console.log("Calculating route for:", {
        origin: {
          lat: originMemo.coordinates.lat,
          lng: originMemo.coordinates.lng,
        },
        destination: {
          lat: destinationMemo.coordinates.lat,
          lng: destinationMemo.coordinates.lng,
        },
      });

      try {
        const routeInfo = await calculateRoute(originMemo, destinationMemo);
        console.log("Routes API result:", routeInfo);

        if (routeInfo && mapRef.current) {
          setCurrentRouteInfo(routeInfo);
          onRouteCalculated?.(routeInfo);

          // Clear previous polyline
          if (polylineRef.current) {
            polylineRef.current.setMap(null);
          }

          // Clear previous markers
          if (originMarkerRef.current) {
            originMarkerRef.current.setMap(null);
          }
          if (destinationMarkerRef.current) {
            destinationMarkerRef.current.setMap(null);
          }

          // Decode polyline and render on map
          const decodedPath = google.maps.geometry.encoding.decodePath(
            routeInfo.polyline
          );
          polylineRef.current = new google.maps.Polyline({
            path: decodedPath,
            strokeColor: "#10b981",
            strokeWeight: 4,
            strokeOpacity: 0.8,
            map: mapRef.current,
          });

          // Add markers for origin and destination using classic Marker API
          originMarkerRef.current = new google.maps.Marker({
            position: originMemo.coordinates,
            map: mapRef.current,
            title: originMemo.address,
            label: {
              text: "A",
              color: "white",
              fontWeight: "bold",
            },
          });

          destinationMarkerRef.current = new google.maps.Marker({
            position: destinationMemo.coordinates,
            map: mapRef.current,
            title: destinationMemo.address,
            label: {
              text: "B",
              color: "white",
              fontWeight: "bold",
            },
          });

          // Fit map to bounds
          const bounds = new google.maps.LatLngBounds();
          bounds.extend({
            lat: routeInfo.bounds.northeast.lat,
            lng: routeInfo.bounds.northeast.lng,
          });
          bounds.extend({
            lat: routeInfo.bounds.southwest.lat,
            lng: routeInfo.bounds.southwest.lng,
          });
          mapRef.current.fitBounds(bounds);
        } else {
          setCurrentRouteInfo(null);
          onRouteCalculated?.(null);
          setError("No route found");
        }
      } catch (err) {
        console.error("Error calculating route:", err);
        setCurrentRouteInfo(null);
        onRouteCalculated?.(null);
        setError(
          err instanceof Error ? err.message : "Failed to calculate route"
        );
      } finally {
        setIsRouteLoading(false);
      }
    }, 500),
    [originMemo, destinationMemo]
  );

  // Initialize map once on component mount
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      console.log("Initiating map loading...");
      setIsMapLoading(true);
      try {
        // Check if Google Maps API is already loaded
        if (typeof window !== "undefined" && window.google?.maps) {
          console.log("Google Maps API already loaded, skipping load attempt.");
        } else {
          await loadGoogleMaps();
        }
        if (!isMounted) {
          console.log("Component unmounted during map loading");
          return;
        }

        // Wait for map container to be available
        const waitForContainer = async (
          retries = 5,
          delay = 100
        ): Promise<void> => {
          if (mapContainerRef.current) {
            initMap();
            return;
          }
          if (retries === 0) {
            throw new Error("Map container ref is null after retries");
          }
          console.log(`Waiting for map container, retries left: ${retries}`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return waitForContainer(retries - 1, delay);
        };

        await waitForContainer();
      } catch (err) {
        console.error("Map initialization error:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to initialize map"
          );
          setIsMapLoading(false);
        }
      }
    };

    initialize();
    return () => {
      isMounted = false;
      console.log("Cleaning up map useEffect");
    };
  }, [initMap]);

  // Calculate and display route when origin or destination changes
  useEffect(() => {
    if (
      hasInitialized.current &&
      isGoogleMapsLoaded() &&
      originMemo &&
      destinationMemo
    ) {
      console.log("Origin or destination changed, recalculating route...");
      calculateAndDisplayRoute();
    }
  }, [originMemo, destinationMemo, calculateAndDisplayRoute]);

  // Always render the map container
  return (
    <div
      className={`w-full ${height} rounded-md border overflow-hidden relative ${className}`}
    >
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: "384px" }}
      />
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-sm text-gray-500">
              Route information will still be calculated
            </p>
            {originMemo && destinationMemo && apiKey && (
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=37.9755,23.7348&zoom=6&size=600x400&key=${apiKey}`}
                alt="Static map fallback"
                className="w-full h-48 mt-2 rounded-md object-cover"
              />
            )}
          </div>
        </div>
      ) : isMapLoading || isRouteLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {isMapLoading ? "Loading map..." : "Calculating route..."}
            </p>
          </div>
        </div>
      ) : currentRouteInfo ? (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center space-x-2 text-sm">
            <Route className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">Route Details</span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="h-3 w-3" />
              <span>{currentRouteInfo.distance}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>{currentRouteInfo.duration}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
