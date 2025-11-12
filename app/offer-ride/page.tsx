"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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
import { Loader2 } from "lucide-react";

// Predefined Greek cities with coordinates for MVP
const GREEK_CITIES = [
  { name: "Athens", lat: 37.9838, lng: 23.7275 },
  { name: "Thessaloniki", lat: 40.6401, lng: 22.9444 },
  { name: "Patras", lat: 38.2466, lng: 21.7346 },
  { name: "Heraklion", lat: 35.3387, lng: 25.1442 },
  { name: "Larissa", lat: 39.639, lng: 22.4197 },
  { name: "Volos", lat: 39.3617, lng: 22.9444 },
  { name: "Kavala", lat: 40.9396, lng: 24.4072 },
  { name: "Chania", lat: 35.5138, lng: 24.018 },
  { name: "Rhodes", lat: 36.4341, lng: 28.2176 },
  { name: "Ioannina", lat: 39.665, lng: 20.8537 },
  { name: "Corfu", lat: 39.6243, lng: 19.9217 },
  { name: "Kozani", lat: 40.3, lng: 21.7889 },
];

function OfferRidePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Show loading while Clerk loads
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);

      // Get form values
      const origin = formData.get("origin") as string;
      const destination = formData.get("destination") as string;
      const departureTime = formData.get("departureTime") as string;
      const availableSeats = parseInt(formData.get("availableSeats") as string);
      const pricePerSeat = parseFloat(formData.get("pricePerSeat") as string);

      // Validate
      if (origin === destination) {
        throw new Error("Origin and destination cannot be the same");
      }

      // Find coordinates for origin and destination
      const originCity = GREEK_CITIES.find((city) => city.name === origin);
      const destCity = GREEK_CITIES.find((city) => city.name === destination);

      if (!originCity || !destCity) {
        throw new Error("Please select valid cities");
      }

      // Calculate approximate distance (straight line for MVP)
      const distance = Math.round(
        Math.sqrt(
          Math.pow(destCity.lat - originCity.lat, 2) +
            Math.pow(destCity.lng - originCity.lng, 2)
        ) * 111 // Convert to km (rough approximation)
      );

      // Create ride object
      const rideData = {
        driver_id: user?.id, // Use Clerk user ID
        origin,
        destination,
        origin_lat: originCity.lat,
        origin_lng: originCity.lng,
        destination_lat: destCity.lat,
        destination_lng: destCity.lng,
        departure_time: new Date(departureTime).toISOString(),
        available_seats: availableSeats,
        price_per_seat: pricePerSeat,
        route_distance: distance,
        route_duration: Math.round((distance / 80) * 60), // Assume 80 km/h average
      };

      console.log("Creating ride:", rideData);

      // Call API to create ride
      const response = await fetch("/api/rides/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rideData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create ride");
      }

      console.log("Ride created successfully:", result);
      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/my-rides");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating ride:", err);
      setError(err.message || "Failed to create ride. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Message */}
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h3 className="font-semibold text-emerald-800 mb-2">
            👋 Welcome, {user?.firstName || "Driver"}!
          </h3>
          <p className="text-sm text-emerald-600">
            You're now creating a ride as an authenticated user.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Offer a Ride</CardTitle>
            <CardDescription>
              Share your journey and help others travel sustainably
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  ❌ {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  ✅ Ride created successfully! Redirecting...
                </div>
              )}

              {/* Origin */}
              <div className="space-y-2">
                <Label htmlFor="origin">Origin City</Label>
                <select
                  id="origin"
                  name="origin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select departure city...</option>
                  {GREEK_CITIES.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination">Destination City</Label>
                <select
                  id="destination"
                  name="destination"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select destination city...</option>
                  {GREEK_CITIES.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

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

              {/* Available Seats and Price */}
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
                  <Label htmlFor="pricePerSeat">Price per Seat (€)</Label>
                  <Input
                    id="pricePerSeat"
                    name="pricePerSeat"
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
                <p className="font-medium mb-2">💡 How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Select your departure and destination cities</li>
                  <li>Set your departure time and available seats</li>
                  <li>Choose a fair price per seat</li>
                  <li>Passengers can book your ride</li>
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Offer Ride"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

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
    </div>
  );
}

export default OfferRidePage;
