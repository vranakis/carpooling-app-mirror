"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import type { PlaceDetails } from "@/lib/actions/google-maps";
import { searchRidesWithDetour } from "@/lib/actions/rides";

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

export default function SmartSearchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [originPlace, setOriginPlace] = useState<PlaceDetails | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceDetails | null>(
    null
  );
  const [rides, setRides] = useState<RideMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Add place details to form data
      if (originPlace) {
        formData.append("originPlaceId", originPlace.placeId);
        formData.append(
          "originCoordinates",
          JSON.stringify(originPlace.coordinates)
        );
      }

      if (destinationPlace) {
        formData.append("destinationPlaceId", destinationPlace.placeId);
        formData.append(
          "destinationCoordinates",
          JSON.stringify(destinationPlace.coordinates)
        );
      }

      console.log("Searching with smart matching...");
      const result = await searchRidesWithDetour(formData);

      if (result.error) {
        setError(result.error);
        setRides([]);
      } else {
        setRides(result.rides || []);
        console.log(`Found ${result.rides?.length || 0} compatible rides`);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Search failed");
      setRides([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔍 Smart Ride Search
        </h1>
        <p className="text-gray-600">
          Find rides that match your route - even if they don't start or end at
          the exact same places!
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Where do you want to go?</CardTitle>
          <CardDescription>
            Enter your journey details and we'll find rides with overlapping
            routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServerAddressAutocomplete
                label="From"
                placeholder="Enter pickup location"
                name="origin"
                required
                onPlaceSelected={setOriginPlace}
              />

              <ServerAddressAutocomplete
                label="To"
                placeholder="Enter dropoff location"
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
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSearching || !originPlace || !destinationPlace}
                >
                  {isSearching ? (
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
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {rides.length > 0
                ? `Found ${rides.length} Compatible Rides`
                : "No Compatible Rides Found"}
            </h2>
          </div>

          {rides.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {rides.map((ride) => (
                <Card
                  key={ride.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Route Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                            {ride.origin} → {ride.destination}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(ride.departure_time).toLocaleString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {ride.available_seats} seats
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
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

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Driver's Original Route */}
                            <div className="bg-white rounded p-3">
                              <div className="text-gray-500 mb-1">
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
                              <div className="text-gray-500 mb-1">
                                Your Segment
                              </div>
                              <div className="font-semibold text-emerald-700">
                                {ride.passengerSegment?.distance}
                              </div>
                              <div className="text-gray-600">
                                {ride.passengerSegment?.duration}
                              </div>
                            </div>

                            {/* Detour Info */}
                            <div className="bg-white rounded p-3">
                              <div className="text-gray-500 mb-1">
                                Extra Detour
                              </div>
                              <div className="font-semibold text-orange-600">
                                +{ride.detourDistance} km
                              </div>
                              <div className="text-gray-600">
                                (+{ride.detourPercentage}%, +{ride.detourTime}
                                min)
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-600">
                            💡 This driver's route overlaps with yours. They
                            would need to make a small detour to pick you up and
                            drop you off.
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex gap-3">
                        <Link href={`/rides/${ride.id}`} className="flex-1">
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                            View Details & Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasSearched && !isSearching ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No compatible rides found
                </h3>
                <p className="text-gray-600 mb-6">
                  No drivers are going along this route right now.
                  <br />
                  Try adjusting your search or check back later!
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/rides">Browse All Rides</Link>
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <Link href="/offer-ride">Offer a Ride</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* How It Works */}
      {!hasSearched && (
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💡 How Smart Matching Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Traditional carpooling:</strong> Only matches if driver
              goes exactly from your start to your end.
            </p>
            <p>
              <strong>Our smart system:</strong> Finds drivers whose route
              overlaps with yours, even if they start/end elsewhere!
            </p>
            <div className="bg-white rounded-lg p-4 mt-4">
              <p className="font-semibold mb-2">Example:</p>
              <ul className="space-y-2 ml-4">
                <li>🚗 Driver: Athens → Thessaloniki</li>
                <li>👤 You need: Larissa → Katerini</li>
                <li>✅ Perfect match! Driver passes through both cities</li>
                <li>📊 System calculates the small detour needed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
