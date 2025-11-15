"use client";

import { useState, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServerAddressAutocomplete } from "@/components/server-address-autocomplete";
import {
  Loader2,
  Search,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import type { PlaceDetails } from "@/lib/actions/google-maps";
import { searchRidesWithDetour } from "@/lib/actions/rides";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RideMatch {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  // Smart matching data
  originalRoute?: {
    distance: string;
    duration: string;
  };
  detourRoute?: {
    distance: string;
    duration: string;
  };
  passengerSegment?: {
    distance: string;
    duration: string;
  };
  detourDistance?: number;
  detourTime?: number;
  detourPercentage?: number;
}

export default function OptimizedSearchPage() {
  const [isPending, startTransition] = useTransition();
  const [originPlace, setOriginPlace] = useState<PlaceDetails | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceDetails | null>(
    null
  );
  const [rides, setRides] = useState<RideMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTime, setSearchTime] = useState<number>(0);

  // Validation state
  const canSearch = originPlace && destinationPlace;

  // Reset search results
  const handleReset = useCallback(() => {
    setRides([]);
    setError(null);
    setHasSearched(false);
    setSearchTime(0);
  }, []);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate before searching
    if (!canSearch) {
      setError("Please select both origin and destination addresses");
      return;
    }

    const startTime = Date.now();
    setError(null);
    setHasSearched(true);

    startTransition(async () => {
      try {
        const formData = new FormData(e.currentTarget);

        // Add place details to form data
        formData.append("originPlaceId", originPlace.placeId);
        formData.append(
          "originCoordinates",
          JSON.stringify(originPlace.coordinates)
        );
        formData.append("destinationPlaceId", destinationPlace.placeId);
        formData.append(
          "destinationCoordinates",
          JSON.stringify(destinationPlace.coordinates)
        );

        console.log("🔍 Starting smart search...");
        const result = await searchRidesWithDetour(formData);
        const endTime = Date.now();
        setSearchTime((endTime - startTime) / 1000);

        if (result.error) {
          setError(result.error);
          setRides([]);
        } else {
          setRides(result.rides || []);
          console.log(
            `✅ Found ${result.rides?.length || 0} rides in ${(
              (endTime - startTime) /
              1000
            ).toFixed(1)}s`
          );
        }
      } catch (err: any) {
        console.error("❌ Search error:", err);
        setError(err.message || "Search failed. Please try again.");
        setRides([]);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔍 Smart Ride Search
        </h1>
        <p className="text-gray-600">
          Find rides with overlapping routes - even if they don't start or end
          at the exact same places
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Where do you want to go?</CardTitle>
              <CardDescription>
                Select precise addresses for best route matching
              </CardDescription>
            </div>
            {hasSearched && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-gray-500"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServerAddressAutocomplete
                label="From"
                placeholder="e.g., Syntagma Square, Athens"
                name="origin"
                required
                onPlaceSelected={setOriginPlace}
              />

              <ServerAddressAutocomplete
                label="To"
                placeholder="e.g., White Tower, Thessaloniki"
                name="destination"
                required
                onPlaceSelected={setDestinationPlace}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date (Optional)</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  disabled={isPending}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to search all upcoming rides
                </p>
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isPending || !canSearch}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Rides
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Validation hint */}
            {!canSearch && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select both origin and destination using the dropdown
                  suggestions
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Loading State with Progress Info */}
      {isPending && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  Analyzing available rides...
                </p>
                <p className="text-sm text-blue-700">
                  Calculating route compatibility for each ride. This may take a
                  few seconds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && !isPending && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {hasSearched && !isPending && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {rides.length > 0
                ? `Found ${rides.length} Compatible Ride${
                    rides.length !== 1 ? "s" : ""
                  }`
                : "No Compatible Rides Found"}
            </h2>
            {rides.length > 0 && searchTime > 0 && (
              <span className="text-sm text-gray-500">
                Search completed in {searchTime.toFixed(1)}s
              </span>
            )}
          </div>

          {rides.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {rides.map((ride) => (
                <RideResultCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <EmptyResults />
          )}
        </div>
      )}

      {/* How It Works - Only show when no search yet */}
      {!hasSearched && <HowItWorksSection />}
    </div>
  );
}

// Extracted component for ride result card
function RideResultCard({ ride }: { ride: RideMatch }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Route Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span className="line-clamp-1">
                  {ride.origin} → {ride.destination}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {new Date(ride.departure_time).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{ride.available_seats} seats</span>
                </div>
              </div>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <div className="text-2xl font-bold text-emerald-600">
                €{ride.price_per_seat}
              </div>
              <div className="text-sm text-gray-500">per seat</div>
            </div>
          </div>

          {/* Smart Matching Info */}
          {ride.detourDistance !== undefined && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">
                  Smart Match Details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {/* Driver's Original Route */}
                <div className="bg-white rounded p-3">
                  <div className="text-gray-500 mb-1 text-xs">
                    Driver's Route
                  </div>
                  <div className="font-semibold text-gray-900">
                    {ride.originalRoute?.distance}
                  </div>
                  <div className="text-gray-600">
                    {ride.originalRoute?.duration}
                  </div>
                </div>

                {/* Your Segment */}
                <div className="bg-white rounded p-3">
                  <div className="text-gray-500 mb-1 text-xs">Your Segment</div>
                  <div className="font-semibold text-emerald-700">
                    {ride.passengerSegment?.distance}
                  </div>
                  <div className="text-gray-600">
                    {ride.passengerSegment?.duration}
                  </div>
                </div>

                {/* Detour Info */}
                <div className="bg-white rounded p-3">
                  <div className="text-gray-500 mb-1 text-xs">Extra Detour</div>
                  <div className="font-semibold text-orange-600">
                    +{ride.detourDistance} km
                  </div>
                  <div className="text-gray-600 text-xs">
                    +{ride.detourPercentage}% (+{ride.detourTime} min)
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600 bg-white rounded p-2">
                💡 This driver's route overlaps with yours. They would make a
                small {ride.detourDistance}km detour to accommodate you.
              </div>
            </div>
          )}

          {/* Action Button */}
          <Link href={`/rides/${ride.id}`} className="block">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              View Details & Book Ride
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyResults() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="text-gray-400 mb-4">
          <Search className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No compatible rides found
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          No drivers are currently going along this route. Try adjusting your
          search, checking a different date, or check back later!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/rides">Browse All Rides</Link>
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link href="/offer-ride">Offer a Ride</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// How it works section
function HowItWorksSection() {
  return (
    <Card className="mt-8 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💡 How Smart Matching Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-gray-700">
        <p>
          <strong>Traditional carpooling:</strong> Only matches if the driver
          goes exactly from your start to your destination.
        </p>
        <p>
          <strong>Our smart system:</strong> Finds drivers whose route overlaps
          with yours, even if they start or end elsewhere!
        </p>
        <div className="bg-white rounded-lg p-4 mt-4">
          <p className="font-semibold mb-2">Example:</p>
          <ul className="space-y-2 ml-4 list-none">
            <li>🚗 Driver: Athens → Thessaloniki (502 km)</li>
            <li>👤 You need: Larissa → Katerini (150 km)</li>
            <li>✅ Perfect match! Driver passes through both cities</li>
            <li>📊 System calculates the small detour needed (~10-20%)</li>
            <li>💰 You only pay for your segment of the journey</li>
          </ul>
        </div>
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro tip:</strong> Be specific with your addresses. The more
            precise your pickup/dropoff points, the better the matching!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
