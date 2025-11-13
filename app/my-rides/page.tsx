"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Star, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function MyRidesPage() {
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the tab from URL params, default to "upcoming"
  const defaultTab = searchParams.get("tab") || "offering";

  const fetchData = async () => {
    try {
      if (!user) {
        console.log("No user found, cannot fetch rides");
        return;
      }

      setError(null); // Clear any previous errors
      console.log("Fetching rides for authenticated user...");

      // Fetch user's rides (as driver)
      // No need to pass userId - Clerk auth handles this server-side
      const ridesResponse = await fetch("/api/rides/my-rides");

      if (!ridesResponse.ok) {
        const errorData = await ridesResponse.json();
        throw new Error(errorData.error || "Failed to fetch rides");
      }

      const ridesData = await ridesResponse.json();

      console.log("✅ Fetched rides:", ridesData);

      if (ridesData.success) {
        setRides(ridesData.rides || []);
      } else {
        throw new Error(ridesData.error || "Failed to fetch rides");
      }

      // Fetch user's bookings (as passenger) - if you have this endpoint
      // const bookingsResponse = await fetch('/api/bookings/my-bookings')
      // const bookingsData = await bookingsResponse.json()
      // setBookings(bookingsData.bookings || [])

      setBookings([]); // For now, empty bookings
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching rides data:", error);
      setError(error.message || "Failed to load rides data");
      toast.error(error.message || "Failed to load rides data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    } else if (isLoaded && !user) {
      // User not authenticated, redirect to sign-in
      console.log("User not authenticated, redirecting to sign-in");
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchData();
      if (!error) {
        toast.success("Rides updated!");
      }
    } catch (error) {
      toast.error("Failed to refresh rides");
      console.error("Error refreshing rides:", error);
    }
  };

  // Show loading while Clerk loads
  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-gray-600">Loading your rides...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4 text-lg">
              ⚠️ Error Loading Rides
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={handleRefresh}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings?.filter(
    (booking) =>
      booking.status !== "cancelled" &&
      !isPast(new Date(booking.ride?.departure_time))
  );
  const pastBookings = bookings?.filter(
    (booking) =>
      booking.status === "completed" ||
      isPast(new Date(booking.ride?.departure_time))
  );

  const upcomingRides = rides?.filter(
    (ride) => !isPast(new Date(ride.departure_time)) && ride.status === "active"
  );
  const pastRides = rides?.filter(
    (ride) => isPast(new Date(ride.departure_time)) || ride.status !== "active"
  );

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">My Rides</h1>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="offering">My Offerings</TabsTrigger>
            <TabsTrigger value="past">Past Rides</TabsTrigger>
          </TabsList>

          {/* Upcoming Rides Tab */}
          <TabsContent value="upcoming" className="space-y-4 md:space-y-6">
            {upcomingBookings && upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <p className="text-gray-600">Booking details here...</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You don't have any upcoming bookings.
                </p>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                  <Link href="/">Find a ride</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Offerings Tab */}
          <TabsContent value="offering" className="space-y-4 md:space-y-6">
            <div className="flex justify-end items-center">
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                <Link href="/offer-ride">+ Offer a new ride</Link>
              </Button>
            </div>

            {upcomingRides && upcomingRides.length > 0 ? (
              upcomingRides.map((ride) => (
                <Card
                  key={ride.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="font-medium">
                        {ride.origin} → {ride.destination}
                      </div>
                      <Badge className="bg-emerald-500">Active</Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <div className="w-0.5 h-16 bg-gray-200"></div>
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-6">
                            <div>
                              <div className="font-medium">{ride.origin}</div>
                              <div className="text-sm text-gray-500">
                                {format(
                                  new Date(ride.departure_time),
                                  "MMM d, h:mm a"
                                )}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {ride.route_duration
                                ? `${Math.round(ride.route_duration / 60)} min`
                                : "~45 min"}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {ride.destination}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ride.estimated_arrival_time
                                ? format(
                                    new Date(ride.estimated_arrival_time),
                                    "MMM d, h:mm a"
                                  )
                                : "Estimated arrival"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-gray-500">
                            {ride.available_seats} seats available
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="font-medium">
                            €{ride.price_per_seat}
                          </span>
                          <span className="text-gray-500"> per seat</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/rides/${ride.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You're not offering any rides yet.
                </p>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                  <Link href="/offer-ride">Offer a ride</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Past Rides Tab */}
          <TabsContent value="past" className="space-y-4 md:space-y-6">
            {pastBookings && pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="hover:shadow-md transition-shadow opacity-75"
                >
                  <CardContent className="p-4">
                    <p className="text-gray-600">
                      Past booking details here...
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">You don't have any past rides.</p>
              </div>
            )}

            {pastRides && pastRides.length > 0 && (
              <>
                <div className="mt-8 mb-4">
                  <h3 className="text-lg font-medium text-gray-700">
                    Rides you've offered
                  </h3>
                </div>
                {pastRides.map((ride) => (
                  <Card
                    key={ride.id}
                    className="hover:shadow-md transition-shadow opacity-75"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {ride.origin} → {ride.destination}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(
                              new Date(ride.departure_time),
                              "MMM d, h:mm a"
                            )}
                          </div>
                        </div>
                        <Badge className="bg-gray-500">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
