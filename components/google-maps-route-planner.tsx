"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "lucide-react"
import { getGoogleMapsApiKey } from "@/lib/actions/google-maps"

interface RouteInfo {
  distance: string
  duration: string
  originCoords: { lat: number; lng: number }
  destinationCoords: { lat: number; lng: number }
}

interface GoogleMapsRoutePlannerProps {
  onRouteCalculated: (routeInfo: RouteInfo | null) => void
}

export function GoogleMapsRoutePlanner({ onRouteCalculated }: GoogleMapsRoutePlannerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    let isMounted = true

    const initializeGoogleMaps = async () => {
      try {
        // Get API key
        const key = await getGoogleMapsApiKey()
        if (!isMounted) return

        setApiKey(key)

        // Create a simple map without autocomplete for now
        if (mapContainerRef.current && !hasInitialized.current) {
          hasInitialized.current = true

          // Load Google Maps script
          const script = document.createElement("script")
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
          script.async = true

          script.onload = () => {
            if (!isMounted || !mapContainerRef.current) return

            try {
              // Simple map initialization
              ;new (window as any).google.maps.Map(mapContainerRef.current, {
                center: { lat: 52.52, lng: 13.405 },
                zoom: 10,
              })

              if (isMounted) {
                setIsLoading(false)
              }
            } catch (err) {
              console.error("Map initialization error:", err)
              if (isMounted) {
                setError("Failed to initialize map")
                setIsLoading(false)
              }
            }
          }

          script.onerror = () => {
            if (isMounted) {
              setError("Failed to load Google Maps")
              setIsLoading(false)
            }
          }

          document.head.appendChild(script)
        }
      } catch (err) {
        console.error("Google Maps setup error:", err)
        if (isMounted) {
          setError("Failed to setup Google Maps")
          setIsLoading(false)
        }
      }
    }

    initializeGoogleMaps()

    return () => {
      isMounted = false
    }
  }, [])

  if (error) {
    return (
      <div className="w-full h-96 rounded-md border flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Maps temporarily unavailable</p>
          <p className="text-sm text-gray-500">You can still create rides without the map preview</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 rounded-md border flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 rounded-md border overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  )
}
