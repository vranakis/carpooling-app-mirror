"use client"

import { useEffect, useRef, useState } from "react"
import { Loader, MapPin, Clock, Route } from "lucide-react"
import { calculateRoute } from "@/lib/actions/google-maps"
import { loadGoogleMaps, isGoogleMapsLoaded } from "@/lib/google-maps-loader"
import type { RouteInfo } from "@/lib/actions/google-maps"
import type { PlaceDetails } from "@/lib/actions/places-autocomplete"

interface RouteMapProps {
  origin?: PlaceDetails | null
  destination?: PlaceDetails | null
  routeInfo?: RouteInfo | null
  onRouteCalculated?: (routeInfo: RouteInfo | null) => void
  className?: string
  height?: string
}

export function RouteMap({
  origin,
  destination,
  routeInfo,
  onRouteCalculated,
  className = "",
  height = "h-96"
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRouteInfo, setCurrentRouteInfo] = useState<RouteInfo | null>(routeInfo || null)
  const hasInitialized = useRef(false)

  // Only start loading the map when we have addresses to show
  useEffect(() => {
    if (!origin || !destination) {
      // Clear any existing route info when addresses are removed
      setCurrentRouteInfo(null)
      onRouteCalculated?.(null)
      return
    }

    // Start map loading only when we have both addresses
    if (!hasInitialized.current) {
      setIsMapLoading(true)
      initializeMap()
    } else if (directionsServiceRef.current && directionsRendererRef.current) {
      // Map already initialized, just calculate route
      calculateAndDisplayRoute()
    }
  }, [origin, destination])

  const initializeMap = async () => {
    let isMounted = true

    try {
      // Use centralized Google Maps loader
      await loadGoogleMaps()
      if (!isMounted) return

      // Initialize map after Google Maps is loaded
      initMap()
    } catch (err) {
      console.error("Error initializing map:", err)
      if (isMounted) {
        setError("Failed to initialize map")
        setIsMapLoading(false)
      }
    }

    return () => {
      isMounted = false
    }
  }

  const initMap = () => {
    if (!mapContainerRef.current || hasInitialized.current) return

    try {
      // Verify Google Maps is loaded
      if (!isGoogleMapsLoaded()) {
        throw new Error("Google Maps not loaded")
      }

      hasInitialized.current = true

      // Create map
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 37.9755, lng: 23.7348 }, // Default to Athens
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      // Initialize directions service and renderer
      directionsServiceRef.current = new google.maps.DirectionsService()
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#10b981", // Emerald color
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      })

      directionsRendererRef.current.setMap(mapRef.current)

      setIsMapLoading(false)

      // Calculate route if we have both origin and destination
      if (origin && destination) {
        calculateAndDisplayRoute()
      }
    } catch (err) {
      console.error("Map initialization error:", err)
      setError("Failed to initialize map")
      setIsMapLoading(false)
    }
  }

  const calculateAndDisplayRoute = async () => {
    if (!origin || !destination || !directionsServiceRef.current || !directionsRendererRef.current) {
      return
    }

    setIsRouteLoading(true)

    try {
      // First try to get route info using the new Routes API
      const routeInfo = await calculateRoute(origin, destination)
      
      if (routeInfo) {
        setCurrentRouteInfo(routeInfo)
        onRouteCalculated?.(routeInfo)
      }

      // Still use the legacy Directions API for map visualization
      // as it integrates better with the Google Maps JavaScript API
      const request: google.maps.DirectionsRequest = {
        origin: { placeId: origin.placeId },
        destination: { placeId: destination.placeId },
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current!.setDirections(result)

          // If we didn't get route info from the new API, use legacy data
          if (!routeInfo) {
            const route = result.routes[0]
            const leg = route.legs[0]

            const legacyRouteInfo: RouteInfo = {
              distance: leg.distance?.text || "",
              duration: leg.duration?.text || "",
              distanceValue: leg.distance?.value || 0,
              durationValue: leg.duration?.value || 0,
              polyline: (route.overview_polyline as any)?.points || "",
              bounds: {
                northeast: {
                  lat: route.bounds?.getNorthEast().lat() || 0,
                  lng: route.bounds?.getNorthEast().lng() || 0,
                },
                southwest: {
                  lat: route.bounds?.getSouthWest().lat() || 0,
                  lng: route.bounds?.getSouthWest().lng() || 0,
                },
              },
            }

            setCurrentRouteInfo(legacyRouteInfo)
            onRouteCalculated?.(legacyRouteInfo)
          }
        } else {
          console.error("Directions request failed:", status)
          if (!routeInfo) {
            setCurrentRouteInfo(null)
            onRouteCalculated?.(null)
          }
        }
        setIsRouteLoading(false)
      })
    } catch (err) {
      console.error("Error calculating route:", err)
      setCurrentRouteInfo(null)
      onRouteCalculated?.(null)
      setIsRouteLoading(false)
    }
  }

  // Show error state
  if (error) {
    return (
      <div className={`w-full ${height} rounded-md border flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-red-600 mb-2">Map temporarily unavailable</p>
          <p className="text-sm text-gray-500">Route information will still be calculated</p>
        </div>
      </div>
    )
  }

  // Show placeholder when no addresses are provided
  if (!origin || !destination) {
    return (
      <div className={`w-full ${height} rounded-md border flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Route Preview</p>
          <p className="text-sm text-gray-500">Select origin and destination to see route preview</p>
        </div>
      </div>
    )
  }

  // Show loading state when map is initializing or route is calculating
  if (isMapLoading || isRouteLoading) {
    return (
      <div className={`w-full ${height} rounded-md border flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {isMapLoading ? "Loading map..." : "Calculating route..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${height} rounded-md border overflow-hidden relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Route Information Overlay */}
      {currentRouteInfo && (
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
      )}
    </div>
  )
}
