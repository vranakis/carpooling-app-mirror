"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Clock, MapPin, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import AppHeader from "@/components/app-header";
import { getRideById } from "@/lib/actions/rides";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ManageBookingActions from "@/components/manage-booking-actions";

export default async function ManageBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const ride = await getRideById(params.id);

  if (!ride) {
    notFound();
  }

  // Get bookings from the ride
  const bookings = ride.bookings || [];
  const confirmedBookings = bookings.filter(
    (booking: any) => booking.status === "confirmed"
  );
  const pendingBookings = bookings.filter(
    (booking: any) => booking.status === "pending"
  );
  const totalBookedSeats = bookings.reduce(
    (total: number, booking: any) => total + booking.seats_booked,
    0
  );

  // Calculate duration and distance (in a real app, you would use a mapping API)
  const duration = ride.arrival_time
    ? `${Math.round(
        (new Date(ride.arrival_time).getTime() -
          new Date(ride.departure_time).getTime()) /
          (1000 * 60)
      )} min`
    : "45 min";

  const distance = "15 km"; // This would be calculated based on coordinates

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/my-rides" className="text-emerald-600 mb-4 inline-block">
            ← Back to my rides
          </Link>

          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-center">
                    <CardTitle>Manage your ride</CardTitle>
                    <Badge
                      className={
                        pendingBookings.length > 0
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                      }
                    >
                      {pendingBookings.length > 0
                        ? `${pendingBookings.length} pending request${
                            pendingBookings.length > 1 ? "s" : ""
                          }`
                        : confirmedBookings.length > 0
                        ? `${confirmedBookings.length} booking${
                            confirmedBookings.length > 1 ? "s" : ""
                          }`
                        : "No bookings yet"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div className="w-0.5 h-24 bg-gray-200"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-8">
                        <div className="font-medium text-lg">{ride.origin}</div>
                        <div className="text-gray-500">
                          {format(
                            new Date(ride.departure_time),
                            "EEEE, MMMM d, h:mm a"
                          )}
                        </div>
                        <div className="text-gray-500 mt-1">
                          Pickup:{" "}
                          {ride.origin_address || "Details will be shared"}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-lg">
                          {ride.destination}
                        </div>
                        <div className="text-gray-500">
                          {ride.arrival_time
                            ? format(
                                new Date(ride.arrival_time),
                                "EEEE, MMMM d, h:mm a"
                              )
                            : "Estimated arrival time"}
                        </div>
                        <div className="text-gray-500 mt-1">
                          Dropoff:{" "}
                          {ride.destination_address || "Details will be shared"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        {duration}
                      </div>
                      <div className="flex items-center justify-end text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {distance}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-gray-500">
                        {totalBookedSeats} of{" "}
                        {ride.available_seats + totalBookedSeats} seats booked
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="font-medium">
                        €{ride.contribution_amount}
                      </span>
                      <span className="text-gray-500"> per seat</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/ride/${ride.id}`}>View details</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Cancel ride
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Passenger bookings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {bookings.length > 0 ? (
                    <div className="divide-y">
                      {pendingBookings.map((booking: any) => (
                        <div
                          key={booking.id}
                          className="p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {booking.passenger_id.first_name?.[0]}
                                {booking.passenger_id.last_name?.[0]}
                              </AvatarFallback>
                              <AvatarImage
                                src={
                                  booking.passenger_id.avatar_url ||
                                  "/placeholder.svg?height=40&width=40"
                                }
                              />
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {booking.passenger_id.first_name}{" "}
                                {booking.passenger_id.last_name?.[0]}.
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Badge className="bg-yellow-500 mr-2">
                                  Pending
                                </Badge>
                                New request
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <div className="font-medium">
                                {booking.seats_booked} seat(s)
                              </div>
                              <div className="text-sm text-gray-500">
                                Requested{" "}
                                {format(new Date(booking.created_at), "MMM d")}
                              </div>
                            </div>
                            <ManageBookingActions bookingId={booking.id} />
                          </div>
                        </div>
                      ))}
                      {confirmedBookings.map((booking: any) => (
                        <div
                          key={booking.id}
                          className="p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {booking.passenger_id.first_name?.[0]}
                                {booking.passenger_id.last_name?.[0]}
                              </AvatarFallback>
                              <AvatarImage
                                src={
                                  booking.passenger_id.avatar_url ||
                                  "/placeholder.svg?height=40&width=40"
                                }
                              />
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {booking.passenger_id.first_name}{" "}
                                {booking.passenger_id.last_name?.[0]}.
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Badge className="bg-emerald-500 mr-2">
                                  Confirmed
                                </Badge>
                                Joining your ride
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <div className="font-medium">
                                {booking.seats_booked} seat(s)
                              </div>
                              <div className="text-sm text-gray-500">
                                Booked{" "}
                                {format(new Date(booking.created_at), "MMM d")}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/messages/${booking.passenger_id.id}?ride=${ride.id}`}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />{" "}
                                Message
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 mb-4">
                        No bookings yet for this ride.
                      </p>
                      <Button asChild variant="outline">
                        <Link href="/">Return to home</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Car className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">
                        {ride.vehicle?.make} {ride.vehicle?.model}
                      </div>
                      <div className="text-gray-500">
                        {ride.vehicle?.color} •{" "}
                        {new Date(ride.departure_time).getFullYear()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">
                        {ride.vehicle?.seats} seats total
                      </div>
                      <div className="text-gray-500">
                        {ride.available_seats} seat
                        {ride.available_seats !== 1 ? "s" : ""} still available
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per seat</span>
                    <span className="font-medium">
                      €{ride.contribution_amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booked seats</span>
                    <span className="font-medium">{totalBookedSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service fee</span>
                    <span className="font-medium">€0.00</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-bold">Total earnings</span>
                    <span className="font-bold">
                      €{(ride.contribution_amount || 0) * totalBookedSeats}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    This is a cost-sharing platform. All payments are handled
                    directly between riders and drivers.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ride.ride_preferences?.no_smoking && (
                      <Badge variant="outline" className="bg-gray-50">
                        <span className="mr-1">🚭</span> No smoking
                      </Badge>
                    )}
                    {ride.ride_preferences?.pets_allowed && (
                      <Badge variant="outline" className="bg-gray-50">
                        <span className="mr-1">🐾</span> Pets allowed
                      </Badge>
                    )}
                    {ride.ride_preferences?.music_allowed && (
                      <Badge variant="outline" className="bg-gray-50">
                        <span className="mr-1">🎵</span> Music friendly
                      </Badge>
                    )}
                    {ride.ride_preferences?.extra_luggage && (
                      <Badge variant="outline" className="bg-gray-50">
                        <span className="mr-1">💼</span> Extra luggage
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
