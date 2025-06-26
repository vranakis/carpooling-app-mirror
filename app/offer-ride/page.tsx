"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRide } from "@/lib/actions/rides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServerAddressAutocomplete } from "@/components/server-address-autocomplete";
import { RouteMap } from "@/components/route-map";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import type { RouteInfo, PlaceDetails } from "@/lib/actions/google-maps";

export default function OfferRidePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [originPlace, setOriginPlace] = useState<PlaceDetails | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceDetails | null>(
    null
  );
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Origin Place:", originPlace);
    console.log("Destination Place:", destinationPlace);

    try {
      const formData = new FormData(e.currentTarget);
      console.log("Submitting ride form...");

      const result = await createRide(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      console.log("Ride created successfully:", result.ride);
      toast.success("Ride created successfully!");
      router.push("/my-rides?tab=offering");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to create ride");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Offer a Ride</CardTitle>
            <CardDescription>
              Share your journey and help others travel sustainably
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <ServerAddressAutocomplete
                  label="Origin Address"
                  placeholder="Enter departure address (e.g., Syntagma Square, Athens)"
                  name="origin"
                  required
                  onPlaceSelected={setOriginPlace}
                />
                <ServerAddressAutocomplete
                  label="Destination Address"
                  placeholder="Enter arrival address (e.g., Piraeus Port, Athens)"
                  name="destination"
                  required
                  onPlaceSelected={setDestinationPlace}
                />
                {originPlace && (
                  <>
                    <input
                      type="hidden"
                      name="originPlaceId"
                      value={originPlace.placeId}
                    />
                    <input
                      type="hidden"
                      name="originCoordinates"
                      value={JSON.stringify(originPlace.coordinates)}
                    />
                    <input
                      type="hidden"
                      name="originFormatted"
                      value={originPlace.formattedAddress}
                    />
                  </>
                )}
                {destinationPlace && (
                  <>
                    <input
                      type="hidden"
                      name="destinationPlaceId"
                      value={destinationPlace.placeId}
                    />
                    <input
                      type="hidden"
                      name="destinationCoordinates"
                      value={JSON.stringify(destinationPlace.coordinates)}
                    />
                    <input
                      type="hidden"
                      name="destinationFormatted"
                      value={destinationPlace.formattedAddress}
                    />
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  name="departureTime"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availableSeats">Available Seats</Label>
                  <Input
                    id="availableSeats"
                    name="availableSeats"
                    type="number"
                    min="1"
                    max="8"
                    defaultValue="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Seat (€)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0.00"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating Ride...
                  </>
                ) : (
                  "Offer Ride"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        {/* Map Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Route Preview</CardTitle>
            <CardDescription>
              {originPlace && destinationPlace
                ? "Interactive route map with distance and duration"
                : "Select origin and destination to see route preview"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0" style={{ height: "400px" }}>
            <RouteMap
              origin={originPlace}
              destination={destinationPlace}
              onRouteCalculated={setRouteInfo}
              height="h-96"
            />
          </CardContent>
          {routeInfo && (
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="font-medium text-emerald-700">Distance</p>
                  <p className="text-lg font-bold text-emerald-900">
                    {routeInfo.distance}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">Duration</p>
                  <p className="text-lg font-bold text-blue-900">
                    {routeInfo.duration}
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
