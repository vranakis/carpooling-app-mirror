"use client";

import { formatDistanceToNow, format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import Link from "next/link";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import type { PlaceDetails } from "@/lib/actions/places-autocomplete";

interface RideCardProps {
  ride: {
    id: string;
    departure_time: string;
    origin?: string;
    departure_location: string;
    destination: string;
    price?: number;
    available_seats: number;
    totalDistance?: number;
    totalDuration?: number;
    description?: string;
    driver: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
    fullRouteDirections?: google.maps.DirectionsResult | null;
    matchedSegmentDirections?: google.maps.DirectionsResult | null;
    routePoints: PlaceDetails[];
  };
  showActions?: boolean;
  searchOriginPlaceId?: string;
  searchDestinationPlaceId?: string;
}

export function RideCard({
  ride,
  showActions = true,
  searchOriginPlaceId = "",
  searchDestinationPlaceId = "",
}: RideCardProps) {
  const departureDate = new Date(ride.departure_time);
  const formattedDate = format(departureDate, "MMM d, yyyy");
  const formattedTime = format(departureDate, "h:mm a");
  const timeFromNow = formatDistanceToNow(departureDate, { addSuffix: true });

  const driver = ride.driver || {};
  const driverName =
    `${driver.first_name || ""} ${driver.last_name || ""}`.trim() ||
    "Unknown Driver";
  const driverInitials = driverName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Use routePoints from ride
  const routePoints: PlaceDetails[] = ride.routePoints || [
    {
      placeId: "",
      address: ride.departure_location || ride.origin || "Unknown Origin",
      coordinates: { lat: 0, lng: 0 },
      formattedAddress:
        ride.departure_location || ride.origin || "Unknown Origin",
    },
    {
      placeId: "",
      address: ride.destination || "Unknown Destination",
      coordinates: { lat: 0, lng: 0 },
      formattedAddress: ride.destination || "Unknown Destination",
    },
  ];

  // Find matched segment indices
  let matchedSegmentStartIndex = -1;
  let matchedSegmentEndIndex = -1;
  if (searchOriginPlaceId && searchDestinationPlaceId) {
    matchedSegmentStartIndex = routePoints.findIndex(
      (point) => point.placeId === searchOriginPlaceId
    );
    matchedSegmentEndIndex = routePoints.findIndex(
      (point) => point.placeId === searchDestinationPlaceId
    );
  }

  // Map options
  const mapOptions = {
    center: routePoints[0]?.coordinates || { lat: 0, lng: 0 },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">
              {ride.origin || ride.departure_location} to {ride.destination}
            </CardTitle>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate} • <Clock className="h-4 w-4 mx-1" />{" "}
              {formattedTime}
              <Badge variant="outline" className="ml-2">
                {timeFromNow}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {typeof ride.price === "number"
                ? `$${ride.price.toFixed(2)}`
                : "Price unavailable"}
            </div>
            <div className="text-sm text-muted-foreground">per seat</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mb-3">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src={
                driver.avatar_url ||
                "/placeholder.svg?height=40&width=40&query=avatar"
              }
              alt={driverName}
            />
            <AvatarFallback>{driverInitials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{driverName}</div>
            <div className="text-xs text-muted-foreground">Driver</div>
          </div>
        </div>

        <div className="flex items-center text-sm mb-3">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{ride.available_seats} seats available</span>
        </div>

        {ride.totalDistance && (
          <div className="text-sm text-muted-foreground mb-3">
            Distance: {(ride.totalDistance / 1000).toFixed(1)} km
          </div>
        )}
        {ride.totalDuration && (
          <div className="text-sm text-muted-foreground mb-3">
            Duration: {Math.round(ride.totalDuration / 60)} min
          </div>
        )}

        <div className="mb-3">
          <div className="font-medium text-sm mb-1">Route:</div>
          <ul className="text-sm text-muted-foreground">
            {routePoints.map((point, index) => (
              <li key={index} className="flex items-center">
                <MapPin
                  className={`h-4 w-4 mr-2 ${
                    index === matchedSegmentStartIndex ||
                    index === matchedSegmentEndIndex
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                  }`}
                />
                {point.address || point.formattedAddress || "Waypoint"}
                {index === matchedSegmentStartIndex &&
                  matchedSegmentEndIndex > index && (
                    <span className="ml-2 text-emerald-500 font-medium">
                      (Your pickup)
                    </span>
                  )}
                {index === matchedSegmentEndIndex && (
                  <span className="ml-2 text-emerald-500 font-medium">
                    (Your drop-off)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}
          libraries={["geometry", "places"]}
        >
          <GoogleMap
            mapContainerStyle={{
              height: "200px",
              width: "100%",
              borderRadius: "8px",
            }}
            options={mapOptions}
          >
            {ride.fullRouteDirections && (
              <DirectionsRenderer
                options={{
                  directions: ride.fullRouteDirections,
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: "#0000FF", // Blue for full route
                    strokeWeight: 4,
                  },
                }}
              />
            )}
            {ride.matchedSegmentDirections && (
              <DirectionsRenderer
                options={{
                  directions: ride.matchedSegmentDirections,
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: "#10B981", // Emerald green for matched segment
                    strokeWeight: 6,
                  },
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>

        {ride.description && (
          <div className="mt-3 text-sm text-muted-foreground">
            {ride.description}
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="pt-2">
          <div className="flex w-full gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/ride/${ride.id}`}>View Details</Link>
            </Button>
            <Button
              asChild
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              <Link href={`/book/${ride.id}`}>Book Seat</Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
