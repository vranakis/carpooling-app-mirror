"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  Users,
  Leaf,
  MapPin,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  status: string;
}

export default function HomePage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rides");
      const data = await response.json();

      if (data.success) {
        setRides(data.rides || []);
        console.log(`✅ Homepage: Loaded ${data.count} rides`);
      } else {
        setError(data.error || "Failed to load rides");
      }
    } catch (err: any) {
      console.error("❌ Homepage: Error fetching rides:", err);
      setError(err.message || "Failed to fetch rides");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to Carpooling App! 🚗
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share rides, save money, and reduce your carbon footprint
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Find a Ride</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/available-rides">
              <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                Search Rides
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offer a Ride</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/offer-ride">
              <Button className="w-full" variant="outline">
                Create Ride
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Database</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/test-rides">
              <Button className="w-full" variant="outline">
                Test Rides
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/impact">
              <Button className="w-full" variant="outline">
                View Impact
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rides */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rides</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading rides..."
              : `Recent rides available - ${rides.length} ride${
                  rides.length !== 1 ? "s" : ""
                } found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-2 text-gray-600">Loading rides...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <Button onClick={fetchRides} variant="outline">
                Try Again
              </Button>
            </div>
          ) : rides && rides.length > 0 ? (
            <div className="space-y-4">
              {rides.slice(0, 5).map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {ride.origin} → {ride.destination}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(ride.departure_time).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{ride.available_seats} seats</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>€{ride.price_per_seat}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/rides/${ride.id}`}>
                    <Button size="sm" className="ml-4">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No rides available yet.</p>
              <Link href="/test-rides">
                <Button variant="outline">Create Test Ride</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🧪 Test Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/api/test-db" className="block">
              <Button variant="ghost" className="w-full justify-start text-sm">
                Database Connection Test
              </Button>
            </Link>
            <Link href="/test-rides" className="block">
              <Button variant="ghost" className="w-full justify-start text-sm">
                Manage Test Rides
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Database Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="text-gray-600 dark:text-gray-400">
              Database: Neon PostgreSQL
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Region: EU Central (Frankfurt)
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Status:{" "}
              {isLoading ? "Checking..." : error ? "Error ❌" : "Connected ✅"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">🔜 Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="text-gray-600 dark:text-gray-400">
              ✅ Database setup complete
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              ⏳ Authentication (Clerk)
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              ⏳ Payment integration
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              ⏳ Google Maps integration
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
