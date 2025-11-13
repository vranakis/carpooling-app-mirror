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
import { Loader, AlertCircle } from "lucide-react";
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

    // Validate places are selected
    if (!originPlace || !destinationPlace) {
      toast.error("Please select both origin and destination addresses");
      return;
    }

    // Optional: Wait for route calculation if not ready
    if (!routeInfo) {
      toast.warning("Route is being calculated, please wait...");
      return;
    }

    setIsLoading(true);

    console.log("Origin Place:", originPlace);
    console.log("Destination Place:", destinationPlace);
    console.log("Route Info:", routeInfo);

    try {
      const formData = new FormData(e.currentTarget);

      // Add route distance and duration to form data
      if (routeInfo) {
        formData.append("routeDistance", routeInfo.distanceValue.toString());
        formData.append("routeDuration", routeInfo.durationValue.toString());
        formData.append("routePolyline", routeInfo.polyline);
      }

      console.log("Submitting ride form...");

      const result = await createRide(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      console.log("Ride created successfully:", result.ride);
      toast.success("Ride created successfully!");

      // Redirect to rides page or my-rides
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
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer a Ride</h1>
        <p className="text-gray-600">
          Share your journey and help others travel sustainably
        </p>
      </div>

      {/* Temporary Notice - Remove when Clerk is added */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800 mb-1">🧪 Testing Mode</h3>
          <p className="text-sm text-blue-600">
            Authentication will be added with Clerk. For now, rides are created
            using a test driver account.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Ride Details</CardTitle>
            <CardDescription>Enter your journey information</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Address Inputs */}
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
                  placeholder="Enter arrival address (e.g., White Tower, Thessaloniki)"
                  name="destination"
                  required
                  onPlaceSelected={setDestinationPlace}
                />
                {/* Hidden fields for place data */}
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

              {/* Route Info Display */}
              {routeInfo && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm font-medium text-emerald-800 mb-2">
                    ✅ Route Calculated
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-emerald-600">Distance</p>
                      <p className="font-semibold text-emerald-900">
                        {routeInfo.distance}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Duration</p>
                      <p className="font-semibold text-emerald-900">
                        {routeInfo.duration}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Departure Time */}
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  name="departureTime"
                  type="datetime-local"
                  required
                  disabled={isLoading}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Seats and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availableSeats">Available Seats</Label>
                  <Input
                    id="availableSeats"
                    name="availableSeats"
                    type="number"
                    min="1"
                    max="8"
                    defaultValue="2"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Seat (€)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.50"
                    defaultValue="10.00"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                <p className="font-medium mb-2">💡 Tips for offering rides:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Select accurate addresses for best route calculation</li>
                  <li>Set a fair price based on fuel costs and distance</li>
                  <li>Allow enough time for potential delays</li>
                  <li>Be clear about pickup location details</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading || !originPlace || !destinationPlace}
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
          <CardContent className="p-0">
            <RouteMap
              origin={originPlace}
              destination={destinationPlace}
              onRouteCalculated={setRouteInfo}
              height="h-[500px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-6 flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/rides")}
        >
          View All Rides
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/test-rides")}
        >
          Manage Test Rides
        </Button>
      </div>
    </div>
  );
}
