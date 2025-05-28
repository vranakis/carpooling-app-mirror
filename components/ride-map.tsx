"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

interface RideMapProps {
  originCoordinates: [number, number]
  destinationCoordinates: [number, number]
  originName: string
  destinationName: string
  driverLocation?: [number, number]
}

export default function RideMap({
  originCoordinates,
  destinationCoordinates,
  originName,
  destinationName,
  driverLocation,
}: RideMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // This would be your actual Mapbox token in a real app
  // In a production app, you would store this in an environment variable
  const mapboxToken = "pk.dummy.token"

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = mapboxToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [
        (originCoordinates[0] + destinationCoordinates[0]) / 2,
        (originCoordinates[1] + destinationCoordinates[1]) / 2,
      ],
      zoom: 5,
    })

    map.current.on("load", () => {
      setMapLoaded(true)
    })

    // Clean up on unmount
    return () => {
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !map.current) return

    // Add origin marker
    new mapboxgl.Marker({ color: "#10b981" })
      .setLngLat(originCoordinates)
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${originName}</strong>`))
      .addTo(map.current)

    // Add destination marker
    new mapboxgl.Marker({ color: "#10b981" })
      .setLngLat(destinationCoordinates)
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${destinationName}</strong>`))
      .addTo(map.current)

    // Add driver location marker if available
    if (driverLocation) {
      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat(driverLocation)
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Driver location</strong>"))
        .addTo(map.current)
    }

    // Add route line
    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [originCoordinates, destinationCoordinates],
        },
      },
    })

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#10b981",
        "line-width": 4,
        "line-opacity": 0.75,
      },
    })

    // Fit bounds to show both markers
    const bounds = new mapboxgl.LngLatBounds()
    bounds.extend(originCoordinates)
    bounds.extend(destinationCoordinates)
    if (driverLocation) bounds.extend(driverLocation)

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 12,
    })
  }, [mapLoaded, originCoordinates, destinationCoordinates, driverLocation, originName, destinationName])

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-md text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
          <span>Origin & Destination</span>
        </div>
        {driverLocation && (
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Driver Location</span>
          </div>
        )}
      </div>
    </div>
  )
}
